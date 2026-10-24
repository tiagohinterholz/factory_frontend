import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import VehicleCreate from "./VehicleCreate"

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateSpy }
})

function searchComboboxes() {
  return screen
    .getAllByRole("combobox")
    .filter((el) => el.id?.startsWith("headlessui-combobox-input"))
}

function mockApi() {
  server.use(
    http.get(`${API}/clientes/`, () =>
      HttpResponse.json({ results: [{ id: 5, display_name: "Ana Lima" }], count: 1 }),
    ),
    http.get(`${API}/marcas/`, () =>
      HttpResponse.json({ results: [{ id: 1, name: "VW" }], count: 1 }),
    ),
    http.get(`${API}/marcas/1/modelos/`, () =>
      HttpResponse.json({ results: [{ id: 2, name: "Gol" }], count: 1 }),
    ),
    http.get(`${API}/estados/`, () => HttpResponse.json({ results: [], count: 0 })),
  )
}

beforeEach(() => {
  navigateSpy.mockClear()
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

describe("<VehicleCreate>", () => {
  it("usa LiveSelect (combobox com busca) pra Cliente/Marca/Modelo, não mais <select> fechado", async () => {
    mockApi()
    renderWithProviders(<VehicleCreate />)

    await screen.findByText("Cliente Proprietário *")
    const comboboxes = searchComboboxes()
    expect(comboboxes).toHaveLength(3)
    expect(comboboxes[2]).toBeDisabled()
  })

  it("marca os campos obrigatórios com *", async () => {
    mockApi()
    renderWithProviders(<VehicleCreate />)

    expect(await screen.findByText("Cliente Proprietário *")).toBeInTheDocument()
    expect(screen.getByText("Marca *")).toBeInTheDocument()
    expect(screen.getByText("Modelo *")).toBeInTheDocument()
    expect(screen.getByText("Ano de Fabricação *")).toBeInTheDocument()
    expect(screen.getByText("Ano do Modelo *")).toBeInTheDocument()
    expect(screen.getByText("Placa *")).toBeInTheDocument()
    expect(screen.getByText("Combustível *")).toBeInTheDocument()
    expect(screen.getByText("Cor")).toBeInTheDocument()
    expect(screen.getByText("Quilometragem")).toBeInTheDocument()
  })

  it("aplica a máscara da placa (formato antigo) e maiusculiza ao perder o foco", async () => {
    mockApi()
    renderWithProviders(<VehicleCreate />)
    const user = userEvent.setup()

    const plate = await screen.findByPlaceholderText("ABC-1234")
    await user.type(plate, "abc1234")
    expect(plate.value).toBe("abc-1234")
    await user.tab()
    expect(plate.value).toBe("ABC-1234")
  })

  it("aplica a máscara da placa (Mercosul) e maiusculiza ao perder o foco", async () => {
    mockApi()
    renderWithProviders(<VehicleCreate />)
    const user = userEvent.setup()

    const plate = await screen.findByPlaceholderText("ABC-1234")
    await user.type(plate, "abc1d23")
    expect(plate.value).toBe("abc-1d23")
    await user.tab()
    expect(plate.value).toBe("ABC-1D23")
  })

  async function fillAndSubmit(user) {
    const [clientInput] = searchComboboxes()
    await user.click(clientInput)
    await user.click(await screen.findByRole("option", { name: "Ana Lima" }))

    const manufacturerInput = searchComboboxes()[1]
    await user.click(manufacturerInput)
    await user.click(await screen.findByRole("option", { name: "VW" }))

    const modelInput = searchComboboxes()[2]
    await user.click(modelInput)
    await user.click(await screen.findByRole("option", { name: "Gol" }))

    await user.type(screen.getByPlaceholderText("ABC-1234"), "abc1234")
    const nativeSelects = document.querySelectorAll("select")
    await user.selectOptions(nativeSelects[0], "2020")
    await user.selectOptions(nativeSelects[1], "2020")
    await user.selectOptions(nativeSelects[2], "flex")

    await user.click(screen.getByRole("button", { name: /salvar veículo/i }))
  }

  it("sem clientId de origem, ao criar com sucesso vai pra edição do próprio veículo (não /veiculos)", async () => {
    mockApi()
    server.use(http.post(`${API}/veiculos/`, () => HttpResponse.json({ id: 99 }, { status: 201 })))
    renderWithProviders(<VehicleCreate />)

    const user = userEvent.setup()
    await fillAndSubmit(user)

    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith("/veiculos/99", { replace: true }))
  })

  it("vindo do botão 'Adicionar veículo' de um Cliente, volta pra edição desse Cliente (não /veiculos)", async () => {
    mockApi()
    server.use(http.post(`${API}/veiculos/`, () => HttpResponse.json({ id: 99 }, { status: 201 })))
    renderWithProviders(<VehicleCreate />, {
      route: { pathname: "/veiculos/novo", state: { clientId: 5 } },
    })

    const user = userEvent.setup()
    await fillAndSubmit(user)

    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith("/clientes/5", { replace: true }))
  })
})
