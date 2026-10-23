import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ToastProvider } from "@/modules/core/feedback/ToastProvider"
import { AuthProvider } from "@/modules/auth/context/AuthProvider"
import { useClientForm } from "./useClientForm"
import { ClientService } from "../services/client"
import { clientDefaults } from "../domain"

// clientDefaults puro não passa no zodResolver (cpf/nome/estado/cidade/telefone
// obrigatórios pra PF) — valores mínimos válidos pra exercitar o submit real.
const validPfValues = {
  ...clientDefaults,
  first_name: "Ana",
  last_name: "Silva",
  cpf: "123.456.789-01",
  state_id: "1",
  city_id: "1",
  phone: "(11) 91234-5678",
}

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

describe("useClientForm", () => {
  it("sem argumentos, comportamento idêntico a hoje: navega pra /clientes no sucesso", async () => {
    const create = vi.spyOn(ClientService, "createClient").mockResolvedValue({ id: 7 })
    const { result } = renderHook(() => useClientForm(), { wrapper })

    act(() => {
      result.current.form.reset(validPfValues)
    })
    await act(async () => {
      await result.current.onSubmit()
    })

    expect(create).toHaveBeenCalled()
    expect(navigateSpy).toHaveBeenCalledWith("/clientes")
    create.mockRestore()
  })

  it("com redirectTo: null e onSuccess, NÃO navega e chama onSuccess com o cliente criado", async () => {
    const create = vi.spyOn(ClientService, "createClient").mockResolvedValue({ id: 7, name: "Ana" })
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useClientForm({ redirectTo: null, onSuccess }), {
      wrapper,
    })

    act(() => {
      result.current.form.reset(validPfValues)
    })
    await act(async () => {
      await result.current.onSubmit()
    })

    expect(create).toHaveBeenCalled()
    expect(navigateSpy).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledWith({ id: 7, name: "Ana" })
    create.mockRestore()
  })
})
