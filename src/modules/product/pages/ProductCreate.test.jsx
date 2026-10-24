import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ProductCreate from "./ProductCreate"

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
    http.get(`${API}/produtos/`, () => HttpResponse.json({ results: [], count: 0 })),
    http.get(`${API}/categorias-produto/`, () => HttpResponse.json({ results: [], count: 0 })),
  )
}

beforeEach(() => {
  navigateSpy.mockClear()
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

function supplierCombobox() {
  return screen
    .getAllByRole("combobox")
    .find((el) => el.id?.startsWith("headlessui-combobox-input"))
}

describe("<ProductCreate>", () => {
  it("usa SupplierLiveSelect (combobox com busca) no campo Fornecedor", async () => {
    mockApi()
    renderWithProviders(<ProductCreate />)

    await screen.findByText("Fornecedor *")
    expect(supplierCombobox()).toBeInTheDocument()
  })

  it("Unidade de Medida é texto livre com sugestões, não <select> fechado", async () => {
    mockApi()
    renderWithProviders(<ProductCreate />)

    await screen.findByText("Unidade de Medida")
    const input = screen.getByText("Unidade de Medida").closest("div").querySelector("input")
    expect(input).toHaveAttribute("list")
  })

  it("ao salvar com sucesso, abre o modal de saída financeira; ao recusar, navega pra /produtos", async () => {
    mockApi()
    server.use(
      http.post(`${API}/produtos/`, () =>
        HttpResponse.json(
          { id: 50, name: "Óleo 5W30", cost_price: 20, stock_quantity: 10 },
          {
            status: 201,
          },
        ),
      ),
    )
    renderWithProviders(<ProductCreate />)
    const user = userEvent.setup()

    await screen.findByText("Fornecedor *")
    const supplierInput = supplierCombobox()
    await user.click(supplierInput)
    await user.click(await screen.findByRole("option", { name: "Bosch Ltda" }))

    await user.type(screen.getByPlaceholderText("Ex: Óleo 5W30"), "Óleo 5W30")

    fireEvent.change(screen.getByText("Qtd em Estoque").closest("div").querySelector("input"), {
      target: { value: "10" },
    })
    fireEvent.change(screen.getByText("Preço Unitário").closest("div").querySelector("input"), {
      target: { value: "5000" },
    })

    fireEvent.click(screen.getByRole("button", { name: /adicionar produto/i }))

    expect(
      await screen.findByRole("dialog", { name: /registrar saída financeira/i }),
    ).toBeInTheDocument()
    expect(navigateSpy).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole("button", { name: "Não" }))

    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith("/produtos"))
  })
})
