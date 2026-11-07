import { describe, it, expect, vi } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import SupplierLiveSelect from "./SupplierLiveSelect"

function mockSuppliers(results = []) {
  server.use(
    http.get(`${API}/fornecedores/`, () => HttpResponse.json({ results, count: results.length })),
  )
}

describe("<SupplierLiveSelect>", () => {
  it("coloca o fornecedor-espelho (is_business_mirror) primeiro, mesmo vindo depois na resposta da API", async () => {
    mockSuppliers([
      { id: 1, corporate_name: "Fornecedor Alfa", is_business_mirror: false },
      { id: 2, corporate_name: "Zeta Peças", is_business_mirror: false },
      { id: 3, corporate_name: "Minha Própria Empresa", is_business_mirror: true },
    ])
    const user = userEvent.setup()
    renderWithProviders(<SupplierLiveSelect label="Fornecedor" value="" onChange={vi.fn()} />)

    const input = await screen.findByRole("combobox")
    await user.click(input)

    const options = await screen.findAllByRole("option")
    expect(options[1]).toHaveTextContent("Minha Própria Empresa")
  })

  it("filtra por nome, case-insensitive, já com o espelho priorizado", async () => {
    mockSuppliers([
      { id: 1, corporate_name: "Fornecedor Alfa", is_business_mirror: false },
      { id: 2, corporate_name: "Minha Própria Empresa", is_business_mirror: true },
    ])
    const user = userEvent.setup()
    renderWithProviders(<SupplierLiveSelect label="Fornecedor" value="" onChange={vi.fn()} />)

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await screen.findByRole("option", { name: "Minha Própria Empresa" })
    await user.type(input, "alfa")

    expect(await screen.findByRole("option", { name: "Fornecedor Alfa" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Minha Própria Empresa" })).not.toBeInTheDocument()
  })

  it("sem match, mostra 'Cadastrar novo fornecedor' que abre o modal", async () => {
    mockSuppliers([{ id: 1, corporate_name: "Fornecedor Alfa", is_business_mirror: false }])
    const user = userEvent.setup()
    renderWithProviders(<SupplierLiveSelect label="Fornecedor" value="" onChange={vi.fn()} />)

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await screen.findByRole("option", { name: "Fornecedor Alfa" })
    await user.type(input, "nenhum-fornecedor-bate")

    await user.click(await screen.findByRole("option", { name: "Cadastrar novo fornecedor" }))
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
  })

  it("modal criado com sucesso seleciona o fornecedor novo automaticamente e fecha", async () => {
    mockSuppliers([])
    localStorage.setItem(
      "user",
      JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }),
    )
    server.use(
      http.get(`${API}/estados/`, () =>
        HttpResponse.json({ results: [{ id: 1, name: "Paraná" }], count: 1 }),
      ),
      http.get(`${API}/estados/1/cidades/`, () =>
        HttpResponse.json({ results: [{ id: 10, name: "Curitiba" }], count: 1 }),
      ),
      http.post(`${API}/fornecedores/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json(
          { id: 55, corporate_name: "Fornecedora Nova LTDA", ...body },
          { status: 201 },
        )
      }),
    )
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<SupplierLiveSelect label="Fornecedor" value="" onChange={onChange} />)

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await user.click(await screen.findByRole("option", { name: "Cadastrar novo fornecedor" }))

    const dialog = await screen.findByRole("dialog")
    await user.type(
      screen.getByPlaceholderText("Ex: Fornecedora de Insumos LTDA"),
      "Fornecedora Nova LTDA",
    )
    await user.type(screen.getByPlaceholderText("00.000.000/0000-00"), "11222333000181")
    await user.type(screen.getByPlaceholderText("contato@fornecedor.com"), "contato@nova.com")
    await user.type(screen.getByPlaceholderText("(00) 00000-0000"), "11912345678")
    await user.selectOptions(screen.getByText("Estado").closest("div").querySelector("select"), "1")
    await waitFor(() => {
      const citySelect = screen.getByText("Cidade").closest("div").querySelector("select")
      expect(citySelect).not.toBeDisabled()
    })
    await user.selectOptions(
      screen.getByText("Cidade").closest("div").querySelector("select"),
      "10",
    )
    await user.type(screen.getByPlaceholderText("Rua, Avenida, etc."), "Rua das Flores")
    await user.type(screen.getByPlaceholderText("123"), "100")
    await user.click(screen.getByRole("button", { name: "Salvar Fornecedor" }))

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("55"))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(dialog).not.toBeInTheDocument()
  })
})
