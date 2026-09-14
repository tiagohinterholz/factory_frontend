import { describe, it, expect, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import Settings from "./Settings"

const business = {
  id: 1,
  corporate_name: "AutoFlow Serviços Automotivos Ltda",
  trade_name: "AutoFlow Center",
  cnpj: "12.345.678/0001-90",
  state_registration: "90.123.456-78",
  municipal_registration: "",
  tax_regime: "simples_nacional",
  state: { id: 5, name: "Paraná", abbreviation: "PR" },
  city: { id: 9, name: "Curitiba" },
  address: "Rua das Oficinas",
  number: "482",
  complement: "",
  phone: "(41) 99876-5432",
  email: "contato@autoflow.com.br",
  logo_url: "https://api.example.com/configuracoes/logo/",
}

const hours = Array.from({ length: 7 }, (_, weekday) => ({
  id: weekday + 1,
  weekday,
  weekday_display: weekday === 6 ? "Domingo" : `Dia ${weekday}`,
  opens_at: weekday === 6 ? null : "08:00:00",
  closes_at: weekday === 6 ? null : "18:00:00",
  is_closed: weekday === 6,
}))

function mockApi() {
  server.use(
    http.get(`${API}/configuracoes/`, () => HttpResponse.json(business)),
    http.get(`${API}/configuracoes/horarios/`, () => HttpResponse.json(hours)),
    http.get(`${API}/configuracoes/logo/`, () => new HttpResponse(null, { status: 404 })),
    http.get(`${API}/estados/`, () =>
      HttpResponse.json({ results: [{ id: 5, name: "Paraná", abbreviation: "PR" }], count: 1 }),
    ),
    http.get(`${API}/estados/5/cidades/`, () =>
      HttpResponse.json({ results: [{ id: 9, name: "Curitiba" }], count: 1 }),
    ),
    http.patch(`${API}/configuracoes/`, async ({ request }) => {
      const payload = await request.json()
      return HttpResponse.json({ ...business, ...payload })
    }),
  )
}

describe("<Settings>", () => {
  beforeEach(() => {
    localStorage.setItem("user", JSON.stringify({ business_id: 1, role: "admin" }))
    mockApi()
  })

  it("abre em modo visualização: campos travados e sem excluir empresa", async () => {
    renderWithProviders(<Settings />)

    expect(await screen.findByDisplayValue("AutoFlow Serviços Automotivos Ltda")).toBeDisabled()
    expect(screen.getByRole("button", { name: /editar empreendimento/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /excluir/i })).not.toBeInTheDocument()
  })

  it("Editar Empreendimento libera o form inteiro de uma vez", async () => {
    renderWithProviders(<Settings />)

    await screen.findByDisplayValue("AutoFlow Serviços Automotivos Ltda")
    fireEvent.click(screen.getByRole("button", { name: /editar empreendimento/i }))

    expect(screen.getByDisplayValue("AutoFlow Serviços Automotivos Ltda")).toBeEnabled()
    expect(screen.getByDisplayValue("Curitiba")).toBeEnabled()
    expect(screen.getByRole("button", { name: /^cancelar$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /salvar alterações/i })).toBeInTheDocument()
  })

  it("Cancelar descarta a edição e volta pra visualização travada", async () => {
    renderWithProviders(<Settings />)

    const nameInput = await screen.findByDisplayValue("AutoFlow Serviços Automotivos Ltda")
    fireEvent.click(screen.getByRole("button", { name: /editar empreendimento/i }))
    fireEvent.change(screen.getByDisplayValue("AutoFlow Serviços Automotivos Ltda"), {
      target: { value: "Nome Rascunho" },
    })

    fireEvent.click(screen.getByRole("button", { name: /^cancelar$/i }))

    expect(await screen.findByDisplayValue("AutoFlow Serviços Automotivos Ltda")).toBeDisabled()
    expect(screen.queryByDisplayValue("Nome Rascunho")).not.toBeInTheDocument()
    expect(nameInput).toBeInTheDocument()
  })

  it("Salvar grava e volta pra visualização sem navegar pra outra página", async () => {
    renderWithProviders(<Settings />)

    await screen.findByDisplayValue("AutoFlow Serviços Automotivos Ltda")
    fireEvent.click(screen.getByRole("button", { name: /editar empreendimento/i }))
    fireEvent.change(screen.getByDisplayValue("AutoFlow Serviços Automotivos Ltda"), {
      target: { value: "AutoFlow Matriz Ltda" },
    })
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }))

    expect(await screen.findByDisplayValue("AutoFlow Matriz Ltda")).toBeDisabled()
    expect(screen.getByRole("button", { name: /editar empreendimento/i })).toBeInTheDocument()
  })

  it("horário de funcionamento aparece em faixa, travado fora do modo edição", async () => {
    renderWithProviders(<Settings />)

    await screen.findByText("Horário de Funcionamento")
    expect(screen.getByText("Domingo")).toBeInTheDocument()
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /editar empreendimento/i }))

    await waitFor(() => expect(screen.getAllByRole("checkbox")).toHaveLength(7))
  })
})
