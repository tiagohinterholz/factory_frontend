import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/render"
import ProductItemForm from "./ProductItemForm"

const PRODUCTS = [
  { id: 1, name: "Óleo 5W30", reference: "OL-530", unit_price: "45.00", stock_quantity: 12 },
  { id: 2, name: "Filtro de ar", reference: "FLT-889", unit_price: "60.00", stock_quantity: 0 },
]

describe("<ProductItemForm>", () => {
  it("busca o produto digitando nome ou referência e mostra preço e estoque", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductItemForm products={PRODUCTS} onAdd={vi.fn()} />)

    await user.type(screen.getByRole("combobox"), "flt")

    const options = await screen.findAllByRole("option")
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent("Filtro de ar (R$ 60,00) · estoque 0")
  })

  it("adiciona com a quantidade escolhida e limpa o formulário", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn().mockResolvedValue(true)
    renderWithProviders(<ProductItemForm products={PRODUCTS} onAdd={onAdd} />)

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: /óleo 5w30/i }))
    fireEvent.change(screen.getByLabelText("Qtd"), { target: { value: "4" } })
    fireEvent.click(screen.getByRole("button", { name: "Adicionar produto" }))

    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith({ product_id: "1", quantity: 4, unit_price: "45.00" }),
    )
    await waitFor(() => expect(screen.getByLabelText("Qtd")).toHaveValue(1))
  })

  it("recusa quantidade inválida", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    renderWithProviders(<ProductItemForm products={PRODUCTS} onAdd={onAdd} />)

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: /óleo 5w30/i }))
    fireEvent.change(screen.getByLabelText("Qtd"), { target: { value: "0" } })
    fireEvent.submit(screen.getByRole("button", { name: "Adicionar produto" }).closest("form"))

    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.getByText(/quantidade inteira/i)).toBeInTheDocument()
  })
})
