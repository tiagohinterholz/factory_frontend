import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ManufacturerList from "./ManufacturerList"

function mockManufacturers() {
  server.use(
    http.get(`${API}/marcas/`, () =>
      HttpResponse.json({
        results: [
          { id: 17, name: "Audi", is_active: true },
          { id: 12, name: "Volkswagen", is_active: false },
        ],
        count: 2,
      }),
    ),
  )
}

describe("<ManufacturerList>", () => {
  it("renderiza a tabela com os dados da API", async () => {
    mockManufacturers()
    renderWithProviders(<ManufacturerList />)

    expect(screen.getByRole("heading", { name: /marcas/i })).toBeInTheDocument()
    expect(await screen.findByText("Audi")).toBeInTheDocument()
    expect(screen.getByText("Volkswagen")).toBeInTheDocument()
  })

  it("mostra o estado de erro quando a API falha", async () => {
    server.use(http.get(`${API}/marcas/`, () => new HttpResponse(null, { status: 500 })))

    renderWithProviders(<ManufacturerList />)

    expect(await screen.findByText(/não foi possível carregar/i)).toBeInTheDocument()
  })
})
