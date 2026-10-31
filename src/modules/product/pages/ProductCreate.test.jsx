import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, fireEvent, waitFor, within } from "@testing-library/react"
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

  it("usa ProductCategoryLiveSelect (combobox com busca) no campo Categoria", async () => {
    mockApi()
    renderWithProviders(<ProductCreate />)

    await screen.findByText("Categoria")
    const comboboxes = screen
      .getAllByRole("combobox")
      .filter((el) => el.id?.startsWith("headlessui-combobox-input"))
    expect(comboboxes.length).toBeGreaterThanOrEqual(2)
  })

  it("Subcategoria fica desabilitada até escolher a Categoria", async () => {
    mockApi()
    renderWithProviders(<ProductCreate />)

    await screen.findByText("Subcategoria")
    const subcategoryInput = screen.getByText("Subcategoria").closest("div").querySelector("input")
    expect(subcategoryInput).toBeDisabled()
    expect(subcategoryInput).toHaveAttribute("placeholder", "Selecione a categoria primeiro")
  })

  it("trocar a Categoria limpa a Subcategoria já escolhida", async () => {
    server.use(
      http.get(`${API}/fornecedores/`, () =>
        HttpResponse.json({ results: [{ id: 9, corporate_name: "Bosch Ltda" }], count: 1 }),
      ),
      http.get(`${API}/produtos/`, () => HttpResponse.json({ results: [], count: 0 })),
      http.get(`${API}/categorias-produto/`, () =>
        HttpResponse.json({
          results: [
            { id: 1, name: "Pneus" },
            { id: 2, name: "Lubrificantes" },
          ],
          count: 2,
        }),
      ),
      http.get(`${API}/categorias-produto/1/subcategorias/`, () =>
        HttpResponse.json({ results: [{ id: 10, name: "Pneu de Carro" }], count: 1 }),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<ProductCreate />)

    const comboboxes = () =>
      screen.getAllByRole("combobox").filter((el) => el.id?.startsWith("headlessui-combobox-input"))

    await screen.findByText("Categoria")
    const categoryInput = comboboxes()[1]
    await user.click(categoryInput)
    await user.click(await screen.findByRole("option", { name: "Pneus" }))

    const subcategoryInput = comboboxes()[2]
    await waitFor(() => expect(subcategoryInput).not.toBeDisabled())
    await user.click(subcategoryInput)
    await user.click(await screen.findByRole("option", { name: "Pneu de Carro" }))
    await waitFor(() => expect(subcategoryInput).toHaveValue("Pneu de Carro"))

    await user.click(categoryInput)
    await user.click(await screen.findByRole("option", { name: "Lubrificantes" }))

    await waitFor(() => expect(subcategoryInput).toHaveValue(""))
  })

  it("criar subcategoria inline pré-preenche a categoria já escolhida no modal", async () => {
    server.use(
      http.get(`${API}/fornecedores/`, () =>
        HttpResponse.json({ results: [{ id: 9, corporate_name: "Bosch Ltda" }], count: 1 }),
      ),
      http.get(`${API}/produtos/`, () => HttpResponse.json({ results: [], count: 0 })),
      http.get(`${API}/categorias-produto/`, () =>
        HttpResponse.json({ results: [{ id: 1, name: "Pneus" }], count: 1 }),
      ),
      http.get(`${API}/categorias-produto/1/subcategorias/`, () =>
        HttpResponse.json({ results: [], count: 0 }),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<ProductCreate />)

    const comboboxes = () =>
      screen.getAllByRole("combobox").filter((el) => el.id?.startsWith("headlessui-combobox-input"))

    await screen.findByText("Categoria")
    const categoryInput = comboboxes()[1]
    await user.click(categoryInput)
    await user.click(await screen.findByRole("option", { name: "Pneus" }))

    const subcategoryInput = comboboxes()[2]
    await waitFor(() => expect(subcategoryInput).not.toBeDisabled())
    await user.click(subcategoryInput)
    await user.click(await screen.findByRole("option", { name: "Cadastrar nova subcategoria" }))

    const dialog = await screen.findByRole("dialog")
    await waitFor(() =>
      expect(
        within(dialog).getByText("Categoria").closest("div").querySelector("input"),
      ).toHaveValue("Pneus"),
    )
  })

  it("Unidade de Medida é texto livre com sugestões, não <select> fechado", async () => {
    mockApi()
    renderWithProviders(<ProductCreate />)

    await screen.findByText("Unidade de Medida")
    const input = screen.getByText("Unidade de Medida").closest("div").querySelector("input")
    expect(input).toHaveAttribute("list")
  })

  it("datalist de Unidade de Medida renderiza strings legíveis, nunca [object Object]", async () => {
    mockApi()
    renderWithProviders(<ProductCreate />)

    await screen.findByText("Unidade de Medida")
    const input = screen.getByText("Unidade de Medida").closest("div").querySelector("input")
    const datalist = document.getElementById(input.getAttribute("list"))
    const values = Array.from(datalist.querySelectorAll("option")).map((option) => option.value)

    expect(values).toEqual(["UN", "LT", "KG", "MT", "CX", "PAR", "CJ"])
    expect(values.every((value) => typeof value === "string" && value !== "[object Object]")).toBe(
      true,
    )
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

  describe("Unidade de Medida grava o código, não o rótulo (CVSP-P2-07)", () => {
    async function fillAndSubmit(user, unitValue) {
      await screen.findByText("Fornecedor *")
      await user.click(supplierCombobox())
      await user.click(await screen.findByRole("option", { name: "Bosch Ltda" }))
      await user.type(screen.getByPlaceholderText("Ex: Óleo 5W30"), "Óleo 5W30")
      fireEvent.change(screen.getByText("Preço Unitário").closest("div").querySelector("input"), {
        target: { value: "5000" },
      })
      const unitInput = screen.getByText("Unidade de Medida").closest("div").querySelector("input")
      fireEvent.change(unitInput, { target: { value: unitValue } })
      fireEvent.click(screen.getByRole("button", { name: /adicionar produto/i }))
      return unitInput
    }

    it("a sugestão 'Unidade' tem valor UN e é isso que vai pro back", async () => {
      mockApi()
      let body
      server.use(
        http.post(`${API}/produtos/`, async ({ request }) => {
          body = await request.json()
          return HttpResponse.json({ id: 50, name: "Óleo", cost_price: 0 }, { status: 201 })
        }),
      )
      renderWithProviders(<ProductCreate />)
      const user = userEvent.setup()

      const unitInput = await fillAndSubmit(user, "UN")
      const option = document.querySelector(
        `#${CSS.escape(unitInput.getAttribute("list"))} option[value="UN"]`,
      )

      expect(option).toHaveTextContent("Unidade")
      await waitFor(() => expect(body?.unit_of_measure).toBe("UN"))
    })

    it("digitar o rótulo em vez do código é recusado antes de enviar", async () => {
      mockApi()
      let posted = false
      server.use(
        http.post(`${API}/produtos/`, () => {
          posted = true
          return HttpResponse.json({ id: 50 }, { status: 201 })
        }),
      )
      renderWithProviders(<ProductCreate />)
      const user = userEvent.setup()

      await fillAndSubmit(user, "Unidade")

      expect(await screen.findByText(/escolha uma unidade da lista/i)).toBeInTheDocument()
      expect(posted).toBe(false)
    })
  })
})
