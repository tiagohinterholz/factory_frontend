import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ToastProvider } from "@/modules/core/feedback/ToastProvider"
import { AuthProvider } from "@/modules/auth/context/AuthProvider"
import { useBudgetForm } from "./useBudgetForm"
import { BudgetService } from "../services/budgets"

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

describe("useBudgetForm", () => {
  it("após criar, vai direto pro orçamento novo (etapa 'Prosseguir para Itens')", async () => {
    const create = vi.spyOn(BudgetService, "createBudget").mockResolvedValue({ id: 7 })
    const { result } = renderHook(() => useBudgetForm({ clientId: 5, vehicleId: 9 }), { wrapper })

    await act(async () => {
      await result.current.onSubmit()
    })

    expect(create).toHaveBeenCalled()
    expect(navigateSpy).toHaveBeenCalledWith("/orcamentos/7")
    create.mockRestore()
  })
})
