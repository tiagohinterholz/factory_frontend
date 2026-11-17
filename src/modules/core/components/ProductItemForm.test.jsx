import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, fireEvent, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ProductItemForm from "./ProductItemForm"

const PRODUCTS = [
  { id: 1, name: "Óleo 5W30", reference: "OL-530", unit_price: "45.00", stock_quantity: 12 },
  { id: 2, name: "Filtro de ar", reference: "FLT-889", unit_price: "60.00", stock_quantity: 0 },
  {
    id: 3,
    name: "Pneu 175/68",
    brand: "Pirelli",
    reference: "PN-175",
    unit_price: "800.00",
    stock_quantity: 2,
  },
]

describe("<ProductItemForm>", () => {
  it("busca o produto digitando nome ou referência e mostra preço e estoque", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductItemForm products={PRODUCTS} onAdd={vi.fn()} />)

    await user.type(screen.getByRole("combobox"), "flt")

    const options = await screen.findAllByRole("option")
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent("Filtro de ar (R$ 60,00) · estoque 0")
  })

  it("produto com marca mostra 'Marca - Nome (preço) · estoque N'", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductItemForm products={PRODUCTS} onAdd={vi.fn()} />)

    await user.click(screen.getByRole("combobox"))

    expect(await screen.findByRole("option", { name: /pirelli/i })).toHaveTextContent(
      "Pirelli - Pneu 175/68 (R$ 800,00) · estoque 2",
    )
  })

  it("produto sem marca mantém o formato antigo, sem prefixo", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductItemForm products={PRODUCTS} onAdd={vi.fn()} />)

    await user.type(screen.getByRole("combobox"), "flt")

    expect(await screen.findByRole("option")).toHaveTextContent(
      "Filtro de ar (R$ 60,00) · estoque 0",
    )
  })

  it("busca pelo nome da marca encontra o produto", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductItemForm products={PRODUCTS} onAdd={vi.fn()} />)

    await user.type(screen.getByRole("combobox"), "pirelli")

    const options = await screen.findAllByRole("option")
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent("Pirelli - Pneu 175/68")
  })

  it("adiciona com a quantidade escolhida e limpa o formulário", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn().mockResolvedValue(true)
    renderWithProviders(<ProductItemForm products={PRODUCTS} onAdd={onAdd} />)

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: /óleo 5w30/i }))
    fireEvent.change(screen.getByLabelText("Qtd"), { target: { value: "4" } })
    fireEvent.click(screen.getByRole("button", { name: "Adicionar produto" }))

    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith({ product_id: "1", quantity: 4, unit_price: "45.00" }),
    )
    await waitFor(() => expect(screen.getByLabelText("Qtd")).toHaveValue(1))
  })

  it("quantidade maior que o estoque avisa quanto falta e adiciona mesmo assim", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn().mockResolvedValue(true)
    renderWithProviders(<ProductItemForm products={PRODUCTS} onAdd={onAdd} />)

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: /pirelli/i }))
    fireEvent.change(screen.getByLabelText("Qtd"), { target: { value: "3" } })

    expect(screen.getByRole("status")).toHaveTextContent("Estoque disponível: 2 — vão faltar 1 un.")

    fireEvent.submit(screen.getByRole("button", { name: "Adicionar produto" }).closest("form"))

    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith({ product_id: "3", quantity: 3, unit_price: "800.00" }),
    )
    expect(screen.queryByText(/estoque insuficiente/i)).not.toBeInTheDocument()
  })

  it("produto sem estoque avisa que falta a quantidade inteira", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn().mockResolvedValue(true)
    renderWithProviders(<ProductItemForm products={PRODUCTS} onAdd={onAdd} />)

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: /filtro de ar/i }))
    fireEvent.change(screen.getByLabelText("Qtd"), { target: { value: "2" } })

    expect(screen.getByRole("status")).toHaveTextContent("Estoque disponível: 0 — vão faltar 2 un.")
  })

  it("aceita quantidade exatamente igual ao estoque disponível", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn().mockResolvedValue(true)
    renderWithProviders(<ProductItemForm products={PRODUCTS} onAdd={onAdd} />)

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: /pirelli/i }))
    fireEvent.change(screen.getByLabelText("Qtd"), { target: { value: "2" } })
    fireEvent.click(screen.getByRole("button", { name: "Adicionar produto" }))

    expect(screen.queryByRole("status")).not.toBeInTheDocument()
    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith({ product_id: "3", quantity: 2, unit_price: "800.00" }),
    )
  })

  it("produto com estoque zero continua listado no picker", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductItemForm products={PRODUCTS} onAdd={vi.fn()} />)

    await user.click(screen.getByRole("combobox"))

    expect(await screen.findByRole("option", { name: /filtro de ar/i })).toBeInTheDocument()
  })

  it("recusa quantidade inválida", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    renderWithProviders(<ProductItemForm products={PRODUCTS} onAdd={onAdd} />)

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: /óleo 5w30/i }))
    fireEvent.change(screen.getByLabelText("Qtd"), { target: { value: "0" } })
    fireEvent.submit(screen.getByRole("button", { name: "Adicionar produto" }).closest("form"))

    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.getByText(/quantidade inteira/i)).toBeInTheDocument()
  })
})

