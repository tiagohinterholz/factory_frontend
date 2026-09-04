import { describe, it, expect } from "vitest"
import { screen, fireEvent } from "@testing-library/react"
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
    http.get(`${API}/produtos/`, ({ request }) => {
      const supplierId = new URL(request.url).searchParams.get("supplier_id")
      return supplierId === "9"
        ? HttpResponse.json({ results: [{ id: 1, name: "Filtro de óleo Bosch" }], count: 1 })
        : HttpResponse.json({ results: [{ id: 2, name: "Pastilha genérica" }], count: 1 })
    }),
  )
}

describe("<ProductList>", () => {
  it("filtra por fornecedor ao escolher no dropdown", async () => {
    mockProducts()
    renderWithProviders(<ProductList />)

    expect(await screen.findByText("Pastilha genérica")).toBeInTheDocument()

    const select = screen.getByRole("combobox")
    fireEvent.change(select, { target: { value: "9" } })

    expect(await screen.findByText("Filtro de óleo Bosch")).toBeInTheDocument()
    expect(screen.queryByText("Pastilha genérica")).not.toBeInTheDocument()
  })
})
