import { describe, it, expect, vi, afterEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { renderWithProviders } from "@/test/render"
import InvoiceOrderDialog from "./InvoiceOrderDialog"
import { OrderService } from "../services/order"

afterEach(() => vi.restoreAllMocks())

function choose(value) {
  fireEvent.change(screen.getByLabelText(/forma de pagamento/i), { target: { value } })
}

describe("<InvoiceOrderDialog>", () => {
  it("não fatura sem escolher a forma de pagamento (OSFIN-P2-03)", () => {
    renderWithProviders(<InvoiceOrderDialog order={{ id: 7, total: "100.00" }} onClose={vi.fn()} />)

    expect(screen.getByRole("button", { name: "Faturar" })).toBeDisabled()
    expect(screen.getByRole("option", { name: "Pix" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Cartão" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Cheque" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Depósito" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Dinheiro" })).toBeInTheDocument()
  })

  it("parcelas só aparecem no cartão e vão no payload (OSFIN-P2-04)", async () => {
    const invoice = vi
      .spyOn(OrderService, "invoiceOrder")
      .mockResolvedValue({ has_external_service_suppliers: false })
    const onClose = vi.fn()
    renderWithProviders(<InvoiceOrderDialog order={{ id: 7 }} onClose={onClose} />)

    choose("pix")
    expect(screen.queryByLabelText(/parcelas/i)).not.toBeInTheDocument()

    choose("cartao")
    fireEvent.change(screen.getByLabelText(/parcelas/i), { target: { value: "3" } })
    fireEvent.click(screen.getByRole("button", { name: "Faturar" }))

    await waitFor(() =>
      expect(invoice).toHaveBeenCalledWith(7, { payment_method: "cartao", installments: 3 }),
    )
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it("bloqueia parcelas fora de 1 a 24", () => {
    renderWithProviders(<InvoiceOrderDialog order={{ id: 7 }} onClose={vi.fn()} />)

    choose("cartao")
    fireEvent.change(screen.getByLabelText(/parcelas/i), { target: { value: "25" } })

    expect(screen.getByRole("button", { name: "Faturar" })).toBeDisabled()
    expect(screen.getByText(/de 1 a 24 parcelas/i)).toBeInTheDocument()
  })

  it("com serviço de terceiro pergunta e registra a saída (OSFIN-P3-01)", async () => {
    vi.spyOn(OrderService, "invoiceOrder").mockResolvedValue({
      has_external_service_suppliers: true,
      external_services: [
        {
          supplier_id: 4,
          supplier_name: "Retífica do Zé",
          amount: "600.00",
          services: ["Retífica de cabeçote"],
        },
      ],
    })
    const register = vi
      .spyOn(OrderService, "registerExternalServicePayable")
      .mockResolvedValue({ entries: [] })
    const onClose = vi.fn()
    renderWithProviders(<InvoiceOrderDialog order={{ id: 7 }} onClose={onClose} />)

    choose("dinheiro")
    fireEvent.click(screen.getByRole("button", { name: "Faturar" }))

    expect(await screen.findByText("Retífica do Zé")).toBeInTheDocument()
    expect(screen.getByText("Retífica de cabeçote")).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole("button", { name: "Registrar saída" }))

    await waitFor(() => expect(register).toHaveBeenCalledWith(7))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it("'Agora não' fecha sem registrar a saída", async () => {
    vi.spyOn(OrderService, "invoiceOrder").mockResolvedValue({
      has_external_service_suppliers: true,
      external_services: [
        { supplier_id: 4, supplier_name: "Retífica do Zé", amount: "600.00", services: ["X"] },
      ],
    })
    const register = vi.spyOn(OrderService, "registerExternalServicePayable")
    const onClose = vi.fn()
    renderWithProviders(<InvoiceOrderDialog order={{ id: 7 }} onClose={onClose} />)

    choose("pix")
    fireEvent.click(screen.getByRole("button", { name: "Faturar" }))
    fireEvent.click(await screen.findByRole("button", { name: "Agora não" }))

    expect(onClose).toHaveBeenCalled()
    expect(register).not.toHaveBeenCalled()
  })

  it("sem serviço de terceiro fecha direto após faturar", async () => {
    vi.spyOn(OrderService, "invoiceOrder").mockResolvedValue({
      has_external_service_suppliers: false,
      external_services: [],
    })
    const onClose = vi.fn()
    renderWithProviders(<InvoiceOrderDialog order={{ id: 7 }} onClose={onClose} />)

    choose("pix")
    fireEvent.click(screen.getByRole("button", { name: "Faturar" }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(screen.queryByText(/serviço de terceiro/i)).not.toBeInTheDocument()
  })

  it("forma sem cartão não manda parcelas no payload", async () => {
    const invoice = vi
      .spyOn(OrderService, "invoiceOrder")
      .mockResolvedValue({ has_external_service_suppliers: false })
    renderWithProviders(<InvoiceOrderDialog order={{ id: 7 }} onClose={vi.fn()} />)

    choose("cartao")
    fireEvent.change(screen.getByLabelText(/parcelas/i), { target: { value: "3" } })
    choose("pix")
    fireEvent.click(screen.getByRole("button", { name: "Faturar" }))

    await waitFor(() => expect(invoice).toHaveBeenCalledWith(7, { payment_method: "pix" }))
  })
})
