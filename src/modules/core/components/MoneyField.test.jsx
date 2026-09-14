import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import MoneyField from "./MoneyField"

// Componente de teste — MoneyField é Controller-based, precisa de um form
// de verdade em volta (mesmo padrão dos testes de MaskedField no app real).
// `onReady` expõe `getValues` fora do render (watch() em JSX esbarra no lint
// de memoização do react-compiler pra hooks do RHF).
function Harness({ defaultValue = "", onReady }) {
  const { control, getValues } = useForm({ defaultValues: { price: defaultValue } })

  useEffect(() => {
    onReady?.(getValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <MoneyField control={control} name="price" label="Preço" />
}

describe("<MoneyField>", () => {
  it("começa vazio quando o valor é vazio, mostrando o placeholder", () => {
    render(<Harness />)
    expect(screen.getByPlaceholderText("R$ 0,00")).toHaveValue("")
  })

  it("digitar da direita pra esquerda monta o valor em reais formatado", () => {
    let getValues
    render(<Harness onReady={(fn) => (getValues = fn)} />)
    const input = screen.getByRole("textbox")

    fireEvent.change(input, { target: { value: "15000" } })

    expect(input).toHaveValue("R$ 150,00")
    expect(getValues("price")).toBe(150)
  })

  it("ignora caracteres não numéricos digitados", () => {
    render(<Harness />)
    const input = screen.getByRole("textbox")

    fireEvent.change(input, { target: { value: "R$ 12,,ab3" } })

    // só os dígitos "123" sobrevivem -> 1,23
    expect(input).toHaveValue("R$ 1,23")
  })

  it("carrega um valor existente (edição) já formatado", () => {
    render(<Harness defaultValue={150.5} />)
    expect(screen.getByRole("textbox")).toHaveValue("R$ 150,50")
  })
})
