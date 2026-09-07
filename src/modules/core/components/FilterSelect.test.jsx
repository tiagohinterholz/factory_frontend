import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import FilterSelect from "./FilterSelect"

const options = [
  { id: "1", name: "Fornecedor A" },
  { id: "2", name: "Fornecedor B" },
]

describe("<FilterSelect>", () => {
  it("mostra o placeholder e abre a lista de opções ao clicar", async () => {
    render(<FilterSelect label="Fornecedor" options={options} value="" onChange={vi.fn()} />)

    const button = screen.getByRole("button", { name: /selecione o\(a\) fornecedor/i })
    fireEvent.click(button)

    expect(await screen.findByRole("option", { name: "Fornecedor A" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Fornecedor B" })).toBeInTheDocument()
  })

  it("selecionar uma opção chama onChange com o id", async () => {
    const onChange = vi.fn()
    render(<FilterSelect label="Fornecedor" options={options} value="" onChange={onChange} />)

    fireEvent.click(screen.getByRole("button", { name: /selecione o\(a\) fornecedor/i }))
    fireEvent.click(await screen.findByRole("option", { name: "Fornecedor B" }))

    expect(onChange).toHaveBeenCalledWith("2")
  })

  it("com value definido, o botão mostra o nome da opção", () => {
    render(<FilterSelect label="Fornecedor" options={options} value="1" onChange={vi.fn()} />)
    expect(screen.getByRole("button", { name: "Fornecedor A" })).toBeInTheDocument()
  })
})
