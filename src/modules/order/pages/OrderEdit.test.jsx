import { describe, it, expect } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import { Routes, Route } from "react-router-dom"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import OrderEdit from "./OrderEdit"

// OS aprovada a partir de um orçamento: o form tem que carregar o orçamento
// que originou a OS no <select>. Antes o campo ficava vazio porque as opções
// vinham do hook de LISTA paginada (só a 1ª página) e o guard de loading nem
// esperava por elas.
const order = {
  id: 1,
  business: { id: 2 },
  client: { id: 5, first_name: "Ana", last_name: "Lima" },
  vehicle: { id: 9, manufacturer: "VW", model: "Gol", plate: "ABC1D23" },
  budget: { id: 77 },
  service_date: null,
  billing_date: null,
  status: "a faturar",
  total: "0.00",
  order_products: [],
  order_services: [],
}

function mockApi() {
  server.use(
    http.get(`${API}/ordens/1/`, () => HttpResponse.json(order)),
    http.get(`${API}/empreendimentos/`, () =>
      HttpResponse.json({ results: [{ id: 2, corporate_name: "Oficina Teste" }], count: 1 }),
    ),
    http.get(`${API}/clientes/`, () =>
      HttpResponse.json({
        results: [{ id: 5, first_name: "Ana", last_name: "Lima", business: 2 }],
        count: 1,
      }),
    ),
    http.get(`${API}/veiculos/`, () =>
      HttpResponse.json({
        results: [{ id: 9, client: 5, manufacturer: "VW", model: "Gol", plate: "ABC1D23" }],
        count: 1,
      }),
    ),
    // o orçamento #77 está aqui — o <select> precisa da <option> pra exibir
    http.get(`${API}/orcamentos/`, () =>
      HttpResponse.json({
        results: [
          { id: 40, first_name: "Outro" },
          { id: 77, first_name: "Ana" },
        ],
        count: 2,
      }),
    ),
    http.get(`${API}/produtos/`, () => HttpResponse.json({ results: [], count: 0 })),
    http.get(`${API}/servicos/`, () => HttpResponse.json({ results: [], count: 0 })),
  )
}

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/ordens/:id" element={<OrderEdit />} />
    </Routes>,
    { route: "/ordens/1" },
  )

describe("<OrderEdit>", () => {
  it("carrega o orçamento que originou a OS no select", async () => {
    mockApi()
    renderPage()

    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "Orçamento #77", selected: true }),
      ).toBeInTheDocument(),
    )
  })
})
