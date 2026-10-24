import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import SupplierCreate from "./SupplierCreate"

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateSpy }
})

function mockApi() {
  server.use(
    http.get(`${API}/estados/`, () =>
      HttpResponse.json({ results: [{ id: 1, name: "Paraná", abbreviation: "PR" }], count: 1 }),
    ),
    http.get(`${API}/estados/1/cidades/`, () =>
      HttpResponse.json({ results: [{ id: 1, name: "Curitiba" }], count: 1 }),
    ),
  )
}

beforeEach(() => {
  navigateSpy.mockClear()
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

describe("<SupplierCreate>", () => {
  it("marca os campos obrigatórios com *", async () => {
    mockApi()
    renderWithProviders(<SupplierCreate />)

    expect(await screen.findByText("Razão Social *")).toBeInTheDocument()
    expect(screen.getByText("CNPJ *")).toBeInTheDocument()
    expect(screen.getByText("E-mail *")).toBeInTheDocument()
    expect(screen.getByText("Telefone *")).toBeInTheDocument()
    expect(screen.getByText("Estado *")).toBeInTheDocument()
    expect(screen.getByText("Cidade *")).toBeInTheDocument()
    expect(screen.getByText("Endereço *")).toBeInTheDocument()
    expect(screen.getByText("Número *")).toBeInTheDocument()
    expect(screen.getByText("Nome Fantasia")).toBeInTheDocument()
  })

  it("ao criar com sucesso, redireciona pra edição do fornecedor recém-criado (não pra /fornecedores)", async () => {
    mockApi()
    server.use(
      http.post(`${API}/fornecedores/`, () => HttpResponse.json({ id: 42 }, { status: 201 })),
    )
    renderWithProviders(<SupplierCreate />)
    const user = userEvent.setup()

    await user.type(await screen.findByPlaceholderText("Ex: Fornecedora de Insumos LTDA"), "ACME")
    await user.type(screen.getByPlaceholderText("00.000.000/0000-00"), "11222333000181")
    await user.type(screen.getByPlaceholderText("contato@fornecedor.com"), "contato@acme.com")
    const [stateSelect] = screen.getAllByRole("combobox")
    await user.selectOptions(stateSelect, "1")
    await screen.findByText("Curitiba")
    const [, citySelect] = screen.getAllByRole("combobox")
    await user.selectOptions(citySelect, "1")
    await user.type(screen.getByPlaceholderText("Rua, Avenida, etc."), "Rua das Flores")
    await user.type(screen.getByPlaceholderText("123"), "100")
    await user.type(screen.getByPlaceholderText("(00) 00000-0000"), "41912345678")

    fireEvent.click(screen.getByRole("button", { name: /salvar fornecedor/i }))

    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith("/fornecedores/42"))
  })
})
