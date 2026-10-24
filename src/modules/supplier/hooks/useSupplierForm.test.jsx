import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ToastProvider } from "@/modules/core/feedback/ToastProvider"
import { AuthProvider } from "@/modules/auth/context/AuthProvider"
import { useSupplierForm } from "./useSupplierForm"
import { SupplierService } from "../services/supplier"
import { supplierDefaults } from "../domain"

const validValues = {
  ...supplierDefaults,
  business_id: "3",
  corporate_name: "Fornecedora de Insumos LTDA",
  cnpj: "11.222.333/0001-81",
  state_id: "1",
  city_id: "1",
  address: "Rua das Flores",
  number: "100",
  phone: "(11) 91234-5678",
  email: "contato@fornecedor.com",
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

describe("useSupplierForm", () => {
  it("sem argumentos, comportamento idêntico a hoje: navega pra /fornecedores no sucesso", async () => {
    const create = vi.spyOn(SupplierService, "createSupplier").mockResolvedValue({ id: 7 })
    const { result } = renderHook(() => useSupplierForm(), { wrapper })

    act(() => {
      result.current.form.reset(validValues)
    })
    await act(async () => {
      await result.current.onSubmit()
    })

    expect(create).toHaveBeenCalled()
    expect(navigateSpy).toHaveBeenCalledWith("/fornecedores")
    create.mockRestore()
  })

  it("com redirectTo: null e onSuccess, NÃO navega e chama onSuccess com o fornecedor criado", async () => {
    const create = vi
      .spyOn(SupplierService, "createSupplier")
      .mockResolvedValue({ id: 7, corporate_name: "Fornecedora de Insumos LTDA" })
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useSupplierForm({ redirectTo: null, onSuccess }), {
      wrapper,
    })

    act(() => {
      result.current.form.reset(validValues)
    })
    await act(async () => {
      await result.current.onSubmit()
    })

    expect(create).toHaveBeenCalled()
    expect(navigateSpy).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledWith({ id: 7, corporate_name: "Fornecedora de Insumos LTDA" })
    create.mockRestore()
  })
})
