import { describe, it, expect } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import { http, HttpResponse, delay } from "msw"
import { Routes, Route } from "react-router-dom"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import BudgetEdit from "./BudgetEdit"

// BUG-1: na 1ª visita, o form.reset roda antes das listas de opção chegarem
// (useClientOptions etc buscam todas as páginas). Os <select> do RHF são
// uncontrolled: sem a <option> no DOM na hora do reset, o campo fica vazio.
// O guard de loading da página tem que segurar o render até as opções virem.

const budget = {
  id: 1,
  business: { id: 2 },
  client: { id: 5, first_name: "Ana", last_name: "Lima" },
  vehicle: { id: 9, manufacturer: "VW", model: "Gol", plate: "ABC1D23" },
  valid_until: null,
  status: "pendente",
  total: "0.00",
  budget_products: [],
  budget_services: [],
}

function mockApi({ clientsDelayMs = 0 } = {}) {
  server.use(
    http.get(`${API}/orcamentos/1/`, () => HttpResponse.json(budget)),
    http.get(`${API}/empreendimentos/`, () =>
      HttpResponse.json({ results: [{ id: 2, corporate_name: "Oficina Teste" }], count: 1 }),
    ),
    http.get(`${API}/clientes/`, async () => {
      if (clientsDelayMs) await delay(clientsDelayMs)
      return HttpResponse.json({
        results: [{ id: 5, first_name: "Ana", last_name: "Lima", business: 2 }],
        count: 1,
      })
    }),
    http.get(`${API}/veiculos/`, () =>
      HttpResponse.json({
        results: [{ id: 9, client: 5, manufacturer: "VW", model: "Gol", plate: "ABC1D23" }],
        count: 1,
      }),
    ),
    http.get(`${API}/produtos/`, () => HttpResponse.json({ results: [], count: 0 })),
    http.get(`${API}/servicos/`, () => HttpResponse.json({ results: [], count: 0 })),
  )
}

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/orcamentos/:id" element={<BudgetEdit />} />
    </Routes>,
    { route: "/orcamentos/1" },
  )

describe("<BudgetEdit> — BUG-1 (opções antes do form)", () => {
  it("segura o render enquanto as listas de opção não chegaram", () => {
    mockApi({ clientsDelayMs: 60 })
    renderPage()
    expect(screen.getByText(/carregando/i)).toBeInTheDocument()
  })

  it("com as opções carregadas, o select de Cliente já vem com o cliente do orçamento", async () => {
    mockApi({ clientsDelayMs: 60 })
    renderPage()

    await waitFor(() =>
      expect(screen.getByRole("option", { name: "Ana Lima", selected: true })).toBeInTheDocument(),
    )
    // e o de Veículo também
    expect(
      screen.getByRole("option", { name: /VW Gol \(ABC1D23\)/, selected: true }),
    ).toBeInTheDocument()
  })
})
