import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { Routes, Route } from "react-router-dom"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import OrderEdit from "./OrderEdit"
import { OrderService } from "../services/order"

// O orçamento de origem aparece só leitura (não é editável pela OS — o vínculo
// nasce ao aprovar o orçamento). billing_date também não tem campo: o back grava
// ao faturar e o front só exibe a tarja.
const order = {
  id: 1,
  business: { id: 2 },
  client: { id: 5, first_name: "Ana", last_name: "Lima" },
  vehicle: { id: 9, manufacturer: "VW", model: "Gol", plate: "ABC1D23" },
  budget: { id: 77 },
  service_date: null,
  billing_date: null,
  status: "em andamento",
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
  it("mostra o orçamento de origem só leitura, sem <select> pra ele", async () => {
    mockApi()
    renderPage()

    expect(await screen.findByText("Orçamento de origem")).toBeInTheDocument()
    expect(screen.getByText("Orçamento #77")).toBeInTheDocument()
    expect(screen.queryByRole("combobox", { name: /orçamento/i })).not.toBeInTheDocument()
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

  it("não tem campo de data de faturamento no form", async () => {
    mockApi()
    renderPage()

    await screen.findByText("Orçamento de origem")
    expect(screen.queryByLabelText(/faturamento/i)).not.toBeInTheDocument()
  })

  it("faturado: mostra a tarja 'Faturado em <data>' com o billing_date do back", async () => {
    mockApi()
    server.use(
      http.get(`${API}/ordens/1/`, () =>
        HttpResponse.json({ ...order, status: "faturado", billing_date: "2026-09-10" }),
      ),
    )
    renderPage()

    expect(await screen.findByText(/Faturado em 10\/09\/2026/)).toBeInTheDocument()
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

describe("<OrderEdit> — finalizar serviço e trava de itens", () => {
  it("em andamento: mostra 'Finalizar serviço' e libera adicionar item", async () => {
    mockApi()
    renderPage()

    expect(await screen.findByRole("button", { name: /finalizar serviço/i })).toBeInTheDocument()
    expect(screen.getByText("Selecionar Produto")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Faturar OS" })).not.toBeInTheDocument()
  })

  it("finaliza o serviço pelo botão do header", async () => {
    mockApi()
    const finish = vi
      .spyOn(OrderService, "finishService")
      .mockResolvedValue({ status: "a faturar" })
    renderPage()

    fireEvent.click(await screen.findByRole("button", { name: /finalizar serviço/i }))
    fireEvent.click(await screen.findByRole("button", { name: "Finalizar" }))

    await waitFor(() => expect(finish).toHaveBeenCalledWith("1"))
    finish.mockRestore()
  })

  it("a faturar: itens travados e aparece 'Faturar OS'", async () => {
    mockApi()
    server.use(
      http.get(`${API}/ordens/1/`, () => HttpResponse.json({ ...order, status: "a faturar" })),
    )
    renderPage()

    expect(await screen.findByText(/Itens travados/i)).toBeInTheDocument()
    expect(screen.queryByText("Selecionar Produto")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Faturar OS" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /finalizar serviço/i })).not.toBeInTheDocument()
  })
})
