import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ProductCategoryList from "./ProductCategoryList"

function mockProductCategories() {
  server.use(
    http.get(`${API}/categorias-produto/`, () =>
      HttpResponse.json({
        results: [
          { id: 3, name: "Filtros", is_active: true },
          { id: 4, name: "Freios", is_active: false },
        ],
        count: 2,
      }),
    ),
  )
}

describe("<ProductCategoryList>", () => {
  it("renderiza a tabela com os dados da API", async () => {
    mockProductCategories()
    renderWithProviders(<ProductCategoryList />)

    expect(screen.getByRole("heading", { name: /categorias de produto/i })).toBeInTheDocument()
    expect(await screen.findByText("Filtros")).toBeInTheDocument()
    expect(screen.getByText("Freios")).toBeInTheDocument()
  })

  it("mostra o estado de erro quando a API falha", async () => {
    server.use(
      http.get(`${API}/categorias-produto/`, () => new HttpResponse(null, { status: 500 })),
    )

    renderWithProviders(<ProductCategoryList />)

    expect(await screen.findByText(/não foi possível carregar/i)).toBeInTheDocument()
  })
})
