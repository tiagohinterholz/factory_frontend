import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import UserList from "./UserList"

function mockUsers() {
  server.use(
    http.get(`${API}/usuarios/`, () =>
      HttpResponse.json({
        results: [
          {
            id: 1,
            name: "Ana Lima",
            email: "ana@oficina.com",
            role: "admin",
            business: { id: 3, corporate_name: "Oficina Central" },
          },
          {
            id: 2,
            name: "Beto Souza",
            email: "beto@oficina.com",
            role: "operador",
            business: null,
          },
        ],
        count: 2,
      }),
    ),
  )
}

describe("<UserList>", () => {
  it("renderiza a tabela com os dados da API", async () => {
    mockUsers()
    renderWithProviders(<UserList />)

    expect(screen.getByRole("heading", { name: /usuários/i })).toBeInTheDocument()
    expect(await screen.findByText("Ana Lima")).toBeInTheDocument()
    expect(screen.getByText("ana@oficina.com")).toBeInTheDocument()
    expect(screen.getByText("Oficina Central")).toBeInTheDocument()
  })

  it("mostra '-' quando o usuário não tem empreendimento", async () => {
    mockUsers()
    renderWithProviders(<UserList />)

    await screen.findByText("Beto Souza")
    expect(screen.getByText("-")).toBeInTheDocument()
  })

  it("mostra o estado de erro quando a API falha", async () => {
    server.use(http.get(`${API}/usuarios/`, () => new HttpResponse(null, { status: 500 })))

    renderWithProviders(<UserList />)

    expect(await screen.findByText(/não foi possível carregar/i)).toBeInTheDocument()
  })
})
