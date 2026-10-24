import { describe, it, expect } from "vitest"
import { screen, fireEvent, within } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ProductList from "./ProductList"

function mockProducts() {
  server.use(
    http.get(`${API}/fornecedores/`, () =>
      HttpResponse.json({ results: [{ id: 9, corporate_name: "Bosch Ltda" }], count: 1 }),
    ),
    http.get(`${API}/categorias-produto/`, () => HttpResponse.json({ results: [], count: 0 })),
    http.get(`${API}/produtos/`, ({ request }) => {
      const supplierId = new URL(request.url).searchParams.get("supplier_id")
      return supplierId === "9"
        ? HttpResponse.json({ results: [{ id: 1, name: "Filtro de óleo Bosch" }], count: 1 })
        : HttpResponse.json({ results: [{ id: 2, name: "Pastilha genérica" }], count: 1 })
    }),
  )
}

describe("<ProductList>", () => {
  it("filtra por fornecedor pelo painel de Filtros", async () => {
    mockProducts()
    renderWithProviders(<ProductList />)

    expect(await screen.findByText("Pastilha genérica")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /filtros/i }))
    fireEvent.click(await screen.findByRole("button", { name: /selecione o\(a\) fornecedor/i }))
    fireEvent.click(await screen.findByRole("option", { name: "Bosch Ltda" }))
    fireEvent.click(screen.getByRole("button", { name: "Filtrar" }))

    expect(await screen.findByText("Filtro de óleo Bosch")).toBeInTheDocument()
    expect(screen.queryByText("Pastilha genérica")).not.toBeInTheDocument()
  })

  it("mostra o fornecedor na coluna, ou '-' quando o produto não tem um", async () => {
    server.use(
      http.get(`${API}/fornecedores/`, () => HttpResponse.json({ results: [], count: 0 })),
      http.get(`${API}/categorias-produto/`, () => HttpResponse.json({ results: [], count: 0 })),
      http.get(`${API}/produtos/`, () =>
        HttpResponse.json({
          results: [
            {
              id: 1,
              name: "Filtro de óleo Bosch",
              reference: "REF-1",
              supplier: { id: 9, corporate_name: "Bosch Ltda" },
            },
            { id: 2, name: "Peça avulsa", reference: "REF-2", supplier: null },
          ],
          count: 2,
        }),
      ),
    )
    renderWithProviders(<ProductList />)

    await screen.findByText("Filtro de óleo Bosch")
    const [comBosch, semFornecedor] = screen.getAllByRole("row").slice(1)
    // colunas: Fornecedor, Produto, Preço Venda, Qtde. em estoque, Referência
    expect(within(comBosch).getAllByRole("cell")[0]).toHaveTextContent("Bosch Ltda")
    expect(within(semFornecedor).getAllByRole("cell")[0]).toHaveTextContent("-")
    expect(within(comBosch).getByRole("link", { name: "Bosch Ltda" })).toHaveAttribute(
      "href",
      "/fornecedores/9",
    )
  })

  it("destaca em vermelho o produto abaixo do estoque mínimo", async () => {
    server.use(
      http.get(`${API}/fornecedores/`, () => HttpResponse.json({ results: [], count: 0 })),
      http.get(`${API}/categorias-produto/`, () => HttpResponse.json({ results: [], count: 0 })),
      http.get(`${API}/produtos/`, () =>
        HttpResponse.json({
          results: [
            { id: 1, name: "Abaixo do mínimo", stock_quantity: 2, minimum_stock: 5 },
            { id: 2, name: "Estoque normal", stock_quantity: 10, minimum_stock: 5 },
          ],
          count: 2,
        }),
      ),
    )
    renderWithProviders(<ProductList />)

    const belowRow = (await screen.findByText("Abaixo do mínimo")).closest("tr")
    const normalRow = screen.getByText("Estoque normal").closest("tr")

    expect(within(belowRow).getByText("2")).toHaveClass("text-danger")
    expect(within(normalRow).getByText("10")).not.toHaveClass("text-danger")
  })

  it("estoque zero ou negativo ganha destaque mais forte, mesmo sem mínimo configurado", async () => {
    server.use(
      http.get(`${API}/fornecedores/`, () => HttpResponse.json({ results: [], count: 0 })),
      http.get(`${API}/categorias-produto/`, () => HttpResponse.json({ results: [], count: 0 })),
      http.get(`${API}/produtos/`, () =>
        HttpResponse.json({
          results: [
            { id: 1, name: "Zero sem mínimo", stock_quantity: 0, minimum_stock: null },
            { id: 2, name: "Negativo", stock_quantity: -3, minimum_stock: null },
            { id: 3, name: "Abaixo do mínimo só", stock_quantity: 2, minimum_stock: 5 },
          ],
          count: 3,
        }),
      ),
    )
    renderWithProviders(<ProductList />)

    const zeroRow = (await screen.findByText("Zero sem mínimo")).closest("tr")
    const negativeRow = screen.getByText("Negativo").closest("tr")
    const belowMinimumOnlyRow = screen.getByText("Abaixo do mínimo só").closest("tr")

    expect(within(zeroRow).getByText("0")).toHaveClass("bg-danger-subtle")
    expect(within(negativeRow).getByText("-3")).toHaveClass("bg-danger-subtle")
    expect(within(belowMinimumOnlyRow).getByText("2")).not.toHaveClass("bg-danger-subtle")
  })

  it("mostra o ícone de WhatsApp (pedido de compra) quando o fornecedor do produto tem telefone", async () => {
    server.use(
      http.get(`${API}/fornecedores/`, () => HttpResponse.json({ results: [], count: 0 })),
      http.get(`${API}/categorias-produto/`, () => HttpResponse.json({ results: [], count: 0 })),
      http.get(`${API}/produtos/`, () =>
        HttpResponse.json({
          results: [
            {
              id: 1,
              name: "Filtro de óleo",
              supplier: { id: 9, corporate_name: "Bosch Ltda", phone: "(41) 91266-2552" },
            },
            { id: 2, name: "Sem telefone", supplier: { id: 10, corporate_name: "Sem Fone" } },
          ],
          count: 2,
        }),
      ),
    )
    renderWithProviders(<ProductList />)

    const withPhoneRow = (await screen.findByText("Filtro de óleo")).closest("tr")
    const withoutPhoneRow = screen.getByText("Sem telefone").closest("tr")

    const link = within(withPhoneRow).getByRole("link", { name: /whatsapp/i })
    expect(link.getAttribute("href")).toContain("https://wa.me/5541912662552?text=")
    expect(
      within(withoutPhoneRow).queryByRole("link", { name: /whatsapp/i }),
    ).not.toBeInTheDocument()
  })
})
