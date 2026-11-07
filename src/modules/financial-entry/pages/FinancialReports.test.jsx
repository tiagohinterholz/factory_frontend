import { describe, it, expect, beforeEach } from "vitest"
import { screen, fireEvent, waitFor, within } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import FinancialReports from "./FinancialReports"

let lastGranularity

function payload(granularity) {
  return {
    granularity,
    series: [
      { period: "2026-09-01", label: "09/2026", inflow: "1200.00", outflow: "300.00" },
      { period: "2026-10-01", label: "10/2026", inflow: "0.00", outflow: "450.00" },
    ],
    by_category: [
      { category_id: 1, name: "Venda de serviço/produto", inflow: "1200.00", outflow: "0.00" },
      { category_id: 4, name: "Aluguel", inflow: "0.00", outflow: "750.00" },
    ],
    inflow_total: "1200.00",
    outflow_total: "750.00",
  }
}

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
  server.use(
    http.get(`${API}/financeiro/graficos/`, ({ request }) => {
      lastGranularity = new URL(request.url).searchParams.get("granularity")
      return HttpResponse.json(payload(lastGranularity))
    }),
  )
})

describe("<FinancialReports>", () => {
  it("mostra totais, gráfico por período e por categoria (OSFIN-P3-06)", async () => {
    renderWithProviders(<FinancialReports />)

    expect(await screen.findByText("R$ 1.200,00", { selector: "p" })).toBeInTheDocument()
    expect(screen.getByText("R$ 750,00", { selector: "p" })).toBeInTheDocument()
    expect(screen.getByText("R$ 450,00", { selector: "p" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Entradas e saídas por período" })).toBeInTheDocument()
    expect(screen.getAllByTestId("period-group")).toHaveLength(2)
    expect(screen.getByText("Aluguel")).toBeInTheDocument()
    expect(screen.getAllByRole("list", { name: "Legenda" })).toHaveLength(2)
  })

  it("tabela traz os mesmos números do gráfico", async () => {
    renderWithProviders(<FinancialReports />)

    fireEvent.click(await screen.findByText("Ver tabela"))
    const table = screen.getByRole("table")
    expect(within(table).getByText("09/2026")).toBeInTheDocument()
    expect(within(table).getByText("R$ 1.200,00")).toBeInTheDocument()
  })

  it("troca a granularidade (dia/semana/mês/ano)", async () => {
    renderWithProviders(<FinancialReports />)
    await screen.findByText("Aluguel")
    expect(lastGranularity).toBe("month")

    fireEvent.click(screen.getByRole("button", { name: "Semana" }))

    await waitFor(() => expect(lastGranularity).toBe("week"))
  })
})
