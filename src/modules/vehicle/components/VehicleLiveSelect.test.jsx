import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import VehicleLiveSelect from "./VehicleLiveSelect"

const CURRENT_YEAR = String(new Date().getFullYear())

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

const baseVehicles = [
  {
    id: 1,
    plate: "ABC-1234",
    manufacturer: { id: 1, name: "Volkswagen" },
    model: { id: 1, name: "Gol" },
    client: { id: 9 },
  },
  {
    id: 2,
    plate: "XYZ-9999",
    manufacturer: { id: 2, name: "Fiat" },
    model: { id: 2, name: "Uno" },
    client: { id: 20 },
  },
]

function mockVehicles(results = baseVehicles) {
  server.use(
    http.get(`${API}/veiculos/`, () => HttpResponse.json({ results, count: results.length })),
  )
}

describe("<VehicleLiveSelect>", () => {
  it("filtra as opções pelo clientId recebido antes do filtro de texto", async () => {
    mockVehicles()
    const user = userEvent.setup()
    renderWithProviders(
      <VehicleLiveSelect label="Veículo" value="" onChange={vi.fn()} clientId={9} />,
    )

    const input = await screen.findByRole("combobox")
    await user.click(input)

    expect(
      await screen.findByRole("option", { name: /Volkswagen Gol \(ABC-1234\)/ }),
    ).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: /Fiat Uno/ })).not.toBeInTheDocument()
  })

  it("filtro de texto bate contra placa OU marca+modelo, case-insensitive", async () => {
    mockVehicles([baseVehicles[0], { ...baseVehicles[1], client: { id: 9 } }])
    const user = userEvent.setup()
    renderWithProviders(
      <VehicleLiveSelect label="Veículo" value="" onChange={vi.fn()} clientId={9} />,
    )

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await screen.findByRole("option", { name: /Volkswagen Gol/ })
    await user.type(input, "xyz-9999")

    expect(await screen.findByRole("option", { name: /Fiat Uno/ })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: /Volkswagen Gol/ })).not.toBeInTheDocument()
  })

  it("sem clientId, fica desabilitado com disabledHint e sem atalho de criar", async () => {
    mockVehicles()
    renderWithProviders(<VehicleLiveSelect label="Veículo" value="" onChange={vi.fn()} />)

    const input = await screen.findByRole("combobox")
    expect(input).toBeDisabled()
    expect(input).toHaveAttribute("placeholder", "Escolha um cliente primeiro")
  })

  it("com clientId e sem match, mostra 'Cadastrar novo veículo' que abre o modal com o cliente certo", async () => {
    mockVehicles()
    const user = userEvent.setup()
    renderWithProviders(
      <VehicleLiveSelect label="Veículo" value="" onChange={vi.fn()} clientId={9} />,
    )

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await screen.findByRole("option", { name: /Volkswagen Gol/ })
    await user.type(input, "nenhum-veiculo-bate")

    await user.click(await screen.findByRole("option", { name: "Cadastrar novo veículo" }))
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
  })

  it("modal criado com sucesso seleciona o veículo novo automaticamente e fecha", async () => {
    mockVehicles()
    server.use(
      http.get(`${API}/marcas/`, () =>
        HttpResponse.json({ results: [{ id: 1, name: "Volkswagen" }], count: 1 }),
      ),
      http.get(`${API}/marcas/1/modelos/`, () =>
        HttpResponse.json({ results: [{ id: 1, name: "Gol" }], count: 1 }),
      ),
      http.post(`${API}/veiculos/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 55, plate: "NEW-0001", ...body }, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(
      <VehicleLiveSelect label="Veículo" value="" onChange={onChange} clientId={9} />,
    )

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await screen.findByRole("option", { name: /Volkswagen Gol/ })
    await user.type(input, "nenhum-veiculo-bate")
    await user.click(await screen.findByRole("option", { name: "Cadastrar novo veículo" }))

    const dialog = await screen.findByRole("dialog")
    await within(dialog).findByRole("option", { name: "Volkswagen" })
    const selects = within(dialog).getAllByRole("combobox")
    await user.selectOptions(selects[0], "1")
    await within(dialog).findByRole("option", { name: "Gol" })

    const selectsAfter = within(dialog).getAllByRole("combobox")
    await user.selectOptions(selectsAfter[1], "1")
    await user.selectOptions(selectsAfter[2], CURRENT_YEAR)
    await user.selectOptions(selectsAfter[3], CURRENT_YEAR)
    await user.selectOptions(selectsAfter[4], "gasolina")
    await user.type(within(dialog).getByPlaceholderText("ABC-1234"), "NEW-0001")
    await user.click(within(dialog).getByRole("button", { name: "Salvar Veículo" }))

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("55"))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })
})
