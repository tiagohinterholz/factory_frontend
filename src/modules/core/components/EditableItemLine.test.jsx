import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { renderWithProviders } from "@/test/render"
import EditableItemLine from "./EditableItemLine"

function renderProduct(props = {}) {
  const onSave = props.onSave ?? vi.fn().mockResolvedValue(true)
  const onDelete = vi.fn()
  renderWithProviders(
    <EditableItemLine
      itemName="Sensor de oxigênio"
      quantity={2}
      unitPrice="120.00"
      total="240.00"
      editable
      onSave={onSave}
      onDelete={onDelete}
      {...props}
    />,
  )
  return { onSave, onDelete }
}

const quantityInput = () => screen.getByLabelText("Qtd")
const priceInput = () => screen.getByLabelText(/preço unitário|valor/i)
const openEditor = () =>
  fireEvent.click(screen.getByRole("button", { name: "Editar Sensor de oxigênio" }))

describe("<EditableItemLine>", () => {
  it("mostra nome, quantidade, unitário e total da linha", () => {
    renderProduct()

    expect(screen.getByText("Sensor de oxigênio (x2)")).toBeInTheDocument()
    expect(screen.getByText(/120,00 \/ un/)).toBeInTheDocument()
    expect(screen.getByText(/240,00/)).toBeInTheDocument()
  })

  it("sem permissão de edição não mostra editar nem remover", () => {
    renderProduct({ editable: false })

    expect(screen.queryByRole("button", { name: /editar/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /remover/i })).not.toBeInTheDocument()
  })

  it("altera quantidade e preço na própria linha e manda só o que mudou", async () => {
    const { onSave } = renderProduct()

    openEditor()
    fireEvent.change(quantityInput(), { target: { value: "3" } })
    fireEvent.change(priceInput(), { target: { value: "100" } })
    expect(screen.getByText(/300,00/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Salvar item" }))

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ quantity: 3, unit_price: "100.00" }))
    await waitFor(() => expect(screen.queryByLabelText("Qtd")).not.toBeInTheDocument())
  })

  it("mudar só o preço (desconto) manda só o preço, aceitando vírgula", async () => {
    const { onSave } = renderProduct()

    openEditor()
    fireEvent.change(priceInput(), { target: { value: "99,90" } })
    fireEvent.click(screen.getByRole("button", { name: "Salvar item" }))

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ unit_price: "99.90" }))
  })

  it("o preço abre no formato brasileiro", () => {
    renderProduct()

    openEditor()

    expect(priceInput()).toHaveValue("120,00")
  })

  it.each([
    ["1.000", "1000.00"],
    ["1.234,56", "1234.56"],
    ["R$ 89,90", "89.90"],
    ["150.5", "150.50"],
  ])("entende o preço digitado %s como %s", async (typed, sent) => {
    const { onSave } = renderProduct()

    openEditor()
    fireEvent.change(priceInput(), { target: { value: typed } })
    fireEvent.click(screen.getByRole("button", { name: "Salvar item" }))

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ unit_price: sent }))
  })

  it("aceita preço zero", async () => {
    const { onSave } = renderProduct()

    openEditor()
    fireEvent.change(priceInput(), { target: { value: "0" } })
    fireEvent.click(screen.getByRole("button", { name: "Salvar item" }))

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ unit_price: "0.00" }))
  })

  it("sem alteração fecha o editor sem chamar a API", async () => {
    const { onSave } = renderProduct()

    openEditor()
    fireEvent.click(screen.getByRole("button", { name: "Salvar item" }))

    await waitFor(() => expect(screen.queryByLabelText("Qtd")).not.toBeInTheDocument())
    expect(onSave).not.toHaveBeenCalled()
  })

  it.each([
    ["0", "120.00", "Informe uma quantidade inteira maior que zero."],
    ["1.5", "120.00", "Informe uma quantidade inteira maior que zero."],
    ["2", "-1", "Informe um preço válido (zero ou mais)."],
    ["2", "", "Informe um preço válido (zero ou mais)."],
  ])("recusa quantidade %s / preço %s", async (quantity, price, message) => {
    const { onSave } = renderProduct()

    openEditor()
    fireEvent.change(quantityInput(), { target: { value: quantity } })
    fireEvent.change(priceInput(), { target: { value: price } })
    fireEvent.submit(screen.getByRole("form", { name: "Editar Sensor de oxigênio" }))

    expect(await screen.findByText(message)).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it("avisa quanto vai faltar quando a quantidade passa do estoque, sem bloquear", async () => {
    const { onSave } = renderProduct({ availableStock: 11 })

    openEditor()
    fireEvent.change(quantityInput(), { target: { value: "13" } })

    expect(screen.getByRole("status")).toHaveTextContent(
      "Estoque disponível para esta linha: 11 — vão faltar 2 un.",
    )
    fireEvent.click(screen.getByRole("button", { name: "Salvar item" }))
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ quantity: 13 }))
  })

  it("o aviso de falta usa o texto do contexto (orçamento)", () => {
    renderProduct({ availableStock: 1, shortageNote: "A falta é anotada na OS." })

    openEditor()
    fireEvent.change(quantityInput(), { target: { value: "3" } })

    expect(screen.getByRole("status")).toHaveTextContent(
      "vão faltar 2 un. A falta é anotada na OS.",
    )
  })

  it("dentro do estoque não mostra aviso", () => {
    renderProduct({ availableStock: 11 })

    openEditor()
    fireEvent.change(quantityInput(), { target: { value: "11" } })

    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("se salvar falhar, continua editando com os valores digitados", async () => {
    renderProduct({ onSave: vi.fn().mockResolvedValue(false) })

    openEditor()
    fireEvent.change(quantityInput(), { target: { value: "4" } })
    fireEvent.click(screen.getByRole("button", { name: "Salvar item" }))

    await waitFor(() => expect(quantityInput()).toHaveValue(4))
  })

  it("cancelar volta pra linha sem salvar", () => {
    const { onSave } = renderProduct()

    openEditor()
    fireEvent.change(quantityInput(), { target: { value: "9" } })
    fireEvent.click(screen.getByRole("button", { name: "Cancelar edição" }))

    expect(screen.getByText("Sensor de oxigênio (x2)")).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it("remover chama onDelete", () => {
    const { onDelete } = renderProduct()

    fireEvent.click(screen.getByRole("button", { name: "Remover Sensor de oxigênio" }))

    expect(onDelete).toHaveBeenCalled()
  })

  it("linha de serviço edita só o valor", async () => {
    const onSave = vi.fn().mockResolvedValue(true)
    renderWithProviders(
      <EditableItemLine itemName="Alinhamento" unitPrice="150.00" editable onSave={onSave} />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Editar Alinhamento" }))
    expect(screen.queryByLabelText("Qtd")).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText("Valor (R$)"), { target: { value: "120" } })
    fireEvent.click(screen.getByRole("button", { name: "Salvar item" }))

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ unit_price: "120.00" }))
  })
})
