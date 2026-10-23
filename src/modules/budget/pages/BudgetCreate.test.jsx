import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import BudgetCreate from "./BudgetCreate"
import { BudgetService } from "../services/budgets"

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateSpy }
})

function mockApi() {
  server.use(
    http.get(`${API}/clientes/`, () =>
      HttpResponse.json({
        results: [
          { id: 5, display_name: "Ana Lima", business: 3 },
          { id: 6, display_name: "Bruno Souza", business: 3 },
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
  )
}

beforeEach(() => {
  navigateSpy.mockClear()
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

async function pickClientAndVehicle() {
  const user = userEvent.setup()
  const [clientInput, vehicleInput] = await screen.findAllByRole("combobox")
  await user.click(clientInput)
  await user.click(await screen.findByRole("option", { name: "Ana Lima" }))
  await user.click(vehicleInput)
  await user.click(await screen.findByRole("option", { name: /VW Gol \(ABC1D23\)/ }))
  return { user, clientInput, vehicleInput }
}

describe("<BudgetCreate>", () => {
  it("campo Veículo começa desabilitado antes de escolher o cliente", async () => {
    mockApi()
    renderWithProviders(<BudgetCreate />)

    const [, vehicleInput] = await screen.findAllByRole("combobox")
    expect(vehicleInput).toBeDisabled()
  })

  it("escolher cliente e veículo e submeter cria o orçamento e navega pra ele", async () => {
    mockApi()
    server.use(
      http.post(`${API}/orcamentos/`, async ({ request }) => {
        const body = await request.json()
        expect(body).toMatchObject({ business_id: "3", client_id: "5", vehicle_id: "9" })
        return HttpResponse.json({ id: 42 }, { status: 201 })
      }),
    )
    renderWithProviders(<BudgetCreate />)
    const { user } = await pickClientAndVehicle()

    await user.click(screen.getByRole("button", { name: /prosseguir para itens/i }))

    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith("/orcamentos/42"))
  })

  it("trocar o cliente selecionado depois de escolher um veículo limpa o veículo", async () => {
    mockApi()
    renderWithProviders(<BudgetCreate />)
    const { user, clientInput, vehicleInput } = await pickClientAndVehicle()
    expect(vehicleInput).toHaveValue("VW Gol (ABC1D23)")

    await user.click(clientInput)
    await user.click(await screen.findByRole("option", { name: "Bruno Souza" }))

    expect(vehicleInput).toHaveValue("")
  })

  it("reselecionar o MESMO cliente não limpa o veículo já escolhido", async () => {
    // bug real reportado em uso: o Combobox dispara onChange mesmo ao
    // clicar no cliente que já estava selecionado — sem a checagem de
    // "mudou de verdade", isso zerava o veículo sem motivo.
    mockApi()
    renderWithProviders(<BudgetCreate />)
    const { user, clientInput, vehicleInput } = await pickClientAndVehicle()
    expect(vehicleInput).toHaveValue("VW Gol (ABC1D23)")

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
    const create = vi.spyOn(BudgetService, "createBudget")
    renderWithProviders(<BudgetCreate />)
    const { user, clientInput } = await pickClientAndVehicle()

    await user.click(clientInput)
    await user.click(await screen.findByRole("option", { name: "Bruno Souza" }))

    await user.click(screen.getByRole("button", { name: /prosseguir para itens/i }))

    expect(await screen.findByText("Selecione o veículo")).toBeInTheDocument()
    expect(create).not.toHaveBeenCalled()
    create.mockRestore()
  })
})
