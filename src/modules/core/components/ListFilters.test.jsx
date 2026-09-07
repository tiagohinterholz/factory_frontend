import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import ListFilters from "./ListFilters"

const fields = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { id: "pendente", name: "Pendente" },
      { id: "aprovado", name: "Aprovado" },
    ],
  },
  { name: "date_from", label: "De", type: "date" },
]

const EMPTY = { status: "", date_from: "" }

const openPanel = () => fireEvent.click(screen.getByRole("button", { name: /filtros/i }))

async function pickStatus(name) {
  fireEvent.click(await screen.findByRole("button", { name: /selecione o\(a\) status/i }))
  fireEvent.click(await screen.findByRole("option", { name }))
}

describe("<ListFilters>", () => {
  it("abre o painel e aplica só ao clicar 'Filtrar'", async () => {
    const onApply = vi.fn()
    render(<ListFilters fields={fields} value={EMPTY} onApply={onApply} />)

    openPanel()
    await pickStatus("Aprovado")
    expect(onApply).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole("button", { name: "Filtrar" }))
    expect(onApply).toHaveBeenCalledWith({ status: "aprovado", date_from: "" })
  })

  it("'Limpar' aplica o conjunto vazio", () => {
    const onApply = vi.fn()
    render(
      <ListFilters
        fields={fields}
        value={{ status: "pendente", date_from: "" }}
        onApply={onApply}
      />,
    )

    openPanel()
    fireEvent.click(screen.getByRole("button", { name: "Limpar" }))
    expect(onApply).toHaveBeenCalledWith({ status: "", date_from: "" })
  })

  it("mostra a contagem de filtros ativos", () => {
    render(
      <ListFilters
        fields={fields}
        value={{ status: "pendente", date_from: "2026-09-01" }}
        onApply={vi.fn()}
      />,
    )
    expect(screen.getByRole("button", { name: /filtros/i })).toHaveTextContent("2")
  })

  it("NÃO fecha o painel ao clicar fora", () => {
    render(<ListFilters fields={fields} value={EMPTY} onApply={vi.fn()} />)

    openPanel()
    fireEvent.mouseDown(document.body)
    fireEvent.click(document.body)

    expect(screen.getByRole("button", { name: "Filtrar" })).toBeInTheDocument()
  })

  it("fecha pelo X e pelo Esc", () => {
    render(<ListFilters fields={fields} value={EMPTY} onApply={vi.fn()} />)

    openPanel()
    fireEvent.click(screen.getByRole("button", { name: /fechar filtros/i }))
    expect(screen.queryByRole("button", { name: "Filtrar" })).not.toBeInTheDocument()

    openPanel()
    fireEvent.keyDown(document, { key: "Escape" })
    expect(screen.queryByRole("button", { name: "Filtrar" })).not.toBeInTheDocument()
  })
})
