import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { Routes, Route } from "react-router-dom"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ClientDetail from "./ClientDetail"

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateSpy }
})

function mockClient({ vehicles = [] } = {}) {
  server.use(
    http.get(`${API}/clientes/1/`, () =>
      HttpResponse.json({
        id: 1,
        business: 3,
        client_type: "PF",
        first_name: "Ana",
        last_name: "Lima",
        cpf: "123.456.789-01",
        state: { id: 1, name: "Paraná" },
        city: { id: 1, name: "Curitiba" },
        phone: "(41) 91234-5678",
      }),
    ),
    http.get(`${API}/estados/`, () =>
      HttpResponse.json({ results: [{ id: 1, name: "Paraná", abbreviation: "PR" }], count: 1 }),
    ),
    http.get(`${API}/estados/1/cidades/`, () =>
      HttpResponse.json({ results: [{ id: 1, name: "Curitiba" }], count: 1 }),
    ),
    http.get(`${API}/clientes/1/veiculos/`, () =>
      HttpResponse.json({ results: vehicles, count: vehicles.length }),
    ),
  )
}

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/clientes/:id" element={<ClientDetail />} />
    </Routes>,
    { route: "/clientes/1" },
  )

beforeEach(() => {
  navigateSpy.mockClear()
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

describe("<ClientDetail>", () => {
  it("marca os campos obrigatórios com *", async () => {
    mockClient()
    renderPage()

    expect(await screen.findByText("Nome *")).toBeInTheDocument()
    expect(screen.getByText("Sobrenome *")).toBeInTheDocument()
    expect(screen.getByText("CPF *")).toBeInTheDocument()
    expect(screen.getByText("Telefone *")).toBeInTheDocument()
    expect(screen.getByText("Estado *")).toBeInTheDocument()
    expect(screen.getByText("Cidade *")).toBeInTheDocument()
  })

  it("sem veículo vinculado, esconde a mensagem de vazio mas mantém o botão Adicionar veículo", async () => {
    mockClient({ vehicles: [] })
    renderPage()

    await screen.findByText("Veículos Vinculados")
    expect(
      screen.queryByText("Este cliente ainda não possui veículos cadastrados."),
    ).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /adicionar veículo/i })).toBeInTheDocument()
  })

  it("com veículo vinculado, o card mostra o veículo e navega pra edição dele ao clicar", async () => {
    mockClient({
      vehicles: [{ id: 7, model: { name: "Gol" }, year: 2020, plate: "ABC-1234" }],
    })
    renderPage()

    const vehicleRow = await screen.findByText("Gol 2020")
    fireEvent.click(vehicleRow)

    expect(navigateSpy).toHaveBeenCalledWith("/veiculos/7")
  })

  it("botão Adicionar veículo navega pra criação de veículo levando o clientId", async () => {
    mockClient()
    renderPage()

    fireEvent.click(await screen.findByRole("button", { name: /adicionar veículo/i }))

    expect(navigateSpy).toHaveBeenCalledWith("/veiculos/novo", { state: { clientId: "1" } })
  })

  it("capitaliza a primeira letra de Nome/Sobrenome/Endereço/Bairro ao digitar", async () => {
    mockClient()
    renderPage()

    const firstName = await screen.findByDisplayValue("Ana")
    fireEvent.change(firstName, { target: { value: "ana" } })
    expect(firstName.value).toBe("Ana")
  })

  it("ao salvar com sucesso, permanece na mesma tela (sem navegar pra /clientes)", async () => {
    mockClient()
    server.use(http.patch(`${API}/clientes/1/`, () => HttpResponse.json({ id: 1 })))
    renderPage()

    await screen.findByDisplayValue("Ana")
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }))

    await waitFor(() => expect(navigateSpy).not.toHaveBeenCalledWith("/clientes"))
  })
})
