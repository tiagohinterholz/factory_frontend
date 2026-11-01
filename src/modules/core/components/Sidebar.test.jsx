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

  it("o grupo Veículos abre em Marca, Modelo e Veículo, nessa ordem (CVSP-P1-09)", () => {
    renderSidebar()

    fireEvent.click(screen.getByRole("button", { name: /^veículos$/i }))

    expect(screen.getByRole("link", { name: "Marcas" })).toHaveAttribute("href", "/marcas")
    expect(screen.getByRole("link", { name: "Modelos" })).toHaveAttribute("href", "/modelos")
    expect(screen.getByRole("link", { name: "Veículos" })).toHaveAttribute("href", "/veiculos")

    const linkNames = screen.getAllByRole("link").map((link) => link.textContent)
    const marcaIndex = linkNames.indexOf("Marcas")
    const modeloIndex = linkNames.indexOf("Modelos")
    const veiculoIndex = linkNames.indexOf("Veículos")
    expect(marcaIndex).toBeLessThan(modeloIndex)
    expect(modeloIndex).toBeLessThan(veiculoIndex)
  })

  it("o grupo Notas Fiscais abre em NF-e e NFS-e, cada um na própria rota", () => {
    renderSidebar()

    expect(screen.queryByRole("link", { name: "NF-e" })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /^notas fiscais$/i }))

    expect(screen.getByRole("link", { name: "NF-e" })).toHaveAttribute("href", "/notas-fiscais/nfe")
    expect(screen.getByRole("link", { name: "NFS-e" })).toHaveAttribute(
      "href",
      "/notas-fiscais/nfse",
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

  it("contador vê só Notas Fiscais e Financeiro no menu (RAD-P3-01)", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: "cont@a.com",
        business_id: 3,
        role: "contador",
        user_id: 9,
        permissions: [
          "orders.view_fiscalnote",
          "orders.view_servicefiscalnote",
          "financial.view_financialentry",
          "core.can_export_reports",
        ],
      }),
    )
    renderSidebar()

    const nav = screen.getByRole("navigation")
    const linkHrefs = () =>
      Array.from(nav.querySelectorAll("a")).map((link) => link.getAttribute("href"))
    expect(linkHrefs()).toEqual([])

    fireEvent.click(screen.getByRole("button", { name: /^notas fiscais$/i }))
    expect(linkHrefs()).toEqual(["/notas-fiscais/nfe", "/notas-fiscais/nfse"])

    fireEvent.click(screen.getByRole("button", { name: /^financeiro$/i }))
    expect(linkHrefs()).toEqual([
      "/notas-fiscais/nfe",
      "/notas-fiscais/nfse",
      "/financeiro",
      "/financeiro/categorias",
      "/financeiro/tags",
      "/financeiro/relatorios",
    ])
    expect(screen.queryByRole("button", { name: /^veículos$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /localização/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /suprimentos/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /^configurações$/i }))
    expect(screen.queryByRole("link", { name: "Gestão" })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Usuário" })).toHaveAttribute("href", "/usuarios/9")
  })

  it("atendente continua vendo as telas operacionais e não vê Financeiro", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: "at@a.com",
        business_id: 3,
        role: "atendente",
        permissions: [
          "customers.view_client",
          "customers.view_vehicle",
          "workservices.view_appointment",
          "workservices.view_service",
          "locations.view_state",
          "suppliers.view_supplier",
          "products.view_product",
          "budgets.view_budget",
          "orders.view_order",
          "orders.view_fiscalnote",
          "businesses.view_business",
        ],
      }),
    )
    renderSidebar()

    for (const name of ["Clientes", "Agendamentos", "Orçamentos", "Ordens de Serviço"]) {
      expect(screen.getByRole("link", { name })).toBeInTheDocument()
    }
    expect(screen.getByRole("button", { name: /^notas fiscais$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^veículos$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /suprimentos/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^financeiro$/i })).not.toBeInTheDocument()
  })

  it("grupo Financeiro abre em Lançamentos, Categorias e Tags (OSFIN-P3-03)", () => {
    renderSidebar()

    fireEvent.click(screen.getByRole("button", { name: /^financeiro$/i }))

    expect(screen.getByRole("link", { name: "Lançamentos" })).toHaveAttribute("href", "/financeiro")
    expect(screen.getByRole("link", { name: "Categorias" })).toHaveAttribute(
      "href",
      "/financeiro/categorias",
    )
    expect(screen.getByRole("link", { name: "Tags" })).toHaveAttribute("href", "/financeiro/tags")
    expect(screen.getByRole("link", { name: "Relatórios" })).toHaveAttribute(
      "href",
      "/financeiro/relatorios",
    )
  })
})
