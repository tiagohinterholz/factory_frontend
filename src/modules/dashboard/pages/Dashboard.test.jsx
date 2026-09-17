import { describe, it, expect, beforeEach } from "vitest"
import { screen, fireEvent, within } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import Dashboard from "./Dashboard"

const PAYLOAD = {
  activity: { orders_to_bill_today: 3, orders_to_bill: 12, orders_billed: 45 },
  // "Atendimentos" (aguardando/em andamento) e "Movimentação" (a faturar/
  // faturado) vêm em chaves separadas — o back já filtra, o front junta tudo
  // num quadro só e alterna por status via toggle.
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
      {
        id: 4,
        client_id: 9,
        client_name: "Fernanda Lopes",
        contact: "(51) 96666-6666",
        vehicle_id: 10,
        vehicle: "RST1122 - HB20",
        date: "2099-01-01",
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
    entries_by_status: {
      a_receber: {
        pendente: { count: 2, total: "490.00" },
        pago: { count: 3, total: "2640.00" },
        atrasado: { count: 1, total: "480.00" },
        cancelado: { count: 1, total: "390.00" },
      },
      a_pagar: {
        pendente: { count: 2, total: "12760.00" },
        pago: { count: 2, total: "4320.00" },
        atrasado: { count: 2, total: "1430.00" },
        cancelado: { count: 0, total: "0.00" },
      },
    },
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

// GET /financeiro/ (lista filtrada do card "Financeiro do mês") — devolve
// entradas diferentes conforme entry_type+status, pra dar pra testar a troca
// de aba sem precisar decorar o formato de paginação do DRF.
const FINANCIAL_ENTRIES = {
  "a_receber:pendente": [
    { id: 51, order: { id: 1051 }, due_date: "2026-09-22", amount: "340.00", status: "pendente" },
  ],
  "a_pagar:pendente": [
    {
      id: 60,
      order: null,
      description: "Folha de pagamento — Setembro",
      due_date: "2026-09-30",
      amount: "12500.00",
      status: "pendente",
    },
  ],
}

function mockFinancialEntries() {
  server.use(
    http.get(`${API}/financeiro/`, ({ request }) => {
      const url = new URL(request.url)
      const key = `${url.searchParams.get("entry_type")}:${url.searchParams.get("status")}`
      const results = FINANCIAL_ENTRIES[key] ?? []
      return HttpResponse.json({ results, count: results.length })
    }),
  )
}

describe("<Dashboard>", () => {
  beforeEach(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }),
    )
  })

  it("um quadro só com toggle — abre em 'Em Andamento' e mostra os mini-stats", async () => {
    mockDashboard()
    mockFinancialEntries()
    renderWithProviders(<Dashboard />)

    expect(await screen.findByText("Atendimentos e Movimentação")).toBeInTheDocument()
    expect(screen.getByText("Agendados na semana")).toBeInTheDocument()
    expect(screen.getByText("A faturar hoje")).toBeInTheDocument()

    // abre em "Em Andamento": só Maria Souza aparece
    expect(screen.getByText("Maria Souza")).toBeInTheDocument()
    expect(screen.queryByText("Fernanda Lopes")).not.toBeInTheDocument()
    expect(screen.queryByText("João Silva")).not.toBeInTheDocument()
    expect(screen.queryByText("Pedro Alves")).not.toBeInTheDocument()
  })

  it("alterna pro 'Aguardando Execução' e mostra só quem tá nesse status", async () => {
    mockDashboard()
    mockFinancialEntries()
    renderWithProviders(<Dashboard />)

    await screen.findByText("Maria Souza")
    fireEvent.click(screen.getByRole("button", { name: /^aguardando execução/i }))

    expect(await screen.findByText("Fernanda Lopes")).toBeInTheDocument()
    expect(screen.queryByText("Maria Souza")).not.toBeInTheDocument()
  })

  it("alterna pro 'A Faturar' e mostra só a OS a faturar", async () => {
    mockDashboard()
    mockFinancialEntries()
    renderWithProviders(<Dashboard />)

    await screen.findByText("Maria Souza")
    fireEvent.click(screen.getByRole("button", { name: /^a faturar/i }))

    const card = await screen.findByRole("button", { name: /editar agendamento de joão silva/i })
    expect(within(card).getByRole("link", { name: /os #10/i })).toHaveAttribute(
      "href",
      "/ordens/10",
    )
    expect(screen.queryByText("Pedro Alves")).not.toBeInTheDocument()
  })

  it("alterna pro 'Faturadas' e mostra só a OS faturada", async () => {
    mockDashboard()
    mockFinancialEntries()
    renderWithProviders(<Dashboard />)

    await screen.findByText("Maria Souza")
    fireEvent.click(screen.getByRole("button", { name: /^faturadas/i }))

    expect(await screen.findByText("Pedro Alves")).toBeInTheDocument()
    expect(screen.queryByText("João Silva")).not.toBeInTheDocument()
  })

  it("admin vê o quadro financeiro do mês com os mini-stats em R$", async () => {
    mockDashboard()
    mockFinancialEntries()
    renderWithProviders(<Dashboard />)

    expect(await screen.findByText("Financeiro do mês")).toBeInTheDocument()
    // A faturar = a_receber pendente(490) + atrasado(480)
    expect(screen.getByText("R$ 970,00")).toBeInTheDocument()
    // Faturado = a_receber pago
    expect(screen.getByText("R$ 2.640,00")).toBeInTheDocument()
    // A pagar em aberto = a_pagar pendente(12760) + atrasado(1430)
    expect(screen.getByText("R$ 14.190,00")).toBeInTheDocument()
  })

  it("não-admin não vê o quadro financeiro", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "u@u.com", business_id: 3 }))
    mockDashboard()
    renderWithProviders(<Dashboard />)

    await screen.findByText("Atendimentos e Movimentação")
    expect(screen.queryByText("Financeiro do mês")).not.toBeInTheDocument()
    expect(screen.queryByText("R$ 970,00")).not.toBeInTheDocument()
  })

  it("abre em 'A receber' + 'Pendente' e lista o lançamento correspondente", async () => {
    mockDashboard()
    mockFinancialEntries()
    renderWithProviders(<Dashboard />)

    await screen.findByText("Financeiro do mês")

    expect(await screen.findByText("OS #1051")).toBeInTheDocument()
    expect(screen.getByText("R$ 340,00")).toBeInTheDocument()
  })

  it("troca pro Tipo 'A pagar' e recalcula o filtro de Status", async () => {
    mockDashboard()
    mockFinancialEntries()
    renderWithProviders(<Dashboard />)

    await screen.findByText("OS #1051")
    fireEvent.click(screen.getByRole("button", { name: /^a pagar/i }))

    expect(await screen.findByText("Folha de pagamento — Setembro")).toBeInTheDocument()
    expect(screen.queryByText("OS #1051")).not.toBeInTheDocument()
  })

  it("lançamento sem cobrança nesse filtro mostra o estado vazio", async () => {
    mockDashboard()
    mockFinancialEntries()
    renderWithProviders(<Dashboard />)

    await screen.findByText("OS #1051")
    fireEvent.click(screen.getByRole("button", { name: /^cancelado/i }))

    expect(
      await screen.findByText("Nenhum lançamento cancelados neste tipo, no mês."),
    ).toBeInTheDocument()
  })

  it("sem nada em 'Em Andamento' mostra o estado vazio dessa posição", async () => {
    mockDashboard({
      appointments: { scheduled_this_week: [] },
      movements: { bills_this_week: [] },
    })
    mockFinancialEntries()
    renderWithProviders(<Dashboard />)

    expect(await screen.findByText("Nenhum atendimento em andamento.")).toBeInTheDocument()
  })

  it("Resumo continua mostrando os totais do empreendimento", async () => {
    mockDashboard()
    mockFinancialEntries()
    renderWithProviders(<Dashboard />)

    await screen.findByText("Atendimentos e Movimentação")
    expect(screen.getByText("Resumo")).toBeInTheDocument()
    expect(screen.getByText("15")).toBeInTheDocument()
  })

  it("esconde 'Agendados na semana' quando o back não manda o campo", async () => {
    mockDashboard({ appointments: { scheduled_this_week: [], total_scheduled_this_week: null } })
    mockFinancialEntries()
    renderWithProviders(<Dashboard />)

    await screen.findByText("Atendimentos e Movimentação")
    expect(screen.queryByText("Agendados na semana")).not.toBeInTheDocument()
  })

  it("mostra erro quando a API falha", async () => {
    server.use(http.get(`${API}/dashboard/`, () => new HttpResponse(null, { status: 500 })))
    renderWithProviders(<Dashboard />)

    expect(await screen.findByText(/não foi possível carregar/i)).toBeInTheDocument()
  })
})
