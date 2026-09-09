import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import BusinessList from "./BusinessList"

function mockBusinesses() {
  server.use(
    http.get(`${API}/empreendimentos/`, () =>
      HttpResponse.json({
        results: [
          {
            id: 1,
            corporate_name: "Oficina Central",
            cnpj: "11.111.111/0001-11",
            email: "central@oficina.com",
          },
          {
            id: 2,
            corporate_name: "Filial Norte",
            cnpj: "22.222.222/0001-22",
            email: "norte@oficina.com",
          },
        ],
        count: 2,
      }),
    ),
  )
}

describe("<BusinessList>", () => {
  it("renderiza a tabela com os dados da API", async () => {
    mockBusinesses()
    renderWithProviders(<BusinessList />)

    expect(screen.getByRole("heading", { name: /empreendimentos/i })).toBeInTheDocument()
    expect(await screen.findByText("Oficina Central")).toBeInTheDocument()
    expect(screen.getByText("11.111.111/0001-11")).toBeInTheDocument()
    expect(screen.getByText("Filial Norte")).toBeInTheDocument()
  })

  it("mostra o estado de erro quando a API falha", async () => {
    server.use(http.get(`${API}/empreendimentos/`, () => new HttpResponse(null, { status: 500 })))

    renderWithProviders(<BusinessList />)

    expect(await screen.findByText(/não foi possível carregar/i)).toBeInTheDocument()
  })
})
