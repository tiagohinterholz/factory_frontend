import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { Routes, Route } from "react-router-dom"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import BudgetEdit from "./BudgetEdit"
import { BudgetService } from "../services/budgets"

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateSpy }
})

const budget = {
  id: 1,
  business: { id: 2 },
  client: { id: 5, first_name: "Ana", last_name: "Lima", display_name: "Ana Lima" },
  vehicle: { id: 9, manufacturer: "VW", model: "Gol", plate: "ABC1D23" },
  valid_until: null,
  status: "pendente",
  total: "0.00",
  budget_products: [],
  budget_services: [],
}

function mockApi({ overrides = {} } = {}) {
  server.use(
    http.get(`${API}/orcamentos/1/`, () => HttpResponse.json({ ...budget, ...overrides })),
    http.get(`${API}/clientes/`, () =>
      HttpResponse.json({
        results: [
          { id: 5, first_name: "Ana", last_name: "Lima", display_name: "Ana Lima", business: 2 },
          {
            id: 6,
            first_name: "Bruno",
            last_name: "Souza",
            display_name: "Bruno Souza",
            business: 2,
          },
        ],
        count: 2,
      }),
    ),
    http.get(`${API}/veiculos/`, () =>
      HttpResponse.json({
        results: [
          {
            id: 9,
            client: 5,
            manufacturer: { id: 12, name: "VW" },
            model: { id: 55, name: "Gol" },
            plate: "ABC1D23",
          },
        ],
        count: 1,
      }),
    ),
    http.get(`${API}/produtos/`, () => HttpResponse.json({ results: [], count: 0 })),
    http.get(`${API}/servicos/`, () => HttpResponse.json({ results: [], count: 0 })),
  )
}

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/orcamentos/:id" element={<BudgetEdit />} />
    </Routes>,
    { route: "/orcamentos/1" },
  )

describe("<BudgetEdit> — live-select de cliente/veículo", () => {
  it("o select de Cliente/Veículo já vem com o cliente e o veículo do orçamento", async () => {
    mockApi()
    renderPage()

    await screen.findByText("pendente")
    const [clientInput, vehicleInput] = screen.getAllByRole("combobox")
    await waitFor(() => expect(clientInput).toHaveValue("Ana Lima"))
    expect(vehicleInput).toHaveValue("VW Gol (ABC1D23)")
  })

  // cenário: get_all() do back só traz is_active=True — um cliente/veículo
  // excluído ou anonimizado some da lista, mas o orçamento histórico ainda
  // aponta pra ele. Com o live-select controlado (value/onChange) o id do
  // form não se perde no submit, e com o fallback `extraOption` o nome
  // exibido também continua visível (não fica em branco) — ver
  // validation.md, Gap 1.
  it("cliente/veículo vinculados mas desativados (fora da lista de opções) continuam visíveis e no submit", async () => {
    mockApi()
    server.use(
      http.get(`${API}/clientes/`, () => HttpResponse.json({ results: [], count: 0 })),
      http.get(`${API}/veiculos/`, () => HttpResponse.json({ results: [], count: 0 })),
    )
    const update = vi.spyOn(BudgetService, "updateBudget").mockResolvedValue(budget)
    renderPage()

    await screen.findByText("pendente")
    const [clientInput, vehicleInput] = screen.getAllByRole("combobox")
    await waitFor(() => expect(clientInput).toHaveValue("Ana Lima"))
    await waitFor(() => expect(vehicleInput).toHaveValue("VW Gol (ABC1D23)"))

    fireEvent.click(screen.getByRole("button", { name: "Salvar Alterações" }))

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({ client_id: "5", vehicle_id: "9" }),
      ),
    )
    update.mockRestore()
  })

  it("trocar o cliente selecionado limpa o veículo já escolhido", async () => {
    mockApi()
    const user = userEvent.setup()
    renderPage()

    await screen.findByText("pendente")
    const [clientInput, vehicleInput] = screen.getAllByRole("combobox")
    await waitFor(() => expect(vehicleInput).toHaveValue("VW Gol (ABC1D23)"))

    await user.click(clientInput)
    await user.click(await screen.findByRole("option", { name: "Bruno Souza" }))

    expect(vehicleInput).toHaveValue("")
  })

  it("reselecionar o MESMO cliente não limpa o veículo já escolhido", async () => {
    // bug real reportado em uso: o Combobox dispara onChange mesmo ao
    // clicar no cliente que já estava selecionado — sem a checagem de
    // "mudou de verdade", isso zerava o veículo sem motivo.
    mockApi()
    const user = userEvent.setup()
    renderPage()

    await screen.findByText("pendente")
    const [clientInput, vehicleInput] = screen.getAllByRole("combobox")
    await waitFor(() => expect(vehicleInput).toHaveValue("VW Gol (ABC1D23)"))

    await user.click(clientInput)
    await user.click(await screen.findByRole("option", { name: "Ana Lima" }))

    expect(vehicleInput).toHaveValue("VW Gol (ABC1D23)")
  })

  it("trocar o cliente realmente limpa o vehicle_id do form, não só o texto exibido", async () => {
    // discrimina do filtro de exibição do VehicleLiveSelect (que já esconde o
    // veículo do cliente antigo por clientId): sem o setValue("vehicle_id","")
    // o id antigo continuaria no form e passaria a validação, enviando o
    // veículo errado (do cliente anterior) pro back.
    mockApi()
    const update = vi.spyOn(BudgetService, "updateBudget")
    const user = userEvent.setup()
    renderPage()

    await screen.findByText("pendente")
    const [clientInput] = screen.getAllByRole("combobox")
    await user.click(clientInput)
    await user.click(await screen.findByRole("option", { name: "Bruno Souza" }))

    fireEvent.click(screen.getByRole("button", { name: "Salvar Alterações" }))

    expect(await screen.findByText("Selecione o veículo")).toBeInTheDocument()
    expect(update).not.toHaveBeenCalled()
    update.mockRestore()
  })
})

