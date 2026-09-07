import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import BudgetList from "./BudgetList"
import { BudgetService } from "../services/budgets"
import { openPdfBlob } from "@/api/open-pdf"

vi.mock("@/api/open-pdf", () => ({ openPdfBlob: vi.fn() }))

function mockBudgets() {
  server.use(
    http.get(`${API}/orcamentos/`, () =>
      HttpResponse.json({
        results: [
          {
            id: 12,
            first_name: "Ana",
            vehicle_name: "Gol ABC1D23",
            valid_until: "2026-10-05T23:59:59-03:00",
            status: "pendente",
            total: "150.00",
          },
        ],
        count: 1,
      }),
    ),
  )
}

describe("<BudgetList>", () => {
  it("renderiza a tabela com os dados da API", async () => {
    mockBudgets()
    renderWithProviders(<BudgetList />)

    expect(await screen.findByText("#12")).toBeInTheDocument()
    expect(screen.getByText("pendente")).toBeInTheDocument()
  })

  it("gera o PDF do orçamento pela linha da tabela", async () => {
    mockBudgets()
    const blob = new Blob(["%PDF-1.4"], { type: "application/pdf" })
    const getPdf = vi.spyOn(BudgetService, "getBudgetPdf").mockResolvedValue(blob)

    renderWithProviders(<BudgetList />)
    await screen.findByText("#12")

    fireEvent.click(screen.getByRole("button", { name: /gerar pdf do orçamento/i }))

    await waitFor(() => expect(getPdf).toHaveBeenCalledWith(12))
    await waitFor(() => expect(openPdfBlob).toHaveBeenCalledWith(blob))

    getPdf.mockRestore()
  })
})
