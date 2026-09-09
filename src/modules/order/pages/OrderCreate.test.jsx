import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import OrderCreate from "./OrderCreate"
import { BudgetService } from "@/modules/budget/services/budgets"

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateSpy }
})

let lastBudgetsUrl

function mockApi({ pending = [] } = {}) {
  server.use(
    http.get(`${API}/empreendimentos/`, () =>
      HttpResponse.json({ results: [{ id: 3, corporate_name: "Oficina Teste" }], count: 1 }),
    ),
    http.get(`${API}/clientes/`, () =>
      HttpResponse.json({
        results: [{ id: 5, first_name: "Ana", last_name: "Lima", business: 3 }],
        count: 1,
      }),
    ),
    http.get(`${API}/veiculos/`, () =>
      HttpResponse.json({
        results: [{ id: 9, client: 5, manufacturer: "VW", model: "Gol", plate: "ABC1D23" }],
        count: 1,
      }),
    ),
    http.get(`${API}/orcamentos/`, ({ request }) => {
      lastBudgetsUrl = new URL(request.url)
      return HttpResponse.json({ results: pending, count: pending.length })
    }),
  )
}

const pendingBudget = {
  id: 7,
  status: "pendente",
  total: "1500.00",
  products_total: "1000.00",
  services_total: "500.00",
}

beforeEach(() => {
  navigateSpy.mockClear()
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

async function pickClientAndVehicle() {
  const [clientSelect, vehicleSelect] = await screen.findAllByRole("combobox")
  fireEvent.change(clientSelect, { target: { value: "5" } })
  fireEvent.change(vehicleSelect, { target: { value: "9" } })
}

describe("<OrderCreate> — orçamento base", () => {
  it("lista os orçamentos pendentes do par cliente+veículo com os totais", async () => {
    mockApi({ pending: [pendingBudget] })
    renderWithProviders(<OrderCreate />)
    await pickClientAndVehicle()

    expect(await screen.findByText("Orçamento #7")).toBeInTheDocument()
    expect(screen.getByText("R$ 1.500,00")).toBeInTheDocument()
    expect(screen.getByText(/Produtos R\$ 1\.000,00 · Serviços R\$ 500,00/)).toBeInTheDocument()
    await waitFor(() => {
      expect(lastBudgetsUrl.searchParams.get("client_id")).toBe("5")
      expect(lastBudgetsUrl.searchParams.get("vehicle_id")).toBe("9")
      expect(lastBudgetsUrl.searchParams.get("status")).toBe("pendente")
    })
  })

  it("sem orçamento pendente, mostra o aviso e mantém o fluxo do zero", async () => {
    mockApi({ pending: [] })
    renderWithProviders(<OrderCreate />)
    await pickClientAndVehicle()

    expect(await screen.findByText(/Nenhum orçamento pendente/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /prosseguir para itens/i })).toBeInTheDocument()
  })

  it("escolher um orçamento troca o botão e aprova a OS ao confirmar", async () => {
    mockApi({ pending: [pendingBudget] })
    const approve = vi.spyOn(BudgetService, "approveBudget").mockResolvedValue({ id: 42 })

    renderWithProviders(<OrderCreate />)
    await pickClientAndVehicle()

    fireEvent.click(await screen.findByRole("button", { name: /orçamento #7/i }))
    const cta = screen.getByRole("button", { name: /aprovar orçamento e abrir a os/i })
    fireEvent.click(cta)

    await waitFor(() => expect(approve).toHaveBeenCalledWith(7, undefined))
    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith("/ordens/42"))

    approve.mockRestore()
  })
})