describe("<BudgetEdit> — tarja de data da ação", () => {
  it("pendente: só o status, sem tarja de data", async () => {
    mockApi()
    renderPage()

    expect(await screen.findByText("pendente")).toBeInTheDocument()
    expect(screen.queryByText(/\d{2}\/\d{2}\/\d{4}/)).not.toBeInTheDocument()
  })

  it("aprovado: mostra a data de approved_at ao lado do status", async () => {
    mockApi({
      overrides: {
        status: "aprovado",
        approved_at: "2026-09-06T12:00:00.000Z",
        cancelled_at: null,
      },
    })
    renderPage()

    expect(await screen.findByText("aprovado")).toBeInTheDocument()
    expect(screen.getByText(/06\/09\/2026/)).toBeInTheDocument()
  })

  it("cancelado: mostra a data de cancelled_at", async () => {
    mockApi({
      overrides: {
        status: "cancelado",
        approved_at: null,
        cancelled_at: "2026-09-06T12:00:00.000Z",
      },
    })
    renderPage()

    expect(await screen.findByText("cancelado")).toBeInTheDocument()
    expect(screen.getByText(/06\/09\/2026/)).toBeInTheDocument()
  })

  it("expirado: mostra a data do valid_until", async () => {
    mockApi({
      overrides: {
        status: "expirado",
        approved_at: null,
        cancelled_at: null,
        valid_until: "2026-09-06T12:00:00.000Z",
      },
    })
    renderPage()

    expect(await screen.findByText("expirado")).toBeInTheDocument()
    expect(screen.getByText(/06\/09\/2026/)).toBeInTheDocument()
  })
})

describe("<BudgetEdit> — campos travados fora de pendente", () => {
  it("aprovado: campos gerais e botão de salvar ficam desabilitados", async () => {
    mockApi({ overrides: { status: "aprovado", approved_at: "2026-09-06T12:00:00.000Z" } })
    renderPage()

    expect(await screen.findByText(/edição bloqueada/i)).toBeInTheDocument()
    const [clientSelect, vehicleSelect] = screen.getAllByRole("combobox")
    expect(clientSelect).toBeDisabled()
    expect(vehicleSelect).toBeDisabled()
    expect(screen.getByPlaceholderText("Digite o(a) validade")).toBeDisabled()
    expect(screen.getByRole("button", { name: "Salvar Alterações" })).toBeDisabled()
  })

  it("pendente: campos gerais e botão de salvar continuam editáveis", async () => {
    mockApi()
    renderPage()

    await screen.findByText("pendente")
    const [clientSelect] = screen.getAllByRole("combobox")
    expect(clientSelect).toBeEnabled()
    expect(screen.getByRole("button", { name: "Salvar Alterações" })).toBeEnabled()
  })
})

