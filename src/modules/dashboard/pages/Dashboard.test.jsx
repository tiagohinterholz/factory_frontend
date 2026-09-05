import { describe, it, expect, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import Dashboard from "./Dashboard"

const PAYLOAD = {
  movimentacao: { os_a_faturar_hoje: 3, os_a_faturar: 12, os_faturadas: 45 },
  atendimentos: {
    clientes_semana: [
      {
        id: 1,
        client_id: 5,
        client_name: "João Silva",
        contact: "(51) 99999-9999",
        vehicle_id: 3,
        vehicle: "ABC1234 - Onix",
        date: "2026-09-07",
        time: "14:00:00",
        order: 10,
        budget: null,
      },
    ],
    total_agendado_semana: 7,
  },
  financeiro: {
    a_faturar_total: "1500.00",
    faturado_total: "8200.00",
    orcamentos_em_aberto_total: "900.00",
  },
  resumo: {
    clients: 15,
    vehicles: 20,
    suppliers: 10,
    products: 25,
    services: 10,
    appointments: 40,
    budgets: 25,
    orders: 40,
  },
}

function mockDashboard(overrides = {}) {
  server.use(http.get(`${API}/dashboard/`, () => HttpResponse.json({ ...PAYLOAD, ...overrides })))
}

describe("<Dashboard>", () => {
  beforeEach(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }),
    )
  })

  it("renderiza os quadros de movimentação, atendimentos e resumo", async () => {
    mockDashboard()
    renderWithProviders(<Dashboard />)

    expect(await screen.findByText("Movimentação")).toBeInTheDocument()
    expect(screen.getByText("OS faturadas")).toBeInTheDocument()
    expect(screen.getByText("45")).toBeInTheDocument()

    expect(screen.getByText("Atendimentos")).toBeInTheDocument()
    expect(screen.getByText("Clientes agendados na semana")).toBeInTheDocument()
    expect(screen.getByText("7")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /os #10/i })).toHaveAttribute("href", "/ordens/10")
    expect(screen.getByRole("link", { name: /criar orçamento/i })).toHaveAttribute(
      "href",
      "/orcamentos/novo",
    )

    expect(screen.getByText("Resumo")).toBeInTheDocument()
    expect(screen.getByText("15")).toBeInTheDocument()
  })

  it("admin vê o quadro financeiro do mês", async () => {
    mockDashboard()
    renderWithProviders(<Dashboard />)

    expect(await screen.findByText("Financeiro do mês")).toBeInTheDocument()
    expect(screen.getByText("Orçamentos em aberto")).toBeInTheDocument()
    expect(screen.getByText("R$ 900,00")).toBeInTheDocument()
    expect(screen.getByText("R$ 8.200,00")).toBeInTheDocument()
  })

  it("não-admin não vê o quadro financeiro", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "u@u.com", business_id: 3 }))
    mockDashboard()
    renderWithProviders(<Dashboard />)

    await screen.findByText("Movimentação")
    expect(screen.queryByText("Financeiro do mês")).not.toBeInTheDocument()
    expect(screen.queryByText("R$ 900,00")).not.toBeInTheDocument()
  })

  it("sem atendimentos mostra o estado vazio", async () => {
    mockDashboard({ atendimentos: { clientes_semana: [] } })
    renderWithProviders(<Dashboard />)

    expect(await screen.findByText(/nenhum atendimento agendado/i)).toBeInTheDocument()
  })

  it("esconde o total da semana quando o back não manda o campo", async () => {
    mockDashboard({ atendimentos: { clientes_semana: [] } })
    renderWithProviders(<Dashboard />)

    await screen.findByText("Atendimentos")
    expect(screen.queryByText("Clientes agendados na semana")).not.toBeInTheDocument()
  })

  it("mostra erro quando a API falha", async () => {
    server.use(http.get(`${API}/dashboard/`, () => new HttpResponse(null, { status: 500 })))
    renderWithProviders(<Dashboard />)

    expect(await screen.findByText(/não foi possível carregar/i)).toBeInTheDocument()
  })
})
