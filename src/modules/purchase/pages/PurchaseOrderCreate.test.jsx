import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import PurchaseOrderCreate from "./PurchaseOrderCreate"

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateSpy }
})

function mockApi() {
  server.use(
    http.get(`${API}/fornecedores/`, () =>
      HttpResponse.json({ results: [{ id: 9, corporate_name: "Bosch Ltda" }], count: 1 }),
    ),
  )
}

beforeEach(() => {
  navigateSpy.mockClear()
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

describe("<PurchaseOrderCreate>", () => {
  it("usa SupplierLiveSelect (combobox com busca) no campo Fornecedor", async () => {
    mockApi()
    renderWithProviders(<PurchaseOrderCreate />)

    await screen.findByText("Fornecedor")
    expect(await screen.findByRole("combobox")).toBeInTheDocument()
  })

  it("botão 'ver fornecedor vinculado' habilita ao escolher o fornecedor e navega pra /fornecedores/:id", async () => {
    mockApi()
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrderCreate />)

    const input = await screen.findByRole("combobox")
    const viewButton = screen.getByRole("button", { name: "Ver fornecedor vinculado" })
    expect(viewButton).toBeDisabled()

    await user.click(input)
    await user.click(await screen.findByRole("option", { name: "Bosch Ltda" }))

    await waitFor(() => expect(viewButton).toBeEnabled())
    await user.click(viewButton)

    expect(navigateSpy).toHaveBeenCalledWith("/fornecedores/9")
  })
})
