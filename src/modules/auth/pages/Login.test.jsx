import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { renderWithProviders } from "@/test/render"
import Login from "./Login"

describe("<Login>", () => {
  it("renderiza o formulário sem estourar", () => {
    renderWithProviders(<Login />)
    expect(screen.getByRole("heading", { name: /entrar no sistema/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/digite seu email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/digite sua senha/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument()
  })
})
