import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ToastProvider } from "@/modules/core/feedback/ToastProvider"
import { AuthProvider } from "@/modules/auth/context/AuthProvider"
import { useOrderForm } from "./useOrderForm"
import { OrderService } from "../services/order"
import { AppointmentService } from "@/modules/appointment/services/appointment"

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateSpy }
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <ToastProvider>
      <AuthProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </AuthProvider>
    </ToastProvider>
  </QueryClientProvider>
)

beforeEach(() => {
  navigateSpy.mockClear()
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

describe("useOrderForm", () => {
  it("após criar a casca, vai direto pra edição da OS ('Prosseguir para Itens')", async () => {
    const create = vi.spyOn(OrderService, "createOrder").mockResolvedValue({ id: 12 })
    const { result } = renderHook(() => useOrderForm({ clientId: 5, vehicleId: 9 }), { wrapper })

    await act(async () => {
      await result.current.onSubmit()
    })

    expect(create).toHaveBeenCalled()
    expect(navigateSpy).toHaveBeenCalledWith("/ordens/12")
    create.mockRestore()
  })

  it("vindo de um agendamento, liga a OS nova nele (PATCH order_id) antes de redirecionar", async () => {
    const create = vi.spyOn(OrderService, "createOrder").mockResolvedValue({ id: 12 })
    const link = vi.spyOn(AppointmentService, "linkAppointment").mockResolvedValue({})
    const { result } = renderHook(
      () => useOrderForm({ clientId: 5, vehicleId: 9, appointmentId: 4 }),
      { wrapper },
    )

    await act(async () => {
      await result.current.onSubmit()
    })

    expect(link).toHaveBeenCalledWith(4, { order_id: 12 })
    expect(navigateSpy).toHaveBeenCalledWith("/ordens/12")
    create.mockRestore()
    link.mockRestore()
  })

  it("sem appointmentId não toca no agendamento", async () => {
    const create = vi.spyOn(OrderService, "createOrder").mockResolvedValue({ id: 12 })
    const link = vi.spyOn(AppointmentService, "linkAppointment").mockResolvedValue({})
    const { result } = renderHook(() => useOrderForm({ clientId: 5, vehicleId: 9 }), { wrapper })

    await act(async () => {
      await result.current.onSubmit()
    })

    expect(link).not.toHaveBeenCalled()
    create.mockRestore()
    link.mockRestore()
  })
})
