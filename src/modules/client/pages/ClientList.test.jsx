import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ClientList from "./ClientList"

describe("<ClientList>", () => {
  it("renderiza a tabela com os dados da API", async () => {
    server.use(
      http.get(`${API}/clientes/`, () =>
        HttpResponse.json({
          results: [{ id: 1, first_name: "Ana", last_name: "Lima", cpf: "111", phone: "999" }],
          count: 1,
        }),
      ),
    )

    renderWithProviders(<ClientList />)

    expect(screen.getByRole("heading", { name: /clientes/i })).toBeInTheDocument()
    expect(await screen.findByText("Ana Lima")).toBeInTheDocument()
  })

  it("mostra o estado de erro quando a API falha", async () => {
    server.use(http.get(`${API}/clientes/`, () => new HttpResponse(null, { status: 500 })))

    renderWithProviders(<ClientList />)

    expect(await screen.findByText(/não foi possível carregar/i)).toBeInTheDocument()
  })
})
