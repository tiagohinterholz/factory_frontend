import { describe, it, expect, beforeEach } from "vitest"
import { screen, fireEvent } from "@testing-library/react"
import { renderWithProviders } from "@/test/render"
import Sidebar from "./Sidebar"

const noop = () => {}

function renderSidebar() {
  return renderWithProviders(
    <Sidebar collapsed={false} onToggleCollapse={noop} mobileOpen={false} onCloseMobile={noop} />,
  )
}

describe("<Sidebar>", () => {
  beforeEach(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }),
    )
  })

  it("o grupo Suprimentos abre em Fornecedores, Produtos e Serviços", () => {
    renderSidebar()

    expect(screen.queryByRole("link", { name: "Fornecedores" })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /suprimentos/i }))

    expect(screen.getByRole("link", { name: "Fornecedores" })).toHaveAttribute(
      "href",
      "/fornecedores",
    )
    expect(screen.getByRole("link", { name: "Produtos" })).toHaveAttribute("href", "/produtos")
    expect(screen.getByRole("link", { name: "Serviços" })).toHaveAttribute("href", "/servicos")
  })

  it("tem o item Notas Fiscais apontando para /notas-fiscais", () => {
    renderSidebar()
    expect(screen.getByRole("link", { name: /notas fiscais/i })).toHaveAttribute(
      "href",
      "/notas-fiscais",
    )
  })

  it("Configurações virou grupo com Gestão, Licenças e Usuários — sem label Empreendimentos", () => {
    renderSidebar()

    expect(screen.queryByRole("button", { name: /empreendimentos/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Gestão" })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /^configurações$/i }))

    // usuário comum (business_id no localStorage) tem "o meu negócio" —
    // /configuracoes/ sem ID nenhum
    expect(screen.getByRole("link", { name: "Gestão" })).toHaveAttribute("href", "/configuracoes")
    expect(screen.getByRole("link", { name: "Licenças" })).toHaveAttribute(
      "href",
      "/configuracoes/licenca",
    )
    expect(screen.getByRole("link", { name: "Usuários" })).toHaveAttribute("href", "/usuarios")
  })

  it("superusuário (sem business_id) não tem Gestão própria e usa /licencas em Licenças", () => {
    localStorage.setItem("user", JSON.stringify({ email: "root@a.com", role: "admin" }))
    renderSidebar()

    fireEvent.click(screen.getByRole("button", { name: /^configurações$/i }))

    expect(screen.queryByRole("link", { name: "Gestão" })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Licenças" })).toHaveAttribute("href", "/licencas")
  })

  it("atendente não gerencia usuários, mas edita o próprio (Usuário, singular)", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ user_id: 7, email: "colab@a.com", business_id: 3, role: "atendente" }),
    )
    renderSidebar()

    fireEvent.click(screen.getByRole("button", { name: /^configurações$/i }))

    expect(screen.queryByRole("link", { name: "Usuários" })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Licenças" })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Usuário" })).toHaveAttribute("href", "/usuarios/7")
  })

  it("não tem mais os cabeçalhos de seção antigos", () => {
    renderSidebar()
    expect(screen.queryByText("Principal")).not.toBeInTheDocument()
    expect(screen.queryByText("Serviços & Catálogos")).not.toBeInTheDocument()
  })
})
