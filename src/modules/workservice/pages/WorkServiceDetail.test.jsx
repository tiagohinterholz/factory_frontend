import { describe, it, expect, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import { Routes, Route } from "react-router-dom"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import WorkServiceDetail from "./WorkServiceDetail"

function mockService() {
  server.use(
    http.get(`${API}/servicos/1/`, () =>
      HttpResponse.json({
        id: 1,
        business: 3,
        supplier: 9,
        name: "Troca de óleo",
        description: "Serviço completo",
        unit_price: "100.00",
        cost_price: "40.00",
      }),
    ),
    http.get(`${API}/fornecedores/`, () =>
      HttpResponse.json({ results: [{ id: 9, corporate_name: "Bosch Ltda" }], count: 1 }),
    ),
  )
}

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/servicos/:id" element={<WorkServiceDetail />} />
    </Routes>,
    { route: "/servicos/1" },
  )

describe("<WorkServiceDetail>", () => {
  it("mostra o campo de preço de custo já preenchido, além do preço de venda (CVSP-P3-07)", async () => {
    mockService()
    renderPage()

    expect(await screen.findByText("Preço do Serviço (Mão de Obra)")).toBeInTheDocument()
    expect(screen.getByText("Preço de Custo (opcional)")).toBeInTheDocument()
    expect(screen.getByDisplayValue("R$ 40,00")).toBeInTheDocument()
  })
})
