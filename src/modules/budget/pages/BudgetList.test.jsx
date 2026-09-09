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

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateSpy }
})

let lastBudgetsUrl

function mockBudgets(results) {
  server.use(
    http.get(`${API}/orcamentos/`, ({ request }) => {
      lastBudgetsUrl = new URL(request.url)
      return HttpResponse.json({
        results: results ?? [
          {
            id: 12,
            first_name: "Ana",
            vehicle_name: "Gol ABC1D23",
            valid_until: "2026-10-05T23:59:59-03:00",
            status: "pendente",
            total: "150.00",
          },
        ],
        count: (results ?? [1]).length,
      })
    }),
    // filtro de Cliente puxa a lista completa de clientes
    http.get(`${API}/clientes/`, () =>
      HttpResponse.json({
        results: [{ id: 5, first_name: "Ana", last_name: "Lima" }],
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

  it("coluna 'Situação em': mostra a data da ação conforme o status", async () => {
    mockBudgets([
      { id: 1, status: "pendente", total: "0", valid_until: "2026-10-01T00:00:00Z" },
      {
        id: 2,
        status: "aprovado",
        approved_at: "2026-09-06T12:00:00Z",
        cancelled_at: null,
        total: "0",
        valid_until: "2026-10-01T00:00:00Z",
      },
      {
        id: 3,
        status: "cancelado",
        approved_at: null,
        cancelled_at: "2026-09-05T12:00:00Z",
        total: "0",
        valid_until: "2026-10-01T00:00:00Z",
      },
      {
        id: 4,
        status: "expirado",
        approved_at: null,
        cancelled_at: null,
        total: "0",
        valid_until: "2026-09-04T12:00:00Z",
      },
    ])
    renderWithProviders(<BudgetList />)

    await screen.findByText("#1")
    // pendente -> "—"
    expect(screen.getByText("—")).toBeInTheDocument()
    // aprovado -> approved_at; cancelado -> cancelled_at; expirado -> valid_until
    expect(screen.getByText(/06\/09\/2026/)).toBeInTheDocument()
    expect(screen.getByText(/05\/09\/2026/)).toBeInTheDocument()
    // no expirado a "Situação em" == "Validade" (ambas = valid_until), daí o getAll
    expect(screen.getAllByText(/04\/09\/2026/).length).toBeGreaterThan(0)
  })

  it("aprovar/cancelar aparecem só na linha de orçamento pendente", async () => {
    mockBudgets([
      { id: 1, status: "pendente", total: "0", valid_until: "2026-10-01T00:00:00Z" },
      {
        id: 2,
        status: "aprovado",
        approved_at: "2026-09-06T12:00:00Z",
        total: "0",
        valid_until: "2026-10-01T00:00:00Z",
      },
    ])
    renderWithProviders(<BudgetList />)
    await screen.findByText("#1")

    expect(screen.getAllByRole("button", { name: "Aprovar orçamento" })).toHaveLength(1)
    expect(screen.getAllByRole("button", { name: "Cancelar orçamento" })).toHaveLength(1)
  })

  it("aprova sem data pela linha: abre o modal e confirma (sem service_date)", async () => {
    mockBudgets([{ id: 1, status: "pendente", total: "0", valid_until: "2026-10-01T00:00:00Z" }])
    const approve = vi.spyOn(BudgetService, "approveBudget").mockResolvedValue({})

    renderWithProviders(<BudgetList />)
    await screen.findByText("#1")

    fireEvent.click(screen.getByRole("button", { name: "Aprovar orçamento" }))
    fireEvent.click(await screen.findByRole("button", { name: "Aprovar" }))

    await waitFor(() => expect(approve).toHaveBeenCalledWith(1, undefined))
    approve.mockRestore()
  })

  it("aprova com data: o datetime do modal vai como service_date ISO no approve", async () => {
    mockBudgets([{ id: 1, status: "pendente", total: "0", valid_until: "2026-10-01T00:00:00Z" }])
    const approve = vi.spyOn(BudgetService, "approveBudget").mockResolvedValue({})

    renderWithProviders(<BudgetList />)
    await screen.findByText("#1")

    fireEvent.click(screen.getByRole("button", { name: "Aprovar orçamento" }))
    const input = await screen.findByLabelText(/data e hora do serviço/i)
    fireEvent.change(input, { target: { value: "2026-09-10T14:30" } })
    fireEvent.click(screen.getByRole("button", { name: "Aprovar" }))

    await waitFor(() =>
      expect(approve).toHaveBeenCalledWith(1, {
        service_date: new Date("2026-09-10T14:30").toISOString(),
      }),
    )
    approve.mockRestore()
  })

  it("aplica os filtros: 'Filtros' > status > 'Filtrar' manda ?status= na requisição", async () => {
    mockBudgets()
    renderWithProviders(<BudgetList />)
    await screen.findByText("#12")

    fireEvent.click(screen.getByRole("button", { name: /filtros/i }))
    fireEvent.click(await screen.findByRole("button", { name: /selecione o\(a\) status/i }))
    fireEvent.click(await screen.findByRole("option", { name: "Aprovado" }))
    fireEvent.click(screen.getByRole("button", { name: "Filtrar" }))

    await waitFor(() => expect(lastBudgetsUrl.searchParams.get("status")).toBe("aprovado"))
    // sem search fuzzy
    expect(lastBudgetsUrl.searchParams.has("search")).toBe(false)
  })

  it("ordena pelo cabeçalho: 1º clique asc, 2º desc (?ordering=)", async () => {
    mockBudgets()
    renderWithProviders(<BudgetList />)
    await screen.findByText("#12")

    const totalHeader = screen.getByRole("button", { name: /total/i })
    fireEvent.click(totalHeader)
    await waitFor(() => expect(lastBudgetsUrl.searchParams.get("ordering")).toBe("total"))

    fireEvent.click(totalHeader)
    await waitFor(() => expect(lastBudgetsUrl.searchParams.get("ordering")).toBe("-total"))
  })

  it("Duplicar só aparece em orçamento cancelado ou expirado", async () => {
    mockBudgets([
      { id: 1, status: "pendente", total: "0", valid_until: "2026-10-01T00:00:00Z" },
      { id: 2, status: "aprovado", total: "0", valid_until: "2026-10-01T00:00:00Z" },
      { id: 3, status: "cancelado", total: "0", valid_until: "2026-10-01T00:00:00Z" },
      { id: 4, status: "expirado", total: "0", valid_until: "2026-09-01T00:00:00Z" },
    ])
    renderWithProviders(<BudgetList />)
    await screen.findByText("#1")

    expect(screen.getAllByRole("button", { name: "Duplicar orçamento" })).toHaveLength(2)
  })

  it("duplica pelo botão da linha e navega pro orçamento novo", async () => {
    mockBudgets([{ id: 3, status: "cancelado", total: "0", valid_until: "2026-10-01T00:00:00Z" }])
    const duplicate = vi
      .spyOn(BudgetService, "duplicateBudget")
      .mockResolvedValue({ id: 99, status: "pendente" })

    renderWithProviders(<BudgetList />)
    await screen.findByText("#3")

    fireEvent.click(screen.getByRole("button", { name: "Duplicar orçamento" }))
    fireEvent.click(await screen.findByRole("button", { name: "Duplicar" }))

    await waitFor(() => expect(duplicate).toHaveBeenCalledWith(3))
    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith("/orcamentos/99"))

    duplicate.mockRestore()
  })
})
