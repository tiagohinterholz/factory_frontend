import { describe, it, expect, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ExportReportButton from "./ExportReportButton"

let requestBody

beforeEach(() => {
  requestBody = null
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
  server.use(
    http.post(`${API}/relatorios/cashflow/`, async ({ request }) => {
      requestBody = await request.json()
      return HttpResponse.json({ id: 77, status: "pending" }, { status: 202 })
    }),
    http.get(`${API}/relatorios/77/`, () =>
      HttpResponse.json({ id: 77, status: "done", file_url: null }),
    ),
  )
})

describe("<ExportReportButton> — fluxo de caixa", () => {
  it("abre filtro de tipo e período e manda pro relatório (OSFIN-P3-05)", async () => {
    renderWithProviders(<ExportReportButton type="cashflow" label="Gerar Relatórios" />)

    fireEvent.click(screen.getByRole("button", { name: /gerar relatórios/i }))

    expect(screen.queryByText("Cliente")).not.toBeInTheDocument()
    fireEvent.click(await screen.findByRole("button", { name: /selecione o\(a\) tipo/i }))
    fireEvent.click(await screen.findByRole("option", { name: "Saídas" }))
    await screen.findByRole("button", { name: "Saídas" })
    const [dateFrom, dateTo] = document.querySelectorAll('input[type="date"]')
    fireEvent.change(dateFrom, { target: { value: "2026-10-01" } })
    fireEvent.change(dateTo, { target: { value: "2026-10-31" } })
    fireEvent.click(screen.getByRole("button", { name: "Gerar relatório" }))

    await waitFor(() =>
      expect(requestBody).toEqual({
        entry_type: "a_pagar",
        date_from: "2026-10-01",
        date_to: "2026-10-31",
      }),
    )
  })

  it("sem filtro nenhum manda o corpo vazio", async () => {
    renderWithProviders(<ExportReportButton type="cashflow" label="Gerar Relatórios" />)

    fireEvent.click(screen.getByRole("button", { name: /gerar relatórios/i }))
    fireEvent.click(await screen.findByRole("button", { name: "Gerar relatório" }))

    await waitFor(() => expect(requestBody).toEqual({}))
  })
})
