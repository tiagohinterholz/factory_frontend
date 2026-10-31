import { describe, it, expect } from "vitest"
import { screen, fireEvent, waitFor, within } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import FinancialSubcategoryList from "./FinancialSubcategoryList"

function mockSubcategories(results) {
  server.use(
    http.get(`${API}/subcategorias-financeiro/`, () =>
      HttpResponse.json({
        results: results ?? [
          { id: 90, name: "Marketing digital", category: { id: 3, name: "Marketing" } },
          { id: 55, name: "Combustível", category: { id: 4, name: "Frota" } },
        ],
        count: (results ?? [1, 2]).length,
      }),
    ),
  )
}

describe("<FinancialSubcategoryList>", () => {
  it("renderiza a tabela com os dados da API", async () => {
    mockSubcategories()
    renderWithProviders(<FinancialSubcategoryList />)

    expect(
      screen.getByRole("heading", { name: /subcategorias financeiras/i }),
    ).toBeInTheDocument()
    expect(await screen.findByText("Marketing digital")).toBeInTheDocument()
    expect(screen.getByText("Combustível")).toBeInTheDocument()
  })

  it("mostra o link pra categoria pai", async () => {
    mockSubcategories()
    renderWithProviders(<FinancialSubcategoryList />)

    await screen.findByText("Marketing digital")
    expect(screen.getByRole("link", { name: "Marketing" })).toHaveAttribute(
      "href",
      "/financeiro/categorias/3",
    )
  })

  it("exclui uma subcategoria pelo botão da linha e recarrega a lista", async () => {
    mockSubcategories([
      { id: 90, name: "Marketing digital", category: { id: 3, name: "Marketing" } },
    ])
    server.use(
      http.delete(`${API}/subcategorias-financeiro/90/`, () => new HttpResponse(null, { status: 204 })),
    )
    renderWithProviders(<FinancialSubcategoryList />)

    const row = (await screen.findByText("Marketing digital")).closest("tr")
    fireEvent.click(within(row).getByRole("button", { name: "Excluir" }))

    const dialog = await screen.findByRole("dialog")
    fireEvent.click(within(dialog).getByRole("button", { name: "Excluir" }))

    mockSubcategories([])
    await waitFor(() => expect(screen.queryByText("Marketing digital")).not.toBeInTheDocument())
  })

  it("mostra estado vazio quando não há subcategorias", async () => {
    mockSubcategories([])
    renderWithProviders(<FinancialSubcategoryList />)

    expect(await screen.findByText(/nenhum/i)).toBeInTheDocument()
  })
})
