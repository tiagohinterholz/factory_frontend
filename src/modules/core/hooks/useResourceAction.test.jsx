import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ToastContext } from "@/modules/core/feedback/toast-context"
import { ConfirmContext } from "@/modules/core/feedback/confirm-context"
import { useResourceAction } from "./useResourceAction"

const toast = { success: vi.fn(), error: vi.fn(), info: vi.fn() }
let confirmResolves = true
const confirmSpy = vi.fn(() => Promise.resolve(confirmResolves))

function makeWrapper(queryClient) {
  return function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastContext.Provider value={toast}>
          <ConfirmContext.Provider value={confirmSpy}>{children}</ConfirmContext.Provider>
        </ToastContext.Provider>
      </QueryClientProvider>
    )
  }
}

function setup(options) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries")
  const { result } = renderHook(() => useResourceAction(options), {
    wrapper: makeWrapper(queryClient),
  })
  return { result, invalidateSpy }
}

beforeEach(() => {
  vi.clearAllMocks()
  confirmResolves = true
})

describe("useResourceAction", () => {
  it("confirm (objeto): confirma -> roda a mutation com o arg de run", async () => {
    const mutationFn = vi.fn().mockResolvedValue({ ok: true })
    const { result } = setup({ mutationFn, confirm: { title: "Excluir?" } })

    await act(async () => {
      await result.current.run(5)
    })

    expect(confirmSpy).toHaveBeenCalledWith({ title: "Excluir?" })
    expect(mutationFn).toHaveBeenCalledWith(5, expect.anything())
  })

  it("confirm (objeto): cancela -> não roda a mutation, resolve undefined", async () => {
    confirmResolves = false
    const mutationFn = vi.fn().mockResolvedValue({})
    const { result } = setup({ mutationFn, confirm: { title: "Excluir?" } })

    let ret
    await act(async () => {
      ret = await result.current.run(5)
    })

    expect(mutationFn).not.toHaveBeenCalled()
    expect(ret).toBeUndefined()
  })

  it("confirm (função): monta a mensagem a partir do arg", async () => {
    const mutationFn = vi.fn().mockResolvedValue({})
    const { result } = setup({
      mutationFn,
      confirm: (item) => ({ title: `Excluir #${item.id}?` }),
    })

    await act(async () => {
      await result.current.run({ id: 7 })
    })

    expect(confirmSpy).toHaveBeenCalledWith({ title: "Excluir #7?" })
  })

  it("sem confirm: executa direto, sem diálogo", async () => {
    const mutationFn = vi.fn().mockResolvedValue({})
    const { result } = setup({ mutationFn })

    await act(async () => {
      await result.current.run(1)
    })

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(mutationFn).toHaveBeenCalledWith(1, expect.anything())
  })

  it("success (string): toast de sucesso", async () => {
    const { result } = setup({ mutationFn: vi.fn().mockResolvedValue({}), success: "Feito." })
    await act(async () => {
      await result.current.run()
    })
    expect(toast.success).toHaveBeenCalledWith("Feito.")
  })

  it("success (função): recebe (arg, result)", async () => {
    const { result } = setup({
      mutationFn: vi.fn().mockResolvedValue({ id: 42 }),
      success: (arg, res) => `OS #${res.id} a partir de ${arg}`,
    })
    await act(async () => {
      await result.current.run(9)
    })
    expect(toast.success).toHaveBeenCalledWith("OS #42 a partir de 9")
  })

  it("sem success: nenhum toast de sucesso", async () => {
    const { result } = setup({ mutationFn: vi.fn().mockResolvedValue({}) })
    await act(async () => {
      await result.current.run()
    })
    expect(toast.success).not.toHaveBeenCalled()
  })

  it("erro: toast.error com parseApiError, resolve undefined e NÃO relança", async () => {
    const err = { response: { data: { detail: "Não pode." }, status: 400 } }
    const { result } = setup({
      mutationFn: vi.fn().mockRejectedValue(err),
      errorFallback: "Falhou.",
    })

    let ret
    let threw = false
    await act(async () => {
      try {
        ret = await result.current.run()
      } catch {
        threw = true
      }
    })

    expect(threw).toBe(false)
    expect(ret).toBeUndefined()
    expect(toast.error).toHaveBeenCalledWith("Não pode.")
  })

  it("erro com response mas sem detail: usa o errorFallback", async () => {
    const { result } = setup({
      mutationFn: vi.fn().mockRejectedValue({ response: { status: 400, data: {} } }),
      errorFallback: "Falhou feio.",
    })
    await act(async () => {
      await result.current.run()
    })
    expect(toast.error).toHaveBeenCalledWith("Falhou feio.")
  })

  it("erro de rede (sem response): mensagem de conexão", async () => {
    const { result } = setup({ mutationFn: vi.fn().mockRejectedValue(new Error("boom")) })
    await act(async () => {
      await result.current.run()
    })
    expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/conex/i))
  })

  it("rethrow: relança o erro depois do toast", async () => {
    const err = new Error("x")
    const { result } = setup({ mutationFn: vi.fn().mockRejectedValue(err), rethrow: true })

    let caught
    await act(async () => {
      try {
        await result.current.run()
      } catch (e) {
        caught = e
      }
    })

    expect(caught).toBe(err)
    expect(toast.error).toHaveBeenCalled()
  })

  it("invalidate: invalida cada queryKey no sucesso", async () => {
    const { result, invalidateSpy } = setup({
      mutationFn: vi.fn().mockResolvedValue({}),
      invalidate: [["orders"], ["dashboard"]],
    })

    await act(async () => {
      await result.current.run()
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["orders"] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["dashboard"] })
  })

  it("invalidate: NÃO invalida quando a mutation falha", async () => {
    const { result, invalidateSpy } = setup({
      mutationFn: vi.fn().mockRejectedValue(new Error("no")),
      invalidate: [["orders"]],
    })
    await act(async () => {
      await result.current.run()
    })
    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ["orders"] })
  })

  it("onSuccess: chamado com (result, arg)", async () => {
    const onSuccess = vi.fn()
    const { result } = setup({
      mutationFn: vi.fn().mockResolvedValue({ id: 1 }),
      onSuccess,
    })
    await act(async () => {
      await result.current.run("arg")
    })
    expect(onSuccess).toHaveBeenCalledWith({ id: 1 }, "arg")
  })

  it("pending: true enquanto a mutation está em voo, false depois", async () => {
    let resolveFn
    const mutationFn = vi.fn(() => new Promise((res) => (resolveFn = res)))
    const { result } = setup({ mutationFn })

    expect(result.current.pending).toBe(false)

    let runPromise
    act(() => {
      runPromise = result.current.run()
    })
    await waitFor(() => expect(result.current.pending).toBe(true))

    await act(async () => {
      resolveFn({})
      await runPromise
    })
    await waitFor(() => expect(result.current.pending).toBe(false))
  })

  it("run resolve com o resultado da mutation no sucesso", async () => {
    const { result } = setup({ mutationFn: vi.fn().mockResolvedValue({ id: 99 }) })
    let ret
    await act(async () => {
      ret = await result.current.run()
    })
    expect(ret).toEqual({ id: 99 })
  })
})
