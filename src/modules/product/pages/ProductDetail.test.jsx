import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { Routes, Route } from "react-router-dom"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ProductDetail from "./ProductDetail"

function mockProduct({ supplierPhone } = {}) {
  server.use(
    http.get(`${API}/produtos/1/`, () =>
      HttpResponse.json({
        id: 1,
        name: "Filtro de óleo",
        brand: "Bosch",
        reference: "FO-1",
        description: "",
        stock_quantity: 10,
        unit_price: "50.00",
        business: 1,
        supplier: 9,
      }),
    ),
    http.get(`${API}/fornecedores/`, () =>
      HttpResponse.json({
        results: [{ id: 9, corporate_name: "Bosch Ltda", phone: supplierPhone }],
        count: 1,
      }),
    ),
    // datalist de "Marca" pré-populado com marcas já cadastradas em produtos
    http.get(`${API}/produtos/`, () => HttpResponse.json({ results: [], count: 0 })),
    http.get(`${API}/categorias-produto/`, () => HttpResponse.json({ results: [], count: 0 })),
    // kardex (StockMovementHistory) — histórico de estoque do produto
    http.get(`${API}/compras/movimentos-estoque/`, () =>
      HttpResponse.json({ results: [], count: 0 }),
    ),
  )
}

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/produtos/:id" element={<ProductDetail />} />
    </Routes>,
    { route: "/produtos/1" },
  )

describe("<ProductDetail>", () => {
  it("tem o botão de exportar o PDF do produto", async () => {
    mockProduct()
    renderPage()

    expect(await screen.findByRole("button", { name: /exportar pdf/i })).toBeInTheDocument()
  })

  it("usa SupplierLiveSelect (combobox com busca) no campo Fornecedor, não mais o <select> fechado", async () => {
    mockProduct()
    renderPage()

    await screen.findByText("Fornecedor *")
    const combobox = screen
      .getAllByRole("combobox")
      .find((el) => el.id?.startsWith("headlessui-combobox-input"))
    expect(combobox).toBeInTheDocument()
    expect(combobox).toHaveDisplayValue("Bosch Ltda")
  })

  it("mostra o histórico de estoque (kardex) do produto", async () => {
    mockProduct()
    renderPage()

    expect(await screen.findByText("Histórico de Estoque")).toBeInTheDocument()
    expect(await screen.findByText("Nenhum movimento registrado ainda.")).toBeInTheDocument()
  })

  it("histórico de estoque fica ao lado do formulário (grid de duas colunas), não empilhado", async () => {
    mockProduct()
    renderPage()

    await screen.findByText("Histórico de Estoque")
    expect(document.querySelector(".lg\\:col-span-7")).toBeInTheDocument()
    expect(document.querySelector(".lg\\:col-span-5")).toBeInTheDocument()
  })

  it("Unidade de Medida é texto livre com sugestões (datalist), não <select> fechado", async () => {
    mockProduct()
    renderPage()

    await screen.findByText("Unidade de Medida")
    const input = screen.getByText("Unidade de Medida").closest("div").querySelector("input")
    expect(input).toHaveAttribute("list")
    const datalist = document.getElementById(input.getAttribute("list"))
    const litroOption = Array.from(datalist.querySelectorAll("option")).find(
      (option) => option.textContent === "Litro",
    )
    expect(litroOption).toHaveAttribute("value", "LT")
  })

  it("mostra o botão de pedido de compra (WhatsApp) quando o fornecedor tem telefone", async () => {
    mockProduct({ supplierPhone: "(41) 91266-2552" })
    renderPage()

    const link = await screen.findByRole("link", { name: /pedido de compra/i })
    expect(link.getAttribute("href")).toContain("https://wa.me/5541912662552?text=")
  })

  it("sem telefone do fornecedor, não mostra o botão de pedido de compra", async () => {
    mockProduct({ supplierPhone: "" })
    renderPage()

    await screen.findByText("Fornecedor *")
    expect(screen.queryByRole("link", { name: /pedido de compra/i })).not.toBeInTheDocument()
  })
})
