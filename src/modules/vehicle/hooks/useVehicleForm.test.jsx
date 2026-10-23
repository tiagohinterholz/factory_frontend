import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ToastProvider } from "@/modules/core/feedback/ToastProvider"
import { AuthProvider } from "@/modules/auth/context/AuthProvider"
import { useVehicleForm } from "./useVehicleForm"
import { VehicleService } from "../services/vehicle"
import { vehicleDefaults } from "../domain"

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

// vehicleDefaults puro não passa no zodResolver (business_id/client_id/marca/
// modelo/ano/placa/combustível obrigatórios) — mínimo válido pra exercitar o
// submit real.
const validVehicleValues = {
  ...vehicleDefaults,
  business_id: "3",
  client_id: "9",
  manufacturer_id: "1",
  model_id: "1",
  year: "2020",
  year_model: "2020",
  plate: "ABC-1234",
  fuel: "1",
}

describe("useVehicleForm", () => {
  it("chamado com só { clientId } (como hoje), comportamento idêntico a hoje: navega pra /veiculos", async () => {
    const create = vi.spyOn(VehicleService, "createVehicle").mockResolvedValue({ id: 11 })
    const { result } = renderHook(() => useVehicleForm({ clientId: 9 }), { wrapper })

    act(() => {
      result.current.form.reset(validVehicleValues)
    })
    await act(async () => {
      await result.current.onSubmit()
    })

    expect(create).toHaveBeenCalled()
    expect(navigateSpy).toHaveBeenCalledWith("/veiculos")
    create.mockRestore()
  })

  it("com clientId + redirectTo: null + onSuccess, NÃO navega e chama onSuccess com o veículo criado", async () => {
    const create = vi
      .spyOn(VehicleService, "createVehicle")
      .mockResolvedValue({ id: 11, plate: "ABC-1234" })
    const onSuccess = vi.fn()
    const { result } = renderHook(
      () => useVehicleForm({ clientId: 9, redirectTo: null, onSuccess }),
      { wrapper },
    )

    act(() => {
      result.current.form.reset(validVehicleValues)
    })
    await act(async () => {
      await result.current.onSubmit()
    })

    expect(create).toHaveBeenCalled()
    expect(navigateSpy).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledWith({ id: 11, plate: "ABC-1234" })
    create.mockRestore()
  })
})
