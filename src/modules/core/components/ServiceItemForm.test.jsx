import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/render"
import ServiceItemForm from "./ServiceItemForm"

const SERVICES = [
  { id: 1, name: "Alinhamento", unit_price: "120.00" },
  { id: 2, name: "Balanceamento", unit_price: "80.00" },
]

describe("<ServiceItemForm>", () => {
  it("'Serviço personalizado' é a primeira opção do select (OSFIN-P2-01)", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ServiceItemForm services={SERVICES} onAdd={vi.fn()} />)

    await user.click(screen.getByRole("combobox"))

    const options = await screen.findAllByRole("option")
    expect(options[0]).toHaveTextContent("Serviço personalizado")
    expect(options[1]).toHaveTextContent("Alinhamento (R$ 120,00)")
  })

  it("serviço do catálogo envia só o service_id", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn().mockResolvedValue(true)
    renderWithProviders(<ServiceItemForm services={SERVICES} onAdd={onAdd} />)

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: /balanceamento/i }))
    fireEvent.click(screen.getByRole("button", { name: "Adicionar serviço" }))

    await waitFor(() => expect(onAdd).toHaveBeenCalledWith({ service_id: "2" }))
  })

  it("personalizado abre nome e valor editáveis e envia os dois (OSFIN-P2-02)", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn().mockResolvedValue(true)
    renderWithProviders(<ServiceItemForm services={SERVICES} onAdd={onAdd} />)

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "Serviço personalizado" }))
    await user.type(screen.getByLabelText(/nome do serviço/i), "Funilaria na porta")
    await user.type(screen.getByLabelText(/valor/i), "350.5")
    fireEvent.click(screen.getByRole("button", { name: "Adicionar serviço" }))

    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith({
        custom_name: "Funilaria na porta",
        unit_price: "350.50",
      }),
    )
    await waitFor(() => expect(screen.queryByLabelText(/nome do serviço/i)).not.toBeInTheDocument())
  })

  it("personalizado sem nome ou valor não envia", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    renderWithProviders(<ServiceItemForm services={SERVICES} onAdd={onAdd} />)

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "Serviço personalizado" }))
    await user.type(screen.getByLabelText(/nome do serviço/i), "Lavagem")
    fireEvent.click(screen.getByRole("button", { name: "Adicionar serviço" }))

    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.getByText(/valor maior que zero/i)).toBeInTheDocument()
  })

  it("falha ao adicionar mantém o que foi digitado", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn().mockResolvedValue(false)
    renderWithProviders(<ServiceItemForm services={SERVICES} onAdd={onAdd} />)

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "Serviço personalizado" }))
    await user.type(screen.getByLabelText(/nome do serviço/i), "Pintura")
    await user.type(screen.getByLabelText(/valor/i), "100")
    fireEvent.click(screen.getByRole("button", { name: "Adicionar serviço" }))

    await waitFor(() => expect(onAdd).toHaveBeenCalled())
    expect(screen.getByLabelText(/nome do serviço/i)).toHaveValue("Pintura")
  })
})
