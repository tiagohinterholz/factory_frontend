import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useAppointment } from "./useAppointment"
import { AppointmentService } from "@/modules/appointment/services/appointment"

function Wrapper({ children }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe("useAppointment", () => {
  beforeEach(() => vi.restoreAllMocks())

  it("busca todas as páginas — o back ordena por data/hora ascendente, então um agendamento de hoje/futuro pode estar em qualquer página, não só a 1ª", async () => {
    const oldOnes = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      date: "2026-01-01",
      time: "08:00:00",
    }))
    const today = { id: 21, date: "2026-09-12", time: "10:00:00" }

    vi.spyOn(AppointmentService, "getAppointment").mockImplementation(({ page }) =>
      Promise.resolve(
        page === 1 ? { results: oldOnes, count: 11 } : { results: [today], count: 11 },
      ),
    )

    const { result } = renderHook(() => useAppointment(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(AppointmentService.getAppointment).toHaveBeenCalledWith({ page: 1 })
    expect(AppointmentService.getAppointment).toHaveBeenCalledWith({ page: 2 })
    expect(result.current.appointments).toHaveLength(11)
    expect(result.current.appointments.some((appointment) => appointment.id === 21)).toBe(true)
  })

  it("erro na busca vai pra `error`, sem quebrar", async () => {
    vi.spyOn(AppointmentService, "getAppointment").mockRejectedValue(new Error("boom"))

    const { result } = renderHook(() => useAppointment(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
    expect(result.current.appointments).toEqual([])
  })
})
