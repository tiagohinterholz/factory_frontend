import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ModelQuickCreateModal from "./ModelQuickCreateModal"

beforeEach(() => {
  server.use(
    http.get(`${API}/marcas/`, () =>
      HttpResponse.json({ results: [{ id: 1, name: "Toyota" }], count: 1 }),
    ),
  )
})

function renderModal(props = {}) {
  const onClose = vi.fn()
  const onCreated = vi.fn()
  renderWithProviders(
    <ModelQuickCreateModal
      open
      onClose={onClose}
      onCreated={onCreated}
      manufacturerId={1}
      {...props}
    />,
  )
  return { onClose, onCreated }
}

function getDialog() {
  return screen.getByRole("dialog")
}

describe("<ModelQuickCreateModal>", () => {
  it("renderiza Marca pré-preenchida e travada + campo Nome (AC T2)", async () => {
    renderModal()
    const dialog = getDialog()

    await waitFor(() =>
      expect(within(dialog).getByText("Marca").closest("div").querySelector("input")).toHaveValue(
        "Toyota",
      ),
    )
    const marcaInput = within(dialog).getByText("Marca").closest("div").querySelector("input")
    expect(marcaInput).toBeDisabled()

    expect(within(dialog).getByText("Nome")).toBeInTheDocument()
    expect(within(dialog).getByPlaceholderText("Ex: Corolla")).toBeInTheDocument()
  })

  it("submete via VehicleModelService.createVehicleModel com o manufacturer_id travado da prop, chama onCreated e fecha", async () => {
    const user = userEvent.setup()
    let receivedBody
    server.use(
      http.post(`${API}/modelos-veiculo/`, async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json({ id: 77, name: "Corolla", ...receivedBody }, { status: 201 })
      }),
    )
    const { onClose, onCreated } = renderModal()

    await user.type(within(getDialog()).getByPlaceholderText("Ex: Corolla"), "Corolla")
    await user.click(within(getDialog()).getByRole("button", { name: "Salvar Modelo" }))

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: 77 })))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(receivedBody.manufacturer_id).toBe("1")
  })

  it("erro de validação (nome vazio) aparece embaixo do campo, sem submeter", async () => {
    const user = userEvent.setup()
    const postSpy = vi.fn()
    server.use(
      http.post(`${API}/modelos-veiculo/`, async () => {
        postSpy()
        return HttpResponse.json({}, { status: 201 })
      }),
    )
    const { onCreated } = renderModal()

    await user.click(within(getDialog()).getByRole("button", { name: "Salvar Modelo" }))

    expect(await within(getDialog()).findByText("Informe o nome do modelo")).toBeInTheDocument()
    expect(postSpy).not.toHaveBeenCalled()
    expect(onCreated).not.toHaveBeenCalled()
  })

  it("erro do backend (modelo duplicado) aparece embaixo do campo, modal continua aberto", async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API}/modelos-veiculo/`, () =>
        HttpResponse.json(
          { name: ["Já existe modelo com este nome para esta marca."] },
          { status: 400 },
        ),
      ),
    )
    const { onClose, onCreated } = renderModal()

    await user.type(within(getDialog()).getByPlaceholderText("Ex: Corolla"), "Corolla")
    await user.click(within(getDialog()).getByRole("button", { name: "Salvar Modelo" }))

    expect(
      await within(getDialog()).findByText("Já existe modelo com este nome para esta marca."),
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

  describe("defesa sem manufacturerId", () => {
    let warnSpy
    beforeEach(() => {
      warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    })
    afterEach(() => {
      warnSpy.mockRestore()
    })

    it("recusa abrir e loga aviso quando chamado sem manufacturerId, mesmo com open=true", () => {
      renderModal({ manufacturerId: undefined })

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      expect(warnSpy).toHaveBeenCalled()
    })
  })
})
