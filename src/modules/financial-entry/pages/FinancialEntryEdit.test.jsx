import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { Routes, Route } from "react-router-dom"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import FinancialEntryEdit from "./FinancialEntryEdit"

const ENTRY = {
  id: 7,
  entry_type: "a_receber",
  category: "aluguel",
  description: "Sublocação",
  amount: "800.00",
  due_date: "2026-10-30",
  status: "pendente",
  order: null,
  supplier: null,
  payments: [],
}

function renderAs(user) {
  localStorage.setItem("user", JSON.stringify(user))
  server.use(http.get(`${API}/financeiro/7/`, () => HttpResponse.json(ENTRY)))
  return renderWithProviders(
    <Routes>
      <Route path="/financeiro/:id" element={<FinancialEntryEdit />} />
    </Routes>,
    { route: "/financeiro/7" },
  )
}

describe("<FinancialEntryEdit>", () => {
  it("admin edita e tem as ações de marcar pago e cancelar", async () => {
    renderAs({ email: "a@a.com", business_id: 3, role: "admin" })

    expect(await screen.findByRole("heading", { name: "Editar Lançamento" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /marcar como pago/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /salvar alterações/i })).toBeInTheDocument()
  })

  it("contador abre só leitura: campos travados e nenhuma ação", async () => {
    renderAs({
      email: "c@a.com",
      business_id: 3,
      role: "contador",
      permissions: ["financial.view_financialentry"],
    })

    expect(await screen.findByRole("heading", { name: "Lançamento" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /marcar como pago/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /cancelar/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /salvar alterações/i })).not.toBeInTheDocument()
    expect(document.querySelector('input[name="due_date"]')).toBeDisabled()
  })
})
