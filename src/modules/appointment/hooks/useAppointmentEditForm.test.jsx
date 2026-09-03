import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ToastProvider } from "@/modules/core/feedback/ToastProvider"
import { useAppointmentEditForm } from "./useAppointmentEditForm"
import { AppointmentService } from "@/modules/appointment/services/appointment"

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateSpy, useParams: () => ({ id: "1" }) }
})

vi.mock("@/modules/core/feedback/confirm-context", () => ({
  useConfirm: () => () => Promise.resolve(true),
}))

beforeEach(() => {
  navigateSpy.mockClear()
  vi.spyOn(AppointmentService, "getAppointmentById").mockResolvedValue({
    business: 1,
    client: 1,
    vehicle: 1,
    order: 1,
    date: "2026-09-07",
    time: "14:00",
    observation: "",
  })
  vi.spyOn(AppointmentService, "deleteAppointment").mockResolvedValue(undefined)
})

describe("useAppointmentEditForm", () => {
  it("handleDelete invalida o cache antes de navegar", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries")
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter>{children}</MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    )

    const { result } = renderHook(() => useAppointmentEditForm(), { wrapper })
    await waitFor(() => expect(AppointmentService.getAppointmentById).toHaveBeenCalled())

    await act(async () => {
      await result.current.handleDelete()
    })

    expect(AppointmentService.deleteAppointment).toHaveBeenCalledWith("1")
    expect(invalidateSpy).toHaveBeenCalled()
    expect(navigateSpy).toHaveBeenCalledWith("/agendamentos")
  })
})