describe("<ProductItemForm> cadastro rápido de produto", () => {
  const CREATED = {
    id: 50,
    name: "Pastilha de freio",
    unit_price: "50.00",
    cost_price: "30.00",
    stock_quantity: 2,
  }

  function mockCatalogApi() {
    let body
    server.use(
      http.get(`${API}/fornecedores/`, () =>
        HttpResponse.json({ results: [{ id: 9, corporate_name: "Bosch Ltda" }], count: 1 }),
      ),
      http.get(`${API}/produtos/`, () => HttpResponse.json({ results: [], count: 0 })),
      http.get(`${API}/categorias-produto/`, () => HttpResponse.json({ results: [], count: 0 })),
      http.post(`${API}/produtos/`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(CREATED, { status: 201 })
      }),
    )
    return () => body
  }

  function loginAs(user) {
    localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, ...user }))
  }

  async function createProductThroughModal(user, productCombobox) {
    await user.click(productCombobox)
    await user.click(await screen.findByRole("option", { name: "Cadastrar novo produto" }))

    const dialog = await screen.findByRole("dialog", { name: "Cadastrar novo produto" })
    const supplierInput = within(dialog)
      .getAllByRole("combobox")
      .find((el) => el.id?.startsWith("headlessui-combobox-input"))
    await user.click(supplierInput)
    await user.click(await screen.findByRole("option", { name: "Bosch Ltda" }))
    await user.type(within(dialog).getByPlaceholderText("Ex: Óleo 5W30"), "Pastilha de freio")
    fireEvent.change(
      within(dialog).getByText("Qtd em Estoque").closest("div").querySelector("input"),
      { target: { value: "2" } },
    )
    fireEvent.change(
      within(dialog).getByText("Preço Unitário").closest("div").querySelector("input"),
      { target: { value: "5000" } },
    )
    fireEvent.click(within(dialog).getByRole("button", { name: "Salvar produto" }))
  }

  beforeEach(() => {
    localStorage.clear()
  })

  it("sem permissão de cadastrar produto, a lista não oferece o atalho", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductItemForm products={PRODUCTS} onAdd={vi.fn()} />)

    await user.click(screen.getByRole("combobox"))

    await screen.findAllByRole("option")
    expect(screen.queryByRole("option", { name: "Cadastrar novo produto" })).toBeNull()
  })

  it("cadastra pelo modal, pergunta da saída financeira e volta com o produto já selecionado", async () => {
    loginAs({ role: "admin" })
    const postedBody = mockCatalogApi()
    const onAdd = vi.fn().mockResolvedValue(true)
    const user = userEvent.setup()
    renderWithProviders(<ProductItemForm products={PRODUCTS} allowCreateProduct onAdd={onAdd} />)
    const productCombobox = screen.getByRole("combobox")

    await createProductThroughModal(user, productCombobox)

    expect(
      await screen.findByRole("dialog", { name: /registrar saída financeira/i }),
    ).toBeInTheDocument()
    expect(postedBody()).toMatchObject({
      name: "Pastilha de freio",
      supplier_id: "9",
      stock_quantity: 2,
    })
    fireEvent.click(screen.getByRole("button", { name: "Não" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(productCombobox).toHaveValue("Pastilha de freio (R$ 50,00) · estoque 2")

    fireEvent.click(screen.getByRole("button", { name: "Adicionar produto" }))

    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith({ product_id: "50", quantity: 1, unit_price: "50.00" }),
    )
  })

  it("quem não lança no financeiro volta direto pro item, sem a pergunta da saída", async () => {
    loginAs({ role: "atendente", permissions: ["products.add_product"] })
    mockCatalogApi()
    const user = userEvent.setup()
    renderWithProviders(<ProductItemForm products={PRODUCTS} allowCreateProduct onAdd={vi.fn()} />)
    const productCombobox = screen.getByRole("combobox")

    await createProductThroughModal(user, productCombobox)

    await waitFor(() =>
      expect(productCombobox).toHaveValue("Pastilha de freio (R$ 50,00) · estoque 2"),
    )
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("fechar o modal sem salvar não cadastra nada e mantém a linha como estava", async () => {
    loginAs({ role: "admin" })
    let posted = false
    mockCatalogApi()
    server.use(
      http.post(`${API}/produtos/`, () => {
        posted = true
        return HttpResponse.json(CREATED, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    renderWithProviders(<ProductItemForm products={PRODUCTS} allowCreateProduct onAdd={vi.fn()} />)
    const productCombobox = screen.getByRole("combobox")

    await user.click(productCombobox)
    await user.click(await screen.findByRole("option", { name: "Cadastrar novo produto" }))
    const dialog = await screen.findByRole("dialog", { name: "Cadastrar novo produto" })
    fireEvent.keyDown(document, { key: "Escape" })

    await waitFor(() => expect(dialog).not.toBeInTheDocument())
    expect(posted).toBe(false)
    expect(productCombobox).toHaveValue("")
  })
})
