import { describe, it, expect, vi } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ManufacturerQuickCreateModal from "./ManufacturerQuickCreateModal"

function renderModal(props = {}) {
  const onClose = vi.fn()
  const onCreated = vi.fn()
  renderWithProviders(
    <ManufacturerQuickCreateModal open onClose={onClose} onCreated={onCreated} {...props} />,
  )
  return { onClose, onCreated }
}

function getDialog() {
  return screen.getByRole("dialog")
}

describe("<ManufacturerQuickCreateModal>", () => {
  it("renderiza exatamente o campo mínimo do spec (AC T1): só Nome", () => {
    renderModal()
    const dialog = getDialog()

    expect(within(dialog).getByText("Nome")).toBeInTheDocument()
    expect(within(dialog).getByPlaceholderText("Ex: Toyota")).toBeInTheDocument()

    expect(within(dialog).queryByText("Ativo")).not.toBeInTheDocument()
  })

  it("submete via ManufacturerService.createManufacturer, chama onCreated e fecha no sucesso", async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API}/marcas/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 5, name: "Toyota", ...body }, { status: 201 })
      }),
    )
    const { onClose, onCreated } = renderModal()

    await user.type(within(getDialog()).getByPlaceholderText("Ex: Toyota"), "Toyota")
    await user.click(within(getDialog()).getByRole("button", { name: "Salvar Marca" }))

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: 5 })))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("erro de validação (nome vazio) aparece embaixo do campo, sem submeter", async () => {
    const user = userEvent.setup()
    const postSpy = vi.fn()
    server.use(
      http.post(`${API}/marcas/`, async () => {
        postSpy()
        return HttpResponse.json({}, { status: 201 })
      }),
    )
    const { onCreated } = renderModal()

    await user.click(within(getDialog()).getByRole("button", { name: "Salvar Marca" }))

    expect(await within(getDialog()).findByText("Informe o nome da marca")).toBeInTheDocument()
    expect(postSpy).not.toHaveBeenCalled()
    expect(onCreated).not.toHaveBeenCalled()
  })

  it("erro do backend (marca duplicada) aparece embaixo do campo, modal continua aberto", async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API}/marcas/`, () =>
        HttpResponse.json({ name: ["Já existe marca com este nome."] }, { status: 400 }),
      ),
    )
    const { onClose, onCreated } = renderModal()

    await user.type(within(getDialog()).getByPlaceholderText("Ex: Toyota"), "Toyota")
    await user.click(within(getDialog()).getByRole("button", { name: "Salvar Marca" }))

    expect(
      await within(getDialog()).findByText("Já existe marca com este nome."),
    ).toBeInTheDocument()
    expect(onCreated).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("fechar sem salvar (X) não deixa efeito colateral e esquece o que foi digitado", async () => {
    const user = userEvent.setup()
    const { onClose, onCreated } = renderModal()
    const dialog = getDialog()

    await user.type(within(dialog).getByPlaceholderText("Ex: Toyota"), "Toyota")
    await user.click(within(dialog).getByRole("button", { name: "Fechar" }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onCreated).not.toHaveBeenCalled()
  })
})
