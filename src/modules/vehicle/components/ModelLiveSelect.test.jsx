import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ModelLiveSelect from "./ModelLiveSelect"

beforeEach(() => {
  server.use(
    http.get(`${API}/marcas/`, () =>
      HttpResponse.json({ results: [{ id: 1, name: "Toyota" }], count: 1 }),
    ),
  )
})

function mockModels(manufacturerId, results = []) {
  server.use(
    http.get(`${API}/marcas/${manufacturerId}/modelos/`, () =>
      HttpResponse.json({ results, count: results.length }),
    ),
  )
}

describe("<ModelLiveSelect>", () => {
  it("sem manufacturerId, fica desabilitado com disabledHint e sem atalho de criar", async () => {
    renderWithProviders(<ModelLiveSelect label="Modelo" value="" onChange={vi.fn()} />)

    const input = await screen.findByRole("combobox")
    expect(input).toBeDisabled()
    expect(input).toHaveAttribute("placeholder", "Selecione a marca primeiro")
  })

  it("com manufacturerId, filtra as opções pelo modelo da marca e por nome", async () => {
    mockModels(1, [
      { id: 1, name: "Corolla" },
      { id: 2, name: "Hilux" },
    ])
    const user = userEvent.setup()
    renderWithProviders(
      <ModelLiveSelect label="Modelo" value="" onChange={vi.fn()} manufacturerId={1} />,
    )

    const input = await screen.findByRole("combobox")
    expect(input).not.toBeDisabled()
    await user.click(input)
    await screen.findByRole("option", { name: "Corolla" })
    await user.type(input, "hilux")

    expect(await screen.findByRole("option", { name: "Hilux" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Corolla" })).not.toBeInTheDocument()
  })

  it("com manufacturerId e sem match, mostra 'Cadastrar novo modelo' que abre o modal com a marca certa", async () => {
    mockModels(1, [{ id: 1, name: "Corolla" }])
    const user = userEvent.setup()
    renderWithProviders(
      <ModelLiveSelect label="Modelo" value="" onChange={vi.fn()} manufacturerId={1} />,
    )

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await screen.findByRole("option", { name: "Corolla" })
    await user.type(input, "nenhum-modelo-bate")

    await user.click(await screen.findByRole("option", { name: "Cadastrar novo modelo" }))
    const dialog = await screen.findByRole("dialog")
    await waitFor(() =>
      expect(within(dialog).getByText("Marca").closest("div").querySelector("input")).toHaveValue(
        "Toyota",
      ),
    )
  })

  it("modal criado com sucesso seleciona o modelo novo automaticamente e fecha", async () => {
    mockModels(1, [])
    server.use(
      http.post(`${API}/modelos-veiculo/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 42, name: "Corolla", ...body }, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(
      <ModelLiveSelect label="Modelo" value="" onChange={onChange} manufacturerId={1} />,
    )

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await user.click(await screen.findByRole("option", { name: "Cadastrar novo modelo" }))

    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByPlaceholderText("Ex: Corolla"), "Corolla")
    await user.click(within(dialog).getByRole("button", { name: "Salvar Modelo" }))

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("42"))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })
})
