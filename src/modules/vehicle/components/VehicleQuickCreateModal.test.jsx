import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import VehicleQuickCreateModal from "./VehicleQuickCreateModal"

const CURRENT_YEAR = String(new Date().getFullYear())

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
  server.use(
    http.get(`${API}/marcas/`, () =>
      HttpResponse.json({ results: [{ id: 1, name: "Volkswagen" }], count: 1 }),
    ),
    http.get(`${API}/marcas/1/modelos/`, () =>
      HttpResponse.json({ results: [{ id: 2, name: "Gol" }], count: 1 }),
    ),
  )
})

function renderModal(props = {}) {
  const onClose = vi.fn()
  const onCreated = vi.fn()
  renderWithProviders(
    <VehicleQuickCreateModal
      open
      onClose={onClose}
      onCreated={onCreated}
      clientId={9}
      {...props}
    />,
  )
  return { onClose, onCreated }
}

function getDialog() {
  return screen.getByRole("dialog")
}

async function fillMinimum(user) {
  const dialog = getDialog()
  await within(dialog).findByRole("option", { name: "Volkswagen" })
  const firstSelects = within(dialog).getAllByRole("combobox")

  // ordem no DOM: Marca, Modelo, Ano de Fabricação, Ano do Modelo, Combustível
  await user.selectOptions(firstSelects[0], "1")
  await within(dialog).findByRole("option", { name: "Gol" })
  await waitFor(() => expect(within(dialog).getAllByRole("combobox")[1]).not.toBeDisabled())

  const selects = within(dialog).getAllByRole("combobox")
  await user.selectOptions(selects[1], "2")
  await user.selectOptions(selects[2], CURRENT_YEAR)
  await user.selectOptions(selects[3], CURRENT_YEAR)
  await user.selectOptions(selects[4], "gasolina")
  await user.type(within(dialog).getByPlaceholderText("ABC-1234"), "ABC-1234")
}

describe("<VehicleQuickCreateModal>", () => {
  it("renderiza exatamente os campos mínimos do spec (AC8): marca, modelo, ano, ano modelo, placa, combustível", () => {
    renderModal()
    const dialog = getDialog()

    expect(within(dialog).getByText("Marca")).toBeInTheDocument()
    expect(within(dialog).getByText("Modelo")).toBeInTheDocument()
    expect(within(dialog).getByText("Ano de Fabricação")).toBeInTheDocument()
    expect(within(dialog).getByText("Ano do Modelo")).toBeInTheDocument()
    expect(within(dialog).getByPlaceholderText("ABC-1234")).toBeInTheDocument()
    expect(within(dialog).getByText("Combustível")).toBeInTheDocument()

    // client_id vem pré-preenchido via prop — não é um campo editável aqui
    expect(within(dialog).queryByText("Cliente")).not.toBeInTheDocument()
    expect(within(dialog).queryByText("Cliente Proprietário")).not.toBeInTheDocument()
    // nada a mais do que o mínimo do spec
    expect(within(dialog).queryByText("Cor")).not.toBeInTheDocument()
    expect(within(dialog).queryByText("Quilometragem")).not.toBeInTheDocument()
  })

  it("submete via VehicleService.createVehicle com o client_id travado da prop, chama onCreated e fecha", async () => {
    const user = userEvent.setup()
    let receivedBody
    server.use(
      http.post(`${API}/veiculos/`, async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json({ id: 77, plate: "ABC1234", ...receivedBody }, { status: 201 })
      }),
    )
    const { onClose, onCreated } = renderModal()

    await fillMinimum(user)
    await userEvent.click(within(getDialog()).getByRole("button", { name: "Salvar Veículo" }))

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: 77 })))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(receivedBody.client_id).toBe("9")
  })

  it("erro de validação (nenhum campo preenchido) aparece embaixo do campo certo, sem submeter", async () => {
    const user = userEvent.setup()
    const postSpy = vi.fn()
    server.use(
      http.post(`${API}/veiculos/`, async () => {
        postSpy()
        return HttpResponse.json({}, { status: 201 })
      }),
    )
    const { onCreated } = renderModal()

    await user.click(within(getDialog()).getByRole("button", { name: "Salvar Veículo" }))

    expect(await within(getDialog()).findByText("Selecione a marca")).toBeInTheDocument()
    expect(postSpy).not.toHaveBeenCalled()
    expect(onCreated).not.toHaveBeenCalled()
  })

  it("erro do backend (placa duplicada) aparece embaixo do campo, modal continua aberto", async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API}/veiculos/`, () =>
        HttpResponse.json({ plate: ["Já existe veículo com esta placa."] }, { status: 400 }),
      ),
    )
    const { onClose, onCreated } = renderModal()

    await fillMinimum(user)
    await user.click(within(getDialog()).getByRole("button", { name: "Salvar Veículo" }))

    expect(
      await within(getDialog()).findByText("Já existe veículo com esta placa."),
    ).toBeInTheDocument()
    expect(onCreated).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("fechar sem salvar (X) não deixa efeito colateral", async () => {
    const user = userEvent.setup()
    const { onClose, onCreated } = renderModal()

    await user.click(within(getDialog()).getByRole("button", { name: "Fechar" }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onCreated).not.toHaveBeenCalled()
  })

  describe("defesa sem clientId", () => {
    let warnSpy
    beforeEach(() => {
      warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    })
    afterEach(() => {
      warnSpy.mockRestore()
    })

    it("recusa abrir e loga aviso quando chamado sem clientId, mesmo com open=true", () => {
      renderModal({ clientId: undefined })

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      expect(warnSpy).toHaveBeenCalled()
    })
  })
})
