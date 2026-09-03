import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import SelectField from "./SelectField"

const options = [
  { id: 1, name: "Um" },
  { id: 2, name: "Dois" },
]

describe("<SelectField>", () => {
  it("habilitado por padrão, com placeholder do label", () => {
    render(<SelectField label="Cidade" options={options} value="" onChange={() => {}} />)
    const select = screen.getByRole("combobox")
    expect(select).toBeEnabled()
    expect(screen.getByRole("option", { name: /selecione o\(a\) cidade/i })).toBeInTheDocument()
  })

  it("disabled trava o select e mostra o disabledHint", () => {
    render(
      <SelectField
        label="Cidade"
        options={options}
        disabled
        disabledHint="Selecione o estado primeiro"
        value=""
        onChange={() => {}}
      />,
    )
    expect(screen.getByRole("combobox")).toBeDisabled()
    expect(screen.getByRole("option", { name: "Selecione o estado primeiro" })).toBeInTheDocument()
  })
})
