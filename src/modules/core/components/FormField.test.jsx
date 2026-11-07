import { describe, it, expect, vi } from "vitest"
import { render } from "@testing-library/react"
import FormField from "./FormField"

describe("<FormField> datalist", () => {
  it("datalist de string: valor da opção é o próprio texto", () => {
    render(<FormField label="Cor" value="" onChange={vi.fn()} datalist={["Branco", "Preto"]} />)

    const option = document.querySelector("datalist option")
    expect(option).toHaveAttribute("value", "Branco")
  })

  it("datalist de {id,name} (ex.: Unidade de Medida): valor da opção é o CÓDIGO (id), rótulo exibido é o nome amigável — não confunde os dois", () => {
    render(
      <FormField
        label="Unidade de Medida"
        value=""
        onChange={vi.fn()}
        datalist={[
          { id: "UN", name: "Unidade" },
          { id: "KG", name: "Quilograma" },
        ]}
      />,
    )

    const options = document.querySelectorAll("datalist option")
    expect(options).toHaveLength(2)
    expect(options[0]).toHaveAttribute("value", "UN")
    expect(options[0]).toHaveTextContent("Unidade")
    expect(options[1]).toHaveAttribute("value", "KG")
    expect(options[1]).toHaveTextContent("Quilograma")
  })
})
