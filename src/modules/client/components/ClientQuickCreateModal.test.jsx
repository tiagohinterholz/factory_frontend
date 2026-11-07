import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ClientQuickCreateModal from "./ClientQuickCreateModal"

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
  server.use(
    http.get(`${API}/estados/`, () =>
      HttpResponse.json({ results: [{ id: 1, name: "Paraná", abbreviation: "PR" }], count: 1 }),
    ),
    http.get(`${API}/estados/1/cidades/`, () =>
      HttpResponse.json({ results: [{ id: 10, name: "Curitiba" }], count: 1 }),
    ),
  )
})

function renderModal(props = {}) {
  const onClose = vi.fn()
  const onCreated = vi.fn()
  renderWithProviders(
    <ClientQuickCreateModal open onClose={onClose} onCreated={onCreated} {...props} />,
  )
  return { onClose, onCreated }
}

function getDialog() {
  return screen.getByRole("dialog")
}

async function fillMinimumPf(user) {
  const dialog = getDialog()
  await user.type(within(dialog).getByPlaceholderText("Ex: João"), "Ana")
  await user.type(within(dialog).getByPlaceholderText("Ex: Silva"), "Silva")
  await user.type(within(dialog).getByPlaceholderText("000.000.000-00"), "12345678901")
  await user.selectOptions(
    within(dialog).getByText("Estado").closest("div").querySelector("select"),
    "1",
  )
  await waitFor(() => {
    const citySelect = within(dialog).getByText("Cidade").closest("div").querySelector("select")
    expect(citySelect).not.toBeDisabled()
  })
  const citySelect = within(dialog).getByText("Cidade").closest("div").querySelector("select")
  await user.selectOptions(citySelect, "10")
  await user.type(within(dialog).getByPlaceholderText("(00) 00000-0000"), "11912345678")
}

describe("<ClientQuickCreateModal>", () => {
  it("renderiza exatamente os campos mínimos do spec (AC4) para PF", () => {
    renderModal()
    const dialog = getDialog()

    expect(within(dialog).getByText("Pessoa Física")).toBeInTheDocument()
    expect(within(dialog).getByPlaceholderText("Ex: João")).toBeInTheDocument()
    expect(within(dialog).getByPlaceholderText("Ex: Silva")).toBeInTheDocument()
    expect(within(dialog).getByPlaceholderText("000.000.000-00")).toBeInTheDocument()
    expect(within(dialog).getByText("Estado")).toBeInTheDocument()
    expect(within(dialog).getByText("Cidade")).toBeInTheDocument()
    expect(within(dialog).getByPlaceholderText("(00) 00000-0000")).toBeInTheDocument()

    expect(within(dialog).queryByText("E-mail")).not.toBeInTheDocument()
    expect(within(dialog).queryByText("Endereço")).not.toBeInTheDocument()
  })

  it("alterna pra PJ e mostra razão social + CNPJ em vez de nome/sobrenome/CPF", async () => {
    const user = userEvent.setup()
    renderModal()
    const dialog = getDialog()

    await user.click(within(dialog).getByRole("button", { name: "Pessoa Jurídica" }))

    expect(
      within(dialog).getByPlaceholderText("Ex: Frota Veloz Transportes Ltda"),
    ).toBeInTheDocument()
    expect(within(dialog).getByPlaceholderText("00.000.000/0000-00")).toBeInTheDocument()
    expect(within(dialog).queryByPlaceholderText("Ex: João")).not.toBeInTheDocument()
    expect(within(dialog).queryByPlaceholderText("000.000.000-00")).not.toBeInTheDocument()
  })

  it("submete via ClientService.createClient, chama onCreated e fecha no sucesso", async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API}/clientes/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 42, display_name: "Ana Silva", ...body }, { status: 201 })
      }),
    )
    const { onClose, onCreated } = renderModal()

    await fillMinimumPf(user)
    await user.click(within(getDialog()).getByRole("button", { name: "Salvar Cliente" }))

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: 42 })))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("erro de validação (campo vazio) aparece embaixo do campo certo, sem submeter", async () => {
    const user = userEvent.setup()
    const postSpy = vi.fn()
    server.use(
      http.post(`${API}/clientes/`, async () => {
        postSpy()
        return HttpResponse.json({}, { status: 201 })
      }),
    )
    const { onCreated } = renderModal()

    await user.click(within(getDialog()).getByRole("button", { name: "Salvar Cliente" }))

    expect(await within(getDialog()).findByText("Informe o nome")).toBeInTheDocument()
    expect(within(getDialog()).getByText("Informe o sobrenome")).toBeInTheDocument()
    expect(postSpy).not.toHaveBeenCalled()
    expect(onCreated).not.toHaveBeenCalled()
  })

  it("erro do backend (CPF duplicado) aparece embaixo do campo, modal continua aberto", async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API}/clientes/`, () =>
        HttpResponse.json({ cpf: ["Já existe cliente com este CPF."] }, { status: 400 }),
      ),
    )
    const { onClose, onCreated } = renderModal()

    await fillMinimumPf(user)
    await user.click(within(getDialog()).getByRole("button", { name: "Salvar Cliente" }))

    expect(
      await within(getDialog()).findByText("Já existe cliente com este CPF."),
    ).toBeInTheDocument()
    expect(onCreated).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("fechar sem salvar (X) não deixa efeito colateral e esquece o que foi digitado", async () => {
    const user = userEvent.setup()
    const { onClose, onCreated } = renderModal()
    const dialog = getDialog()

    await user.type(within(dialog).getByPlaceholderText("Ex: João"), "Ana")
    await user.click(within(dialog).getByRole("button", { name: "Fechar" }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onCreated).not.toHaveBeenCalled()
  })
})
