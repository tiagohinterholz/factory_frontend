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

  it("Configurações virou link para /configuracoes", () => {
    renderSidebar()
    expect(screen.getByRole("link", { name: /configurações/i })).toHaveAttribute(
      "href",
      "/configuracoes",
    )
  })

  it("não tem mais os cabeçalhos de seção antigos", () => {
    renderSidebar()
    expect(screen.queryByText("Principal")).not.toBeInTheDocument()
    expect(screen.queryByText("Serviços & Catálogos")).not.toBeInTheDocument()
  })
})
