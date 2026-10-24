import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import AppointmentCreate from "./AppointmentCreate"
import { AppointmentService } from "../services/appointment"

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateSpy }
})

function mockApi({ orders = [] } = {}) {
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
    http.get(`${API}/ordens/`, () => HttpResponse.json({ results: orders, count: orders.length })),
  )
}

beforeEach(() => {
  navigateSpy.mockClear()
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

async function pickClient(user) {
  const [clientInput] = await screen.findAllByRole("combobox")
  await user.click(clientInput)
  await user.click(await screen.findByRole("option", { name: "Ana Lima" }))
}

describe("<AppointmentCreate>", () => {
  it("campo Veículo começa desabilitado antes de escolher o cliente proprietário", async () => {
    mockApi()
    renderWithProviders(<AppointmentCreate />)

    const [, vehicleInput] = await screen.findAllByRole("combobox")
    expect(vehicleInput).toBeDisabled()
  })

  it("campo Ordem de Serviço começa desabilitado antes de escolher o veículo", async () => {
    mockApi()
    renderWithProviders(<AppointmentCreate />)

    const comboboxes = await screen.findAllByRole("combobox")
    expect(comboboxes[2]).toBeDisabled()
  })

  it("escolhe cliente proprietário e veículo via busca e submete o agendamento", async () => {
    mockApi()
    server.use(
      http.post(`${API}/agendamentos/`, async ({ request }) => {
        const body = await request.json()
        expect(body).toMatchObject({ business_id: "3", client_id: "5", vehicle_id: "9" })
        return HttpResponse.json({ id: 1 }, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    renderWithProviders(<AppointmentCreate />)

    await pickClient(user)
    const [, vehicleInput] = screen.getAllByRole("combobox")
    await user.click(vehicleInput)
    await user.click(await screen.findByRole("option", { name: /VW Gol/ }))

    fireEvent.change(screen.getByPlaceholderText("Digite o(a) data"), {
      target: { value: "2026-10-30" },
    })
    await user.click(screen.getByRole("button", { name: /salvar agendamento/i }))

    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith("/agendamentos"))
  })

  it("trocar o cliente proprietário depois de escolher o veículo limpa o veículo", async () => {
    mockApi()
    const user = userEvent.setup()
    renderWithProviders(<AppointmentCreate />)

    await pickClient(user)
    const [clientInput, vehicleInput] = screen.getAllByRole("combobox")
    await user.click(vehicleInput)
    await user.click(await screen.findByRole("option", { name: /VW Gol/ }))
    expect(vehicleInput.value).toContain("VW Gol")

    await user.click(clientInput)
    await user.click(await screen.findByRole("option", { name: "Bruno Souza" }))

    expect(vehicleInput).toHaveValue("")
  })

  it("reselecionar o MESMO cliente não limpa o veículo já escolhido", async () => {
    mockApi()
    const user = userEvent.setup()
    renderWithProviders(<AppointmentCreate />)

    await pickClient(user)
    const [clientInput, vehicleInput] = screen.getAllByRole("combobox")
    await user.click(vehicleInput)
    await user.click(await screen.findByRole("option", { name: /VW Gol/ }))
    expect(vehicleInput.value).toContain("VW Gol")

    await user.click(clientInput)
    await user.click(await screen.findByRole("option", { name: "Ana Lima" }))

    expect(vehicleInput.value).toContain("VW Gol")
  })

  it("trocar o cliente proprietário realmente limpa o vehicle_id do form, não só o texto exibido", async () => {
    mockApi()
    const create = vi.spyOn(AppointmentService, "createAppointment")
    const user = userEvent.setup()
    renderWithProviders(<AppointmentCreate />)

    await pickClient(user)
    const [clientInput, vehicleInput] = screen.getAllByRole("combobox")
    await user.click(vehicleInput)
    await user.click(await screen.findByRole("option", { name: /VW Gol/ }))

    await user.click(clientInput)
    await user.click(await screen.findByRole("option", { name: "Bruno Souza" }))

    fireEvent.change(screen.getByPlaceholderText("Digite o(a) data"), {
      target: { value: "2026-10-30" },
    })
    await user.click(screen.getByRole("button", { name: /salvar agendamento/i }))

    expect(await screen.findByText("Selecione o veículo")).toBeInTheDocument()
    expect(create).not.toHaveBeenCalled()
    create.mockRestore()
  })
})
