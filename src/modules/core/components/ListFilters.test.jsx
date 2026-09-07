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

describe("<ListFilters>", () => {
  it("abre o painel no botão e aplica só ao clicar 'Filtrar'", () => {
    const onApply = vi.fn()
    render(<ListFilters fields={fields} value={EMPTY} onApply={onApply} />)

    fireEvent.click(screen.getByRole("button", { name: /filtros/i }))
    const status = screen.getByRole("option", { name: "Aprovado" }).closest("select")
    fireEvent.change(status, { target: { value: "aprovado" } })

    // ainda não aplicou
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

    fireEvent.click(screen.getByRole("button", { name: /filtros/i }))
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

  it("fecha ao clicar fora (via click, não mousedown — bug do select no Linux)", () => {
    render(<ListFilters fields={fields} value={EMPTY} onApply={vi.fn()} />)

    fireEvent.click(screen.getByRole("button", { name: /filtros/i }))
    expect(screen.getByRole("button", { name: "Filtrar" })).toBeInTheDocument()

    // mousedown fora NÃO fecha (senão derruba o popup nativo do select)
    fireEvent.mouseDown(document.body)
    expect(screen.getByRole("button", { name: "Filtrar" })).toBeInTheDocument()

    // click fora fecha
    fireEvent.click(document.body)
    expect(screen.queryByRole("button", { name: "Filtrar" })).not.toBeInTheDocument()
  })
})
