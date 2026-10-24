import { describe, it, expect, beforeEach, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import FinancialEntryCreate from "./FinancialEntryCreate"
import { FinancialEntryService } from "../services/financial-entry"

const CATEGORIES = [
  { id: 1, name: "Aluguel", code: "aluguel", is_active: true, is_system: true },
  { id: 2, name: "Venda de serviço/produto", code: "venda_servico", is_active: true },
  { id: 9, name: "Marketing", code: null, is_active: true, is_system: false },
]

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
  server.use(
    http.get(`${API}/categorias-financeiro/`, () =>
      HttpResponse.json({ results: CATEGORIES, count: CATEGORIES.length }),
    ),
    http.get(`${API}/categorias-financeiro/:id/subcategorias/`, ({ params }) =>
      HttpResponse.json(
        params.id === "9"
          ? { results: [{ id: 30, name: "Redes sociais" }], count: 1 }
          : { results: [], count: 0 },
      ),
    ),
    http.get(`${API}/financeiro/tags/`, () =>
      HttpResponse.json({ results: [{ id: 1, name: "Urgente" }], count: 1 }),
    ),
  )
})

async function fillBasics() {
  fireEvent.change(document.querySelector('input[name="due_date"]'), {
    target: { value: "2026-11-05" },
  })
  fireEvent.change(screen.getByPlaceholderText("R$ 0,00"), { target: { value: "25000" } })
}

describe("<FinancialEntryCreate>", () => {
  it("live-select mostra só categorias permitidas em lançamento manual", async () => {
    const user = userEvent.setup()
    renderWithProviders(<FinancialEntryCreate />)

    await user.click(screen.getByPlaceholderText(/selecione o\(a\) categoria/i))

    expect(await screen.findByRole("option", { name: "Marketing" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Aluguel" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: /venda de serviço/i })).not.toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Cadastrar nova categoria" })).toBeInTheDocument()
  })

  it("categoria própria vai como 'outro' + categoria financeira, com subcategoria e tags", async () => {
    const user = userEvent.setup()
    const create = vi
      .spyOn(FinancialEntryService, "createFinancialEntry")
      .mockResolvedValue({ id: 1 })
    renderWithProviders(<FinancialEntryCreate />)

    await user.click(screen.getByPlaceholderText(/selecione o\(a\) categoria/i))
    await user.click(await screen.findByRole("option", { name: "Marketing" }))
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "Redes sociais" })).toBeInTheDocument(),
    )
    fireEvent.change(document.querySelector('select[name="financial_subcategory_id"]'), {
      target: { value: "30" },
    })
    await user.type(screen.getByLabelText("Tags"), "Campanha{Enter}")
    await fillBasics()
    fireEvent.click(screen.getByRole("button", { name: /criar lançamento/i }))

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "outro",
          financial_category_id: "9",
          financial_subcategory_id: "30",
          tags: ["Campanha"],
        }),
      ),
    )
    create.mockRestore()
  })

  it("categoria do sistema manda o código legado correspondente", async () => {
    const user = userEvent.setup()
    const create = vi
      .spyOn(FinancialEntryService, "createFinancialEntry")
      .mockResolvedValue({ id: 1 })
    renderWithProviders(<FinancialEntryCreate />)

    await user.click(screen.getByPlaceholderText(/selecione o\(a\) categoria/i))
    await user.click(await screen.findByRole("option", { name: "Aluguel" }))
    await fillBasics()
    fireEvent.click(screen.getByRole("button", { name: /criar lançamento/i }))

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ category: "aluguel", financial_category_id: "1" }),
      ),
    )
    create.mockRestore()
  })

  it("sem categoria não envia", async () => {
    const create = vi.spyOn(FinancialEntryService, "createFinancialEntry")
    renderWithProviders(<FinancialEntryCreate />)

    await fillBasics()
    fireEvent.click(screen.getByRole("button", { name: /criar lançamento/i }))

    expect(await screen.findByText("Selecione a categoria")).toBeInTheDocument()
    expect(create).not.toHaveBeenCalled()
  })
})
