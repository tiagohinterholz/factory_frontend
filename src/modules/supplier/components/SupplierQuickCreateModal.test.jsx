import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import SupplierQuickCreateModal from "./SupplierQuickCreateModal"

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
  server.use(
    http.get(`${API}/estados/`, () =>
      HttpResponse.json({ results: [{ id: 1, name: "Paraná" }], count: 1 }),
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
    <SupplierQuickCreateModal open onClose={onClose} onCreated={onCreated} {...props} />,
  )
  return { onClose, onCreated }
}

function getDialog() {
  return screen.getByRole("dialog")
}

async function fillMinimum(user) {
  const dialog = getDialog()
  await user.type(
    within(dialog).getByPlaceholderText("Ex: Fornecedora de Insumos LTDA"),
    "Fornecedora Nova LTDA",
  )
  await user.type(within(dialog).getByPlaceholderText("00.000.000/0000-00"), "11222333000181")
  await user.type(within(dialog).getByPlaceholderText("contato@fornecedor.com"), "contato@nova.com")
  await user.type(within(dialog).getByPlaceholderText("(00) 00000-0000"), "11912345678")
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
  await user.type(within(dialog).getByPlaceholderText("Rua, Avenida, etc."), "Rua das Flores")
  await user.type(within(dialog).getByPlaceholderText("123"), "100")
}

describe("<SupplierQuickCreateModal>", () => {
  it("renderiza exatamente os campos obrigatórios do supplierSchema completo (AC T3)", () => {
    renderModal()
    const dialog = getDialog()

    expect(within(dialog).getByText("Razão Social")).toBeInTheDocument()
    expect(
      within(dialog).getByPlaceholderText("Ex: Fornecedora de Insumos LTDA"),
    ).toBeInTheDocument()
    expect(within(dialog).getByPlaceholderText("00.000.000/0000-00")).toBeInTheDocument()
    expect(within(dialog).getByPlaceholderText("contato@fornecedor.com")).toBeInTheDocument()
    expect(within(dialog).getByPlaceholderText("(00) 00000-0000")).toBeInTheDocument()
    expect(within(dialog).getByText("Estado")).toBeInTheDocument()
    expect(within(dialog).getByText("Cidade")).toBeInTheDocument()
    expect(within(dialog).getByPlaceholderText("Rua, Avenida, etc.")).toBeInTheDocument()
    expect(within(dialog).getByPlaceholderText("123")).toBeInTheDocument()

    expect(within(dialog).queryByText("Nome Fantasia")).not.toBeInTheDocument()
    expect(within(dialog).queryByText("Complemento")).not.toBeInTheDocument()
  })

  it("submete via SupplierService.createSupplier, chama onCreated e fecha no sucesso", async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API}/fornecedores/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json(
          { id: 42, corporate_name: "Fornecedora Nova LTDA", ...body },
          { status: 201 },
        )
      }),
    )
    const { onClose, onCreated } = renderModal()

    await fillMinimum(user)
    await user.click(within(getDialog()).getByRole("button", { name: "Salvar Fornecedor" }))

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: 42 })))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("erro de validação (campos vazios) aparece embaixo dos campos certos, sem submeter", async () => {
    const user = userEvent.setup()
    const postSpy = vi.fn()
    server.use(
      http.post(`${API}/fornecedores/`, async () => {
        postSpy()
        return HttpResponse.json({}, { status: 201 })
      }),
    )
    const { onCreated } = renderModal()

    await user.click(within(getDialog()).getByRole("button", { name: "Salvar Fornecedor" }))

    expect(await within(getDialog()).findByText("Informe a razão social")).toBeInTheDocument()
    expect(postSpy).not.toHaveBeenCalled()
    expect(onCreated).not.toHaveBeenCalled()
  })

  it("erro do backend (CNPJ duplicado) aparece embaixo do campo, modal continua aberto", async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API}/fornecedores/`, () =>
        HttpResponse.json({ cnpj: ["Já existe fornecedor com este CNPJ."] }, { status: 400 }),
      ),
    )
    const { onClose, onCreated } = renderModal()

    await fillMinimum(user)
    await user.click(within(getDialog()).getByRole("button", { name: "Salvar Fornecedor" }))

    expect(
      await within(getDialog()).findByText("Já existe fornecedor com este CNPJ."),
    ).toBeInTheDocument()
    expect(onCreated).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("fechar sem salvar (X) não deixa efeito colateral e esquece o que foi digitado", async () => {
    const user = userEvent.setup()
    const { onClose, onCreated } = renderModal()
    const dialog = getDialog()

    await user.type(
      within(dialog).getByPlaceholderText("Ex: Fornecedora de Insumos LTDA"),
      "Fornecedora Nova LTDA",
    )
    await user.click(within(dialog).getByRole("button", { name: "Fechar" }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onCreated).not.toHaveBeenCalled()
  })
})
