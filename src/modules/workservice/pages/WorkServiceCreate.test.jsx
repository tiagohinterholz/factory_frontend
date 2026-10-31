import { describe, it, expect, beforeEach } from "vitest"
import { screen, fireEvent, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import WorkServiceCreate from "./WorkServiceCreate"

function mockApi() {
  server.use(
    http.get(`${API}/fornecedores/`, () =>
      HttpResponse.json({ results: [{ id: 9, corporate_name: "Bosch Ltda" }], count: 1 }),
    ),
  )
}

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

function supplierCombobox() {
  return screen
    .getAllByRole("combobox")
    .find((el) => el.id?.startsWith("headlessui-combobox-input"))
}

describe("<WorkServiceCreate>", () => {
  it("tem o campo de preço de custo (opcional), além do preço de venda (CVSP-P3-07)", async () => {
    mockApi()
    renderWithProviders(<WorkServiceCreate />)

    expect(await screen.findByText("Preço Unitário")).toBeInTheDocument()
    expect(screen.getByText("Preço de Custo (opcional)")).toBeInTheDocument()
  })

  it("usa SupplierLiveSelect (combobox com busca) no campo Fornecedor, sem o botão de cadastrar à parte", async () => {
    mockApi()
    renderWithProviders(<WorkServiceCreate />)

    await screen.findByText("Fornecedor")
    expect(supplierCombobox()).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Cadastrar novo fornecedor" }),
    ).not.toBeInTheDocument()
  })

  it("cadastra um fornecedor inline sem perder os outros campos já preenchidos", async () => {
    mockApi()
    server.use(
      http.get(`${API}/estados/`, () =>
        HttpResponse.json({ results: [{ id: 1, name: "Paraná" }], count: 1 }),
      ),
      http.get(`${API}/estados/1/cidades/`, () =>
        HttpResponse.json({ results: [{ id: 10, name: "Curitiba" }], count: 1 }),
      ),
      http.post(`${API}/fornecedores/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 20, ...body }, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    renderWithProviders(<WorkServiceCreate />)

    await screen.findByText("Fornecedor")
    await user.type(screen.getByPlaceholderText("Ex: Troca de óleo"), "Troca de óleo")

    const input = supplierCombobox()
    await user.click(input)
    await user.click(await screen.findByRole("option", { name: "Cadastrar novo fornecedor" }))

    const dialog = await screen.findByRole("dialog")
    await user.type(
      within(dialog).getByPlaceholderText("Ex: Fornecedora de Insumos LTDA"),
      "Nova Peças Ltda",
    )
    await user.type(within(dialog).getByPlaceholderText("00.000.000/0000-00"), "11222333000181")
    await user.type(within(dialog).getByPlaceholderText("contato@fornecedor.com"), "contato@nova.com")
    await user.type(within(dialog).getByPlaceholderText("(00) 00000-0000"), "11912345678")
    await user.selectOptions(
      within(dialog).getByText("Estado").closest("div").querySelector("select"),
      "1",
    )
    await waitFor(() => {
      const citySelect = within(dialog).getByText("Cidade").closest("div").querySelector("select")
      expect(citySelect).not.toBeDisabled()
    })
    await user.selectOptions(
      within(dialog).getByText("Cidade").closest("div").querySelector("select"),
      "10",
    )
    await user.type(within(dialog).getByPlaceholderText("Rua, Avenida, etc."), "Rua das Flores")
    await user.type(within(dialog).getByPlaceholderText("123"), "100")
    await user.click(within(dialog).getByRole("button", { name: "Salvar Fornecedor" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByPlaceholderText("Ex: Troca de óleo")).toHaveValue("Troca de óleo")
  })

  it("envia cost_price quando informado", async () => {
    mockApi()
    let receivedBody
    server.use(
      http.post(`${API}/servicos/`, async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json({ id: 1, ...receivedBody }, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    renderWithProviders(<WorkServiceCreate />)

    await screen.findByText("Fornecedor")
    const input = supplierCombobox()
    await user.click(input)
    await user.click(await screen.findByRole("option", { name: "Bosch Ltda" }))

    fireEvent.change(screen.getByPlaceholderText("Ex: Troca de óleo"), {
      target: { value: "Troca de óleo" },
    })
    fireEvent.change(screen.getByPlaceholderText("Detalhes técnicos..."), {
      target: { value: "Serviço completo" },
    })
    fireEvent.change(screen.getByText("Preço Unitário").closest("div").querySelector("input"), {
      target: { value: "10000" },
    })
    fireEvent.change(
      screen.getByText("Preço de Custo (opcional)").closest("div").querySelector("input"),
      { target: { value: "5000" } },
    )

    fireEvent.click(screen.getByRole("button", { name: /adicionar serviço/i }))

    await waitFor(() => expect(receivedBody).toBeTruthy())
    expect(receivedBody.cost_price).toBe(50)
  })
})
