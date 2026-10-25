import { describe, it, expect, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import FinancialEntryList from "./FinancialEntryList"

const ENTRY = {
  id: 7,
  entry_type: "a_pagar",
  category: "aluguel",
  description: "Aluguel do galpão",
  due_date: "2026-10-30",
  status: "pendente",
  amount: "3500.00",
}

function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user))
}

describe("<FinancialEntryList>", () => {
  beforeEach(() => {
    server.use(
      http.get(`${API}/financeiro/`, () => HttpResponse.json({ results: [ENTRY], count: 1 })),
    )
  })

  it("admin vê novo lançamento, marcar pago, cancelar e editar", async () => {
    setUser({ email: "a@a.com", business_id: 3, role: "admin" })
    renderWithProviders(<FinancialEntryList />)

    expect(await screen.findByText("Aluguel do galpão")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /novo lançamento/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Marcar como pago" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cancelar lançamento" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Ver/editar lançamento" })).toHaveAttribute(
      "href",
      "/financeiro/7",
    )
  })

  it("contador só visualiza: sem criar, marcar pago, cancelar nem editar", async () => {
    setUser({
      email: "c@a.com",
      business_id: 3,
      role: "contador",
      permissions: ["financial.view_financialentry", "core.can_export_reports"],
    })
    renderWithProviders(<FinancialEntryList />)

    expect(await screen.findByText("Aluguel do galpão")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /novo lançamento/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Marcar como pago" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Cancelar lançamento" })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Ver/editar lançamento" })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Ver lançamento" })).toHaveAttribute(
      "href",
      "/financeiro/7",
    )
  })
})
