import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { Routes, Route } from "react-router-dom"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ProductDetail from "./ProductDetail"

function mockProduct() {
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
    http.get(`${API}/empreendimentos/`, () => HttpResponse.json({ results: [], count: 0 })),
    http.get(`${API}/fornecedores/`, () =>
      HttpResponse.json({ results: [{ id: 9, corporate_name: "Bosch Ltda" }], count: 1 }),
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

  it("tem o botão de ver/editar o fornecedor vinculado, habilitado com o fornecedor carregado", async () => {
    mockProduct()
    renderPage()

    expect(
      await screen.findByRole("button", { name: /ver \/ editar fornecedor vinculado/i }),
    ).toBeEnabled()
  })
})
