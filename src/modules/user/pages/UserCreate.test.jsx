import { describe, it, expect, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { renderWithProviders } from "@/test/render"
import UserCreate from "./UserCreate"

describe("<UserCreate>", () => {
  beforeEach(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({ email: "admin@a.com", business_id: 3, role: "admin" }),
    )
  })

  it("superusuário não vê o formulário — não gerencia usuários por aqui", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "super@a.com" }))
    renderWithProviders(<UserCreate />)

    expect(
      await screen.findByText(/superusuário não cadastra usuários por aqui/i),
    ).toBeInTheDocument()
    expect(screen.queryByPlaceholderText("Ex: João da Silva")).not.toBeInTheDocument()
  })

  it("botão de gerar senha preenche os dois campos com uma senha forte igual", async () => {
    renderWithProviders(<UserCreate />)

    fireEvent.click(
      await screen.findByRole("button", { name: /gerar senha forte automaticamente/i }),
    )

    await waitFor(() => {
      const password = screen.getByPlaceholderText("Mínimo 8 caracteres")
      const confirm = screen.getByPlaceholderText("Repita a senha")
      expect(password.value).not.toBe("")
      expect(password.value).toBe(confirm.value)
    })
    expect(screen.getByText(/muito forte/i)).toBeInTheDocument()
  })

  // Regressão: o navegador estava autopreenchendo e-mail/senha do próprio
  // admin logado nesse formulário — o form de criar usuário tem exatamente a
  // cara de um form de login (email + senha) pro autofill do Chrome, então
  // sem esses atributos ele "ajuda" preenchendo a credencial salva do site.
  it("campos de e-mail e senha não convidam o autofill do navegador a preencher a credencial salva", async () => {
    renderWithProviders(<UserCreate />)

    const email = await screen.findByPlaceholderText("joao@empresa.com")
    expect(email).toHaveAttribute("autocomplete", "off")
    expect(screen.getByPlaceholderText("Mínimo 8 caracteres")).toHaveAttribute(
      "autocomplete",
      "new-password",
    )
    expect(screen.getByPlaceholderText("Repita a senha")).toHaveAttribute(
      "autocomplete",
      "new-password",
    )
  })
})
