import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, fireEvent } from "@testing-library/react"
import { Routes, Route } from "react-router-dom"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import SupplierDetail from "./SupplierDetail"

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateSpy }
})

function mockSupplier({ products = [], services = [], phone = "(41) 91234-5678" } = {}) {
  server.use(
    http.get(`${API}/fornecedores/1/`, () =>
      HttpResponse.json({
        id: 1,
        business: 3,
        corporate_name: "ACME Peças",
        trade_name: "ACME",
        cnpj: "11.222.333/0001-81",
        state: { id: 1, name: "Paraná" },
        city: { id: 1, name: "Curitiba" },
        address: "Rua das Flores",
        number: "100",
        phone,
        email: "contato@acme.com",
      }),
    ),
    http.get(`${API}/estados/`, () =>
      HttpResponse.json({ results: [{ id: 1, name: "Paraná", abbreviation: "PR" }], count: 1 }),
    ),
    http.get(`${API}/estados/1/cidades/`, () =>
      HttpResponse.json({ results: [{ id: 1, name: "Curitiba" }], count: 1 }),
    ),
    http.get(`${API}/fornecedores/1/produtos/`, () =>
      HttpResponse.json({ results: products, count: products.length }),
    ),
    http.get(`${API}/fornecedores/1/servicos/`, () =>
      HttpResponse.json({ results: services, count: services.length }),
    ),
  )
}

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/fornecedores/:id" element={<SupplierDetail />} />
    </Routes>,
    { route: "/fornecedores/1" },
  )

beforeEach(() => {
  navigateSpy.mockClear()
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

describe("<SupplierDetail>", () => {
  it("marca os campos obrigatórios com *", async () => {
    mockSupplier()
    renderPage()

    expect(await screen.findByText("Razão Social *")).toBeInTheDocument()
    expect(screen.getByText("CNPJ *")).toBeInTheDocument()
    expect(screen.getByText("Telefone *")).toBeInTheDocument()
  })

  it("mostra o botão de WhatsApp com o telefone do fornecedor", async () => {
    mockSupplier()
    renderPage()

    const link = await screen.findByRole("link", { name: "WhatsApp" })
    expect(link).toHaveAttribute("href", "https://wa.me/5541912345678")
  })

  it("sem telefone, não mostra o botão de WhatsApp", async () => {
    mockSupplier({ phone: "" })
    renderPage()

    await screen.findByText("Razão Social *")
    expect(screen.queryByRole("link", { name: /whatsapp/i })).not.toBeInTheDocument()
  })

  it("rótulos 'Adicionar produto'/'Adicionar serviço' aparecem nos botões", async () => {
    mockSupplier()
    renderPage()

    expect(await screen.findByRole("button", { name: /adicionar produto/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /^serviços/i }))
    expect(screen.getByRole("button", { name: /adicionar serviço/i })).toBeInTheDocument()
  })

  it("mostra a quantidade em estoque do produto, abaixo do preço, e navega ao clicar", async () => {
    mockSupplier({
      products: [{ id: 5, name: "Pastilha de freio", unit_price: "80.00", stock_quantity: 12 }],
    })
    renderPage()

    const row = await screen.findByText("Pastilha de freio")
    expect(screen.getByText(/estoque: 12/i)).toBeInTheDocument()

    fireEvent.click(row)
    expect(navigateSpy).toHaveBeenCalledWith("/produtos/5")
  })

  it("clicar num serviço listado navega pra edição dele", async () => {
    mockSupplier({ services: [{ id: 9, name: "Alinhamento", unit_price: "50.00" }] })
    renderPage()

    await screen.findByRole("button", { name: /adicionar produto/i })
    fireEvent.click(screen.getByRole("button", { name: /^serviços/i }))
    const row = await screen.findByText("Alinhamento")
    fireEvent.click(row)

    expect(navigateSpy).toHaveBeenCalledWith("/servicos/9")
  })
})
