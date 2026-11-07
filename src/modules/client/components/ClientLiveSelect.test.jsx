import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ClientLiveSelect from "./ClientLiveSelect"

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

function mockClients(results = []) {
  server.use(
    http.get(`${API}/clientes/`, () => HttpResponse.json({ results, count: results.length })),
  )
}

describe("<ClientLiveSelect>", () => {
  it("filtra por nome OU documento (CPF/CNPJ), case-insensitive", async () => {
    mockClients([
      { id: 1, display_name: "Ana Silva", cpf: "111.444.777-35" },
      { id: 2, display_name: "Bruno Souza", cpf: "222.555.888-46" },
    ])
    const user = userEvent.setup()
    renderWithProviders(<ClientLiveSelect label="Cliente" value="" onChange={vi.fn()} />)

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await screen.findByRole("option", { name: "Ana Silva" })
    await user.type(input, "222.555")

    expect(await screen.findByRole("option", { name: "Bruno Souza" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Ana Silva" })).not.toBeInTheDocument()
  })

  it("sem match, mostra 'Cadastrar novo cliente' que abre o modal", async () => {
    mockClients([{ id: 1, display_name: "Ana Silva", cpf: "111.444.777-35" }])
    const user = userEvent.setup()
    renderWithProviders(<ClientLiveSelect label="Cliente" value="" onChange={vi.fn()} />)

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await screen.findByRole("option", { name: "Ana Silva" })
    await user.type(input, "nenhum-cliente-bate")

    await user.click(await screen.findByRole("option", { name: "Cadastrar novo cliente" }))
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
  })

  it("lista vazia (base nova) mostra direto o atalho de criar, sem 'nenhum resultado'", async () => {
    mockClients([])
    const user = userEvent.setup()
    renderWithProviders(<ClientLiveSelect label="Cliente" value="" onChange={vi.fn()} />)

    const input = await screen.findByRole("combobox")
    await user.click(input)

    expect(
      await screen.findByRole("option", { name: "Cadastrar novo cliente" }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/nenhum resultado/i)).not.toBeInTheDocument()
  })

  it("modal criado com sucesso seleciona o cliente novo automaticamente e fecha", async () => {
    mockClients([])
    server.use(
      http.get(`${API}/estados/`, () =>
        HttpResponse.json({ results: [{ id: 1, name: "Paraná" }], count: 1 }),
      ),
      http.get(`${API}/estados/1/cidades/`, () =>
        HttpResponse.json({ results: [{ id: 10, name: "Curitiba" }], count: 1 }),
      ),
      http.post(`${API}/clientes/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json(
          { id: 99, display_name: "Carlos Mendes", ...body },
          { status: 201 },
        )
      }),
    )
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<ClientLiveSelect label="Cliente" value="" onChange={onChange} />)

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await user.click(await screen.findByRole("option", { name: "Cadastrar novo cliente" }))

    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByPlaceholderText("Ex: João"), "Carlos")
    await user.type(within(dialog).getByPlaceholderText("Ex: Silva"), "Mendes")
    await user.type(within(dialog).getByPlaceholderText("000.000.000-00"), "98765432100")
    await user.selectOptions(
      within(dialog).getByText("Estado").closest("div").querySelector("select"),
      "1",
    )
    await waitFor(() => {
      const citySelect = within(dialog).getByText("Cidade").closest("div").querySelector("select")
      expect(citySelect).not.toBeDisabled()
    })
    await user.selectOptions(
      within(dialog).getByText("Cidade").closest("div").querySelector("select"),
      "10",
    )
    await user.type(within(dialog).getByPlaceholderText("(00) 00000-0000"), "11912345678")
    await user.click(within(dialog).getByRole("button", { name: "Salvar Cliente" }))

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("99"))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("REPRO: valor já selecionado continua exibido depois de abrir e fechar o modal sem salvar", async () => {
    mockClients([{ id: 1, display_name: "Ana Silva", cpf: "111.444.777-35" }])
    const user = userEvent.setup()
    renderWithProviders(<ClientLiveSelect label="Cliente" value="1" onChange={vi.fn()} />)

    const input = await screen.findByRole("combobox")
    await waitFor(() => expect(input).toHaveValue("Ana Silva"))

    await user.click(input)
    await user.type(input, "zzz-nao-existe")
    await user.click(await screen.findByRole("option", { name: "Cadastrar novo cliente" }))

    await screen.findByRole("dialog")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())

    await waitFor(() => expect(input).toHaveValue("Ana Silva"))
  })

  it("DIAGNÓSTICO: reselecionar o cliente já selecionado ainda dispara onChange", async () => {
    mockClients([{ id: 1, display_name: "Ana Silva", cpf: "111.444.777-35" }])
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<ClientLiveSelect label="Cliente" value="1" onChange={onChange} />)

    const input = await screen.findByRole("combobox")
    await waitFor(() => expect(input).toHaveValue("Ana Silva"))

    await user.click(input)
    await user.click(await screen.findByRole("option", { name: "Ana Silva" }))

    expect(onChange).toHaveBeenCalledWith("1")
  })
})
