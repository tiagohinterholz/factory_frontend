import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ToastContext } from "@/modules/core/feedback/toast-context"
import { useServiceFiscalNote } from "./useServiceFiscalNote"
import { OrderService } from "@/modules/order/services/order"
import { orderKeys } from "@/modules/order/domain"

const toast = { success: vi.fn(), error: vi.fn(), info: vi.fn() }

function makeWrapper(queryClient) {
  return function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastContext.Provider value={toast}>{children}</ToastContext.Provider>
      </QueryClientProvider>
    )
  }
}

function setup(orderId = "1") {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const { result } = renderHook(() => useServiceFiscalNote(orderId), {
    wrapper: makeWrapper(queryClient),
  })
  return { result, queryClient }
}

beforeEach(() => vi.clearAllMocks())
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// avança o relógio falso em passos curtos até a condição bater (ou o teto),
// pra não depender de acertar exatamente quando o observer do TanStack Query
// reagenda o refetchInterval após cada atualização de dado.
async function advanceUntil(predicate, { step = 100, max = 10000 } = {}) {
  let elapsed = 0
  while (!predicate() && elapsed < max) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(step)
    })
    elapsed += step
  }
}

describe("useServiceFiscalNote", () => {
  it("busca a NFS-e da ordem (happy path)", async () => {
    const note = { id: 1, order: "1", status: "issued", number: "123" }
    vi.spyOn(OrderService, "getServiceFiscalNote").mockResolvedValue(note)
    const { result } = setup()

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.note).toEqual(note)
    expect(result.current.error).toBeNull()
  })

  it("404 (nunca solicitada) -> note null, sem erro", async () => {
    vi.spyOn(OrderService, "getServiceFiscalNote").mockRejectedValue({
      response: { status: 404 },
    })
    const { result } = setup()

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.note).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("erro diferente de 404 -> propaga em `error`, não vira null", async () => {
    const err = { response: { status: 500 } }
    vi.spyOn(OrderService, "getServiceFiscalNote").mockRejectedValue(err)
    const { result } = setup()

    await waitFor(() => expect(result.current.error).toBe(err))
    expect(result.current.note).toBeNull()
  })

  it("refaz a cada 3s enquanto pending/processing e para assim que emitida", async () => {
    vi.useFakeTimers()
    const getServiceFiscalNote = vi
      .spyOn(OrderService, "getServiceFiscalNote")
      .mockResolvedValueOnce({ id: 1, status: "pending" })
      .mockResolvedValueOnce({ id: 1, status: "processing" })
      .mockResolvedValueOnce({ id: 1, status: "issued", number: "123" })
      .mockResolvedValue({ id: 1, status: "issued", number: "123" })

    const { result } = setup()

    await advanceUntil(() => result.current.note?.status === "pending")
    expect(getServiceFiscalNote).toHaveBeenCalledTimes(1)

    await advanceUntil(() => result.current.note?.status === "processing")
    expect(getServiceFiscalNote).toHaveBeenCalledTimes(2)

    await advanceUntil(() => result.current.note?.status === "issued")
    expect(getServiceFiscalNote).toHaveBeenCalledTimes(3)

    // emitida (estado terminal): não deve mais refazer, mesmo passando vários
    // intervalos de 3s
    const callsAtIssued = getServiceFiscalNote.mock.calls.length
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000)
    })
    expect(getServiceFiscalNote).toHaveBeenCalledTimes(callsAtIssued)
  })

  it("mutation de emissão: sucesso atualiza o cache da query", async () => {
    vi.spyOn(OrderService, "getServiceFiscalNote").mockRejectedValue({
      response: { status: 404 },
    })
    const emitted = { id: 1, status: "pending" }
    vi.spyOn(OrderService, "requestServiceFiscalNote").mockResolvedValue(emitted)

    const { result, queryClient } = setup()
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.note).toBeNull()

    await act(async () => {
      result.current.emit()
    })

    await waitFor(() => expect(result.current.note).toEqual(emitted))
    expect(queryClient.getQueryData(orderKeys.serviceFiscalNote("1"))).toEqual(emitted)
  })

  it("mutation de emissão: erro mostra toast com a mensagem da API", async () => {
    vi.spyOn(OrderService, "getServiceFiscalNote").mockRejectedValue({
      response: { status: 404 },
    })
    vi.spyOn(OrderService, "requestServiceFiscalNote").mockRejectedValue({
      response: { status: 400, data: { detail: "Ordem sem serviço ativo." } },
    })

    const { result } = setup()
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      result.current.emit()
    })

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Ordem sem serviço ativo."))
  })
})
