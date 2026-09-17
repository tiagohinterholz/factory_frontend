import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import StateList from "./StateList"

function mockStates() {
  server.use(
    http.get(`${API}/estados/`, () =>
      HttpResponse.json({
        results: [
          { id: 1, name: "São Paulo", abbreviation: "SP", ibge_code: 35, is_active: true },
          { id: 2, name: "Acre", abbreviation: "AC", ibge_code: null, is_active: true },
        ],
        count: 2,
      }),
    ),
  )
}

describe("<StateList>", () => {
  it("renderiza a tabela com os dados da API, incluindo o código IBGE", async () => {
    mockStates()
    renderWithProviders(<StateList />)

    expect(screen.getByRole("heading", { name: /estados/i })).toBeInTheDocument()
    expect(await screen.findByText("São Paulo")).toBeInTheDocument()
    expect(screen.getByText("35")).toBeInTheDocument()
    expect(screen.getByText("Acre")).toBeInTheDocument()
  })

  it("mostra o estado de erro quando a API falha", async () => {
    server.use(http.get(`${API}/estados/`, () => new HttpResponse(null, { status: 500 })))

    renderWithProviders(<StateList />)

    expect(await screen.findByText(/não foi possível carregar/i)).toBeInTheDocument()
  })
})
