import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ProductSubcategoryList from "./ProductSubcategoryList"

function mockProductSubcategories() {
  server.use(
    http.get(`${API}/subcategorias-produto/`, () =>
      HttpResponse.json({
        results: [
          { id: 90, name: "Filtro de óleo", category: { id: 3, name: "Filtros" } },
          { id: 55, name: "Pastilha", category: { id: 4, name: "Freios" } },
        ],
        count: 2,
      }),
    ),
  )
}

describe("<ProductSubcategoryList>", () => {
  it("renderiza a tabela com os dados da API", async () => {
    mockProductSubcategories()
    renderWithProviders(<ProductSubcategoryList />)

    expect(screen.getByRole("heading", { name: /subcategorias de produto/i })).toBeInTheDocument()
    expect(await screen.findByText("Filtro de óleo")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Filtros" })).toHaveAttribute(
      "href",
      "/categorias-produto/3",
    )
    expect(screen.getByText("Pastilha")).toBeInTheDocument()
  })

  it("mostra o estado de erro quando a API falha", async () => {
    server.use(
      http.get(`${API}/subcategorias-produto/`, () => new HttpResponse(null, { status: 500 })),
    )

    renderWithProviders(<ProductSubcategoryList />)

    expect(await screen.findByText(/não foi possível carregar/i)).toBeInTheDocument()
  })
})
