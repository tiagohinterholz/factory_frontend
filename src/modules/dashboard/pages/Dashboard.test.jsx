import { describe, it, expect, beforeEach } from "vitest"
import { screen, within } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import Dashboard from "./Dashboard"

const PAYLOAD = {
  activity: { orders_to_bill_today: 3, orders_to_bill: 12, orders_billed: 45 },
  // "Atendimentos" (aguardando/em andamento) e "Movimentação" (a faturar/
  // faturado) vêm em chaves separadas — o back já filtra, o front só exibe.
  appointments: {
    scheduled_this_week: [
      {
        id: 1,
        client_id: 5,
        client_name: "Maria Souza",
        contact: "(51) 98888-8888",
        vehicle_id: 4,
        vehicle: "XYZ9876 - Gol",
        date: "2026-09-08",
        time: "09:00:00",
        order: null,
        budget: null,
      },
    ],
    total_scheduled_this_week: 7,
  },
  movements: {
    bills_this_week: [
      {
        id: 2,
        client_id: 6,
        client_name: "João Silva",
        contact: "(51) 99999-9999",
        vehicle_id: 3,
        vehicle: "ABC1234 - Onix",
        date: "2026-09-07",
        time: "14:00:00",
        order: { id: 10, status: "a faturar" },
        budget: null,
      },
      {
        id: 3,
        client_id: 7,
        client_name: "Pedro Alves",
        contact: "(51) 97777-7777",
        vehicle_id: 8,
        vehicle: "QWE4321 - HB20",
        date: "2026-09-06",
        time: "10:00:00",
        order: { id: 11, status: "faturado" },
        budget: null,
      },
    ],
    total_bills_this_week: 2,
  },
  financial: {
    to_bill_total: "1500.00",
    billed_total: "8200.00",
    open_budgets_total: "900.00",
  },
  summary: {
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
    expect(screen.getByText("45")).toBeInTheDocument()

    expect(screen.getByText("Atendimentos")).toBeInTheDocument()
    expect(screen.getByText("Clientes agendados na semana")).toBeInTheDocument()
    expect(screen.getByText("7")).toBeInTheDocument()

    // "Movimentação" separado em dois sub-quadros: "A faturar" e "Faturadas"
    // (h3, pra não colidir com o MiniStat de mesmo nome no cabeçalho)
    const toBillPanel = screen
      .getByRole("heading", { name: "A faturar", level: 3 })
      .closest(".rounded-lg")
    expect(within(toBillPanel).getByText("João Silva")).toBeInTheDocument()
    expect(within(toBillPanel).queryByText("Pedro Alves")).not.toBeInTheDocument()

    const billedPanel = screen
      .getByRole("heading", { name: "Faturadas", level: 3 })
      .closest(".rounded-lg")
    expect(within(billedPanel).getByText("Pedro Alves")).toBeInTheDocument()
    expect(within(billedPanel).queryByText("João Silva")).not.toBeInTheDocument()

    const movementCard = screen.getByRole("button", { name: /editar agendamento de joão silva/i })
    expect(within(movementCard).getByRole("link", { name: /os #10/i })).toHaveAttribute(
      "href",
      "/ordens/10",
    )
    // com OS vinculada, o card não oferece "Criar Orçamento"
    expect(
      within(movementCard).queryByRole("link", { name: /criar orçamento/i }),
    ).not.toBeInTheDocument()

    // o card de Atendimentos (sem OS) oferece o atalho normalmente
    const serviceCard = screen.getByRole("button", { name: /editar agendamento de maria souza/i })
    expect(within(serviceCard).getByRole("link", { name: /criar orçamento/i })).toBeInTheDocument()

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
    mockDashboard({
      appointments: { scheduled_this_week: [] },
      movements: { bills_this_week: [] },
    })
    renderWithProviders(<Dashboard />)

    expect(await screen.findByText(/nenhum atendimento em aberto/i)).toBeInTheDocument()
    expect(screen.getByText(/nenhuma os a faturar ou faturada/i)).toBeInTheDocument()
  })

  it("'A faturar' vazio mas 'Faturadas' com item: cada sub-quadro mostra o próprio estado", async () => {
    mockDashboard({
      movements: {
        bills_this_week: [
          {
            id: 3,
            client_id: 7,
            client_name: "Pedro Alves",
            contact: "(51) 97777-7777",
            vehicle_id: 8,
            vehicle: "QWE4321 - HB20",
            date: "2026-09-06",
            time: "10:00:00",
            order: { id: 11, status: "faturado" },
            budget: null,
          },
        ],
        total_bills_this_week: 1,
      },
    })
    renderWithProviders(<Dashboard />)

    await screen.findByText("Movimentação")
    expect(screen.getByText("Nenhuma OS a faturar.")).toBeInTheDocument()
    expect(screen.getByText("Pedro Alves")).toBeInTheDocument()
  })

  it("esconde o total da semana quando o back não manda o campo", async () => {
    mockDashboard({ appointments: { scheduled_this_week: [] } })
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
