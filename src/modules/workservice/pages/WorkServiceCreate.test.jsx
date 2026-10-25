import { describe, it, expect, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import WorkServiceCreate from "./WorkServiceCreate"

function mockApi() {
  server.use(
    http.get(`${API}/fornecedores/`, () =>
      HttpResponse.json({ results: [{ id: 9, corporate_name: "Bosch Ltda" }], count: 1 }),
    ),
  )
}

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

describe("<WorkServiceCreate>", () => {
  it("tem o campo de preço de custo (opcional), além do preço de venda (CVSP-P3-07)", async () => {
    mockApi()
    renderWithProviders(<WorkServiceCreate />)

    expect(await screen.findByText("Preço Unitário")).toBeInTheDocument()
    expect(screen.getByText("Preço de Custo (opcional)")).toBeInTheDocument()
  })

  it("envia cost_price quando informado", async () => {
    mockApi()
    let receivedBody
    server.use(
      http.post(`${API}/servicos/`, async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json({ id: 1, ...receivedBody }, { status: 201 })
      }),
    )
    renderWithProviders(<WorkServiceCreate />)

    await screen.findByText("Fornecedor")
    fireEvent.change(screen.getByText("Fornecedor").closest("div").querySelector("select"), {
      target: { value: "9" },
    })
    fireEvent.change(screen.getByPlaceholderText("Ex: Troca de óleo"), {
      target: { value: "Troca de óleo" },
    })
    fireEvent.change(screen.getByPlaceholderText("Detalhes técnicos..."), {
      target: { value: "Serviço completo" },
    })
    fireEvent.change(screen.getByText("Preço Unitário").closest("div").querySelector("input"), {
      target: { value: "10000" },
    })
    fireEvent.change(
      screen.getByText("Preço de Custo (opcional)").closest("div").querySelector("input"),
      { target: { value: "5000" } },
    )

    fireEvent.click(screen.getByRole("button", { name: /adicionar serviço/i }))

    await waitFor(() => expect(receivedBody).toBeTruthy())
    expect(receivedBody.cost_price).toBe(50)
  })
})
