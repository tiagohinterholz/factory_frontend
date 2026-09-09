import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import CityList from "./CityList"

function mockCities() {
  server.use(
    http.get(`${API}/cidades/`, () =>
      HttpResponse.json({
        results: [
          { id: 1, name: "Curitiba", state: { id: 1, name: "Paraná", abbreviation: "PR" } },
          {
            id: 2,
            name: "Joinville",
            state: { id: 2, name: "Santa Catarina", abbreviation: "SC" },
          },
        ],
        count: 2,
      }),
    ),
  )
}

describe("<CityList>", () => {
  it("renderiza a tabela com os dados da API", async () => {
    mockCities()
    renderWithProviders(<CityList />)

    expect(screen.getByRole("heading", { name: /cidades/i })).toBeInTheDocument()
    expect(await screen.findByText("Curitiba")).toBeInTheDocument()
    expect(screen.getByText("Paraná")).toBeInTheDocument()
    expect(screen.getByText("Joinville")).toBeInTheDocument()
    expect(screen.getByText("SC")).toBeInTheDocument()
  })

  it("mostra o estado de erro quando a API falha", async () => {
    server.use(http.get(`${API}/cidades/`, () => new HttpResponse(null, { status: 500 })))

    renderWithProviders(<CityList />)

    expect(await screen.findByText(/não foi possível carregar/i)).toBeInTheDocument()
  })
})
