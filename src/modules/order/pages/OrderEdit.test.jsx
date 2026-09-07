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
  total: "6000.00",
  products_total: "5000.00",
  services_total: "1000.00",
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

  it("mostra o subtotal de produtos, o de serviços e o total geral do back", async () => {
    mockApi()
    renderPage()

    expect(await screen.findByText("Subtotal produtos")).toBeInTheDocument()
    expect(screen.getByText("R$ 5000.00")).toBeInTheDocument()
    expect(screen.getByText("Subtotal serviços")).toBeInTheDocument()
    expect(screen.getByText("R$ 1000.00")).toBeInTheDocument()
    expect(screen.getByText("Total geral")).toBeInTheDocument()
    expect(screen.getByText("R$ 6000.00")).toBeInTheDocument()
  })

  it("não lista item com is_active=false (deletado que o back ainda devolve)", async () => {
    mockApi()
    server.use(
      http.get(`${API}/ordens/1/`, () =>
        HttpResponse.json({
          ...order,
          order_products: [
            {
              id: 1,
              quantity: 1,
              total: "10.00",
              is_active: true,
              product: { name: "Peça ativa" },
            },
            {
              id: 2,
              quantity: 1,
              total: "20.00",
              is_active: false,
              product: { name: "Peça deletada" },
            },
          ],
        }),
      ),
    )
    renderPage()

    expect(await screen.findByText(/Peça ativa/)).toBeInTheDocument()
    expect(screen.queryByText(/Peça deletada/)).not.toBeInTheDocument()
  })
})
