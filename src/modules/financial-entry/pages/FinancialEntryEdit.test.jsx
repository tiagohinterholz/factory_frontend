import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { Routes, Route } from "react-router-dom"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import FinancialEntryEdit from "./FinancialEntryEdit"
import { FinancialEntryService } from "../services/financial-entry"

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
}

function renderAs(user, entry = ENTRY) {
  localStorage.setItem("user", JSON.stringify(user))
  server.use(http.get(`${API}/financeiro/7/`, () => HttpResponse.json(entry)))
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

  it("quem só pode cancelar vê Cancelar mas não Marcar como pago", async () => {
    renderAs({
      email: "f@a.com",
      business_id: 3,
      role: "financeiro",
      permissions: ["financial.view_financialentry", "financial.can_cancel_financial_entry"],
    })

    expect(await screen.findByRole("button", { name: /cancelar/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /marcar como pago/i })).not.toBeInTheDocument()
  })

  it("marcar como pago abre o diálogo pedindo forma de pagamento", async () => {
    renderAs({ email: "a@a.com", business_id: 3, role: "admin" })

    fireEvent.click(await screen.findByRole("button", { name: /marcar como pago/i }))

    expect(
      await screen.findByRole("heading", { name: "Marcar lançamento #7 como pago" }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/forma de pagamento/i)).toBeInTheDocument()
  })

  it("confirma o pagamento em pix sem pedir parcelas", async () => {
    const markPaid = vi
      .spyOn(FinancialEntryService, "markFinancialEntryPaid")
      .mockResolvedValue({ ...ENTRY, status: "pago" })
    renderAs({ email: "a@a.com", business_id: 3, role: "admin" })

    fireEvent.click(await screen.findByRole("button", { name: /marcar como pago/i }))
    fireEvent.change(await screen.findByLabelText(/forma de pagamento/i), {
      target: { value: "pix" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Confirmar pagamento" }))

    await waitFor(() => expect(markPaid).toHaveBeenCalledWith("7", { paymentMethod: "pix" }))
    markPaid.mockRestore()
  })

  it("cartão exige parcelas antes de liberar a confirmação", async () => {
    renderAs({ email: "a@a.com", business_id: 3, role: "admin" })

    fireEvent.click(await screen.findByRole("button", { name: /marcar como pago/i }))
    fireEvent.change(await screen.findByLabelText(/forma de pagamento/i), {
      target: { value: "cartao" },
    })

    expect(screen.getByLabelText(/parcelas/i)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/parcelas/i), { target: { value: "0" } })
    expect(screen.getByRole("button", { name: "Confirmar pagamento" })).toBeDisabled()
  })

  it("mostra a forma de pagamento e as parcelas do lançamento já pago", async () => {
    renderAs(
      { email: "a@a.com", business_id: 3, role: "admin" },
      {
        ...ENTRY,
        status: "pago",
        payment_date: "2026-10-30",
        payment_method: "cartao",
        installments: 3,
      },
    )

    expect(await screen.findByText(/pago em 30\/10\/2026/i)).toBeInTheDocument()
    expect(screen.getByText("Forma de pagamento")).toBeInTheDocument()
    expect(screen.getByText("Cartão")).toBeInTheDocument()
    expect(screen.getByText("Parcelas")).toBeInTheDocument()
    expect(screen.getByText("3x")).toBeInTheDocument()
  })

  it("não mostra o campo de parcelas quando a forma de pagamento não é cartão", async () => {
    renderAs(
      { email: "a@a.com", business_id: 3, role: "admin" },
      {
        ...ENTRY,
        status: "pago",
        payment_date: "2026-10-30",
        payment_method: "pix",
        installments: null,
      },
    )

    expect(await screen.findByText("Forma de pagamento")).toBeInTheDocument()
    expect(screen.getByText("Pix")).toBeInTheDocument()
    expect(screen.queryByText("Parcelas")).not.toBeInTheDocument()
  })

  it("não mostra o campo de tags num lançamento travado e sem nenhuma", async () => {
    renderAs(
      {
        email: "c@a.com",
        business_id: 3,
        role: "contador",
        permissions: ["financial.view_financialentry"],
      },
      { ...ENTRY, status: "pago", payment_date: "2026-10-30" },
    )

    await screen.findByRole("heading", { name: "Lançamento" })
    expect(screen.queryByLabelText("Tags")).not.toBeInTheDocument()
  })

  it("mostra o campo de tags num lançamento travado que já tem alguma", async () => {
    renderAs(
      {
        email: "c@a.com",
        business_id: 3,
        role: "contador",
        permissions: ["financial.view_financialentry"],
      },
      { ...ENTRY, status: "pago", payment_date: "2026-10-30", tags: ["Fixo"] },
    )

    expect(await screen.findByText("Fixo")).toBeInTheDocument()
  })

  it("edita as tags do lançamento e manda no payload", async () => {
    server.use(
      http.get(`${API}/categorias-financeiro/`, () => HttpResponse.json({ results: [], count: 0 })),
      http.get(`${API}/financeiro/tags/`, () => HttpResponse.json({ results: [], count: 0 })),
    )
    const update = vi.spyOn(FinancialEntryService, "updateFinancialEntry").mockResolvedValue({})
    renderAs(
      { email: "a@a.com", business_id: 3, role: "admin" },
      { ...ENTRY, tags: ["Fixo"], financial_category: { id: 4, name: "Aluguel" } },
    )

    expect(await screen.findByText("Fixo")).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText("Tags"), { target: { value: "Prioridade" } })
    fireEvent.keyDown(screen.getByLabelText("Tags"), { key: "Enter" })
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }))

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        "7",
        expect.objectContaining({ tags: ["Fixo", "Prioridade"], financial_category_id: "4" }),
      ),
    )
    update.mockRestore()
  })
})
