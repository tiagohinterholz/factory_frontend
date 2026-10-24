import { describe, it, expect, vi } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ProductFinancialEntryModal from "./ProductFinancialEntryModal"

function getDialog() {
  return screen.getByRole("dialog")
}

describe("<ProductFinancialEntryModal>", () => {
  it("sugere custo × quantidade quando os dois estão informados (AC CVSP-P3-05)", () => {
    renderWithProviders(
      <ProductFinancialEntryModal
        open
        product={{ name: "Óleo 5W30", cost_price: 20, stock_quantity: 10 }}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    expect(within(getDialog()).getByText("R$ 200,00")).toBeInTheDocument()
  })

  it("sem quantidade (zero), sugere só o custo", () => {
    renderWithProviders(
      <ProductFinancialEntryModal
        open
        product={{ name: "Óleo 5W30", cost_price: 20, stock_quantity: 0 }}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    expect(within(getDialog()).getByText("R$ 20,00")).toBeInTheDocument()
  })

  it("confirmar cria a FinancialEntry via API já existente com o valor sugerido, chama onConfirm e onClose", async () => {
    const user = userEvent.setup()
    let receivedBody
    server.use(
      http.post(`${API}/financeiro/`, async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json({ id: 99, ...receivedBody }, { status: 201 })
      }),
    )
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    renderWithProviders(
      <ProductFinancialEntryModal
        open
        product={{ name: "Óleo 5W30", cost_price: 20, stock_quantity: 10 }}
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    )

    await user.click(within(getDialog()).getByRole("button", { name: "Sim, registrar" }))

    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ id: 99 })))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(receivedBody).toMatchObject({
      entry_type: "a_pagar",
      category: "outro",
      amount: 200,
    })
    expect(receivedBody.due_date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it("recusar (Não) só fecha, sem criar FinancialEntry nem chamar onConfirm", async () => {
    const user = userEvent.setup()
    const postSpy = vi.fn()
    server.use(
      http.post(`${API}/financeiro/`, async () => {
        postSpy()
        return HttpResponse.json({}, { status: 201 })
      }),
    )
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    renderWithProviders(
      <ProductFinancialEntryModal
        open
        product={{ name: "Óleo 5W30", cost_price: 20, stock_quantity: 10 }}
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    )

    await user.click(within(getDialog()).getByRole("button", { name: "Não" }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(postSpy).not.toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("fechar sem escolher (X) é tratado como 'não' — sem efeito colateral (edge case do spec)", async () => {
    const user = userEvent.setup()
    const postSpy = vi.fn()
    server.use(
      http.post(`${API}/financeiro/`, async () => {
        postSpy()
        return HttpResponse.json({}, { status: 201 })
      }),
    )
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    renderWithProviders(
      <ProductFinancialEntryModal
        open
        product={{ name: "Óleo 5W30", cost_price: 20, stock_quantity: 10 }}
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    )

    await user.click(within(getDialog()).getByRole("button", { name: "Fechar" }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(postSpy).not.toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("erro da API aparece inline, modal continua aberto, onConfirm não é chamado", async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API}/financeiro/`, () =>
        HttpResponse.json({ detail: "Erro ao registrar a saída financeira." }, { status: 400 }),
      ),
    )
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    renderWithProviders(
      <ProductFinancialEntryModal
        open
        product={{ name: "Óleo 5W30", cost_price: 20, stock_quantity: 10 }}
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    )

    await user.click(within(getDialog()).getByRole("button", { name: "Sim, registrar" }))

    expect(
      await within(getDialog()).findByText("Erro ao registrar a saída financeira."),
    ).toBeInTheDocument()
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})