describe("<BudgetEdit> — subtotais e total", () => {
  it("mostra o subtotal de produtos, o de serviços e o total geral do back", async () => {
    mockApi({
      overrides: { total: "6000.00", products_total: "5000.00", services_total: "1000.00" },
    })
    renderPage()

    expect(await screen.findByText("Subtotal produtos")).toBeInTheDocument()
    expect(screen.getByText("R$ 5.000,00")).toBeInTheDocument()
    expect(screen.getByText("Subtotal serviços")).toBeInTheDocument()
    expect(screen.getByText("R$ 1.000,00")).toBeInTheDocument()
    expect(screen.getByText("Total geral")).toBeInTheDocument()
    expect(screen.getByText("R$ 6.000,00")).toBeInTheDocument()
  })

  it("não lista item com is_active=false (deletado que o back ainda devolve)", async () => {
    mockApi({
      overrides: {
        budget_products: [
          {
            id: 1,
            quantity: 1,
            total: "10.00",
            is_active: true,
            product: { name: "Filtro ativo" },
          },
          {
            id: 2,
            quantity: 1,
            total: "20.00",
            is_active: false,
            product: { name: "Peça deletada" },
          },
        ],
      },
    })
    renderPage()

    expect(await screen.findByText(/Filtro ativo/)).toBeInTheDocument()
    expect(screen.queryByText(/Peça deletada/)).not.toBeInTheDocument()
  })
})

describe("<BudgetEdit> — duplicar", () => {
  it("pendente: sem botão Duplicar", async () => {
    mockApi()
    renderPage()

    expect(await screen.findByText("pendente")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Duplicar" })).not.toBeInTheDocument()
  })

  it("cancelado: duplica e navega pro orçamento novo", async () => {
    mockApi({ overrides: { status: "cancelado", cancelled_at: "2026-09-06T12:00:00.000Z" } })
    const duplicate = vi
      .spyOn(BudgetService, "duplicateBudget")
      .mockResolvedValue({ id: 42, status: "pendente" })
    renderPage()

    // botão do header
    fireEvent.click(await screen.findByRole("button", { name: "Duplicar" }))
    // botão de confirmar no diálogo (mesmo nome — pega o último)
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: "Duplicar" }).length).toBeGreaterThan(1),
    )
    const buttons = screen.getAllByRole("button", { name: "Duplicar" })
    fireEvent.click(buttons[buttons.length - 1])

    await waitFor(() => expect(duplicate).toHaveBeenCalledWith("1"))
    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith("/orcamentos/42"))

    duplicate.mockRestore()
  })
})

describe("<BudgetEdit> — aprovar com data opcional", () => {
  it("Aprovar abre o modal; confirmar sem data manda approve sem service_date", async () => {
    mockApi()
    const approve = vi.spyOn(BudgetService, "approveBudget").mockResolvedValue({})
    renderPage()

    fireEvent.click(await screen.findByRole("button", { name: /aprovar/i }))
    await screen.findByLabelText(/data e hora do serviço/i)
    fireEvent.click(screen.getAllByRole("button", { name: "Aprovar" }).at(-1))

    await waitFor(() => expect(approve).toHaveBeenCalledWith("1", undefined))
    approve.mockRestore()
  })

  it("com data preenchida, manda service_date ISO no approve", async () => {
    mockApi()
    const approve = vi.spyOn(BudgetService, "approveBudget").mockResolvedValue({})
    renderPage()

    fireEvent.click(await screen.findByRole("button", { name: /aprovar/i }))
    const input = await screen.findByLabelText(/data e hora do serviço/i)
    fireEvent.change(input, { target: { value: "2026-09-10T14:30" } })
    fireEvent.click(screen.getAllByRole("button", { name: "Aprovar" }).at(-1))

    await waitFor(() =>
      expect(approve).toHaveBeenCalledWith("1", {
        service_date: new Date("2026-09-10T14:30").toISOString(),
      }),
    )
    approve.mockRestore()
  })
})
