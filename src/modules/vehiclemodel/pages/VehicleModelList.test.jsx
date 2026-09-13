import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import VehicleModelList from "./VehicleModelList"

function mockVehicleModels() {
  server.use(
    http.get(`${API}/modelos-veiculo/`, () =>
      HttpResponse.json({
        results: [
          { id: 90, name: "A3", manufacturer: { id: 17, name: "Audi" } },
          { id: 55, name: "Gol", manufacturer: { id: 12, name: "Volkswagen" } },
        ],
        count: 2,
      }),
    ),
  )
}

describe("<VehicleModelList>", () => {
  it("renderiza a tabela com os dados da API", async () => {
    mockVehicleModels()
    renderWithProviders(<VehicleModelList />)

    expect(screen.getByRole("heading", { name: /modelos/i })).toBeInTheDocument()
    expect(await screen.findByText("A3")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Audi" })).toHaveAttribute("href", "/marcas/17")
    expect(screen.getByText("Gol")).toBeInTheDocument()
  })

  it("mostra o estado de erro quando a API falha", async () => {
    server.use(http.get(`${API}/modelos-veiculo/`, () => new HttpResponse(null, { status: 500 })))

    renderWithProviders(<VehicleModelList />)

    expect(await screen.findByText(/não foi possível carregar/i)).toBeInTheDocument()
  })
})
