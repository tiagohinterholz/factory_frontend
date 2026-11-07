import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ProductSubcategoryEdit from "./ProductSubcategoryEdit"

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useParams: () => ({ id: "5" }), useNavigate: () => vi.fn() }
})

function mockApi() {
  server.use(
    http.get(`${API}/subcategorias-produto/5/`, () =>
      HttpResponse.json({ id: 5, name: "Filtro de óleo", category: { id: 1, name: "Pneus" } }),
    ),
    http.get(`${API}/categorias-produto/`, () =>
      HttpResponse.json({
        results: [
          { id: 1, name: "Pneus" },
          { id: 2, name: "Lubrificantes" },
        ],
        count: 2,
      }),
    ),
  )
}

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

describe("<ProductSubcategoryEdit>", () => {
  it("pré-seleciona a categoria existente da subcategoria no ProductCategoryLiveSelect", async () => {
    mockApi()
    renderWithProviders(<ProductSubcategoryEdit />)

    const input = await screen.findByRole("combobox")
    await waitFor(() => expect(input).toHaveValue("Pneus"))
  })
})
