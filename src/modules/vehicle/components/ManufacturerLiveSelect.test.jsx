import { describe, it, expect, vi } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ManufacturerLiveSelect from "./ManufacturerLiveSelect"

function mockManufacturers(results = []) {
  server.use(
    http.get(`${API}/marcas/`, () => HttpResponse.json({ results, count: results.length })),
  )
}

describe("<ManufacturerLiveSelect>", () => {
  it("filtra por nome, case-insensitive", async () => {
    mockManufacturers([
      { id: 1, name: "Volkswagen" },
      { id: 2, name: "Toyota" },
    ])
    const user = userEvent.setup()
    renderWithProviders(<ManufacturerLiveSelect label="Marca" value="" onChange={vi.fn()} />)

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await screen.findByRole("option", { name: "Volkswagen" })
    await user.type(input, "toyo")

    expect(await screen.findByRole("option", { name: "Toyota" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Volkswagen" })).not.toBeInTheDocument()
  })

  it("sem match, mostra 'Cadastrar nova marca' que abre o modal", async () => {
    mockManufacturers([{ id: 1, name: "Volkswagen" }])
    const user = userEvent.setup()
    renderWithProviders(<ManufacturerLiveSelect label="Marca" value="" onChange={vi.fn()} />)

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await screen.findByRole("option", { name: "Volkswagen" })
    await user.type(input, "nenhuma-marca-bate")

    await user.click(await screen.findByRole("option", { name: "Cadastrar nova marca" }))
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
  })

  it("lista vazia mostra direto o atalho de criar, sem 'nenhum resultado'", async () => {
    mockManufacturers([])
    const user = userEvent.setup()
    renderWithProviders(<ManufacturerLiveSelect label="Marca" value="" onChange={vi.fn()} />)

    const input = await screen.findByRole("combobox")
    await user.click(input)

    expect(await screen.findByRole("option", { name: "Cadastrar nova marca" })).toBeInTheDocument()
    expect(screen.queryByText(/nenhum resultado/i)).not.toBeInTheDocument()
  })

  it("modal criado com sucesso seleciona a marca nova automaticamente e fecha", async () => {
    mockManufacturers([])
    server.use(
      http.post(`${API}/marcas/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 9, name: "Toyota", ...body }, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<ManufacturerLiveSelect label="Marca" value="" onChange={onChange} />)

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await user.click(await screen.findByRole("option", { name: "Cadastrar nova marca" }))

    const dialog = await screen.findByRole("dialog")
    await user.type(screen.getByPlaceholderText("Ex: Toyota"), "Toyota")
    await user.click(screen.getByRole("button", { name: "Salvar Marca" }))

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("9"))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(dialog).not.toBeInTheDocument()
  })
})
