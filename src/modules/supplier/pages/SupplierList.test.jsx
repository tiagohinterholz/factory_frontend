import { describe, it, expect } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import SupplierList from "./SupplierList"

function mockSuppliers() {
  server.use(
    http.get(`${API}/fornecedores/`, ({ request }) => {
      const corporateName = new URL(request.url).searchParams.get("corporate_name")
      return corporateName
        ? HttpResponse.json({ results: [{ id: 1, corporate_name: "Bosch Ltda" }], count: 1 })
        : HttpResponse.json({
            results: [
              { id: 1, corporate_name: "Bosch Ltda" },
              { id: 2, corporate_name: "Fras-le SA" },
            ],
            count: 2,
          })
    }),
  )
}

describe("<SupplierList>", () => {
  it("renderiza a tabela com os dados da API", async () => {
    mockSuppliers()
    renderWithProviders(<SupplierList />)

    expect(screen.getByRole("heading", { name: /fornecedores/i })).toBeInTheDocument()
    expect(await screen.findByText("Bosch Ltda")).toBeInTheDocument()
    expect(screen.getByText("Fras-le SA")).toBeInTheDocument()
  })

  it("mostra o estado de erro quando a API falha", async () => {
    server.use(http.get(`${API}/fornecedores/`, () => new HttpResponse(null, { status: 500 })))

    renderWithProviders(<SupplierList />)

    expect(await screen.findByText(/não foi possível carregar/i)).toBeInTheDocument()
  })

  it("filtra por razão social pelo painel de Filtros", async () => {
    mockSuppliers()
    renderWithProviders(<SupplierList />)

    expect(await screen.findByText("Fras-le SA")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /filtros/i }))
    fireEvent.change(await screen.findByPlaceholderText(/razão social/i), {
      target: { value: "Bosch" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Filtrar" }))

    await waitFor(() => expect(screen.queryByText("Fras-le SA")).not.toBeInTheDocument())
    expect(screen.getByText("Bosch Ltda")).toBeInTheDocument()
  })
})
