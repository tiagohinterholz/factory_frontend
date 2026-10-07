import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent, waitFor, within } from "@testing-library/react"
import { Routes, Route } from "react-router-dom"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import PurchaseOrderEdit from "./PurchaseOrderEdit"
import { PurchaseOrderService } from "../services/purchase-orders"

const purchaseOrder = {
  id: 1,
  business: { id: 2 },
  supplier: { id: 9, corporate_name: "Bosch Ltda" },
  status: "aberto",
  notes: "",
  total: "0.00",
  items: [],
  received_at: null,
  cancelled_at: null,
}

function mockApi(overrides = {}) {
  server.use(
    http.get(`${API}/compras/1/`, () => HttpResponse.json({ ...purchaseOrder, ...overrides })),
    http.get(`${API}/fornecedores/`, () =>
      HttpResponse.json({ results: [{ id: 9, corporate_name: "Bosch Ltda" }], count: 1 }),
    ),
    http.get(`${API}/produtos/`, () =>
      HttpResponse.json({
        results: [{ id: 3, name: "Filtro de óleo", stock_quantity: 5 }],
        count: 1,
      }),
    ),
  )
}

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/compras" element={<div>Lista de pedidos de compra</div>} />
      <Route path="/compras/:id" element={<PurchaseOrderEdit />} />
    </Routes>,
    { route: "/compras/1" },
  )

describe("<PurchaseOrderEdit> — estado aberto", () => {
  it("mostra o status e o fornecedor já selecionado", async () => {
    mockApi()
    renderPage()

    expect(await screen.findByText("aberto")).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Bosch Ltda", selected: true })).toBeInTheDocument()
  })

  it("adiciona um item e recarrega o pedido com o item novo", async () => {
    mockApi()
    const createItem = vi
      .spyOn(PurchaseOrderService, "purchaseOrderItemCreate")
      .mockResolvedValue({ id: 5 })
    renderPage()

    const costInput = await screen.findByPlaceholderText("Digite o(a) custo unit.")
    const form = costInput.closest("form")
    fireEvent.change(within(form).getByRole("combobox"), { target: { value: "3" } })
    fireEvent.change(costInput, { target: { value: "9.90" } })

    mockApi({
      items: [{ id: 5, product: { name: "Filtro de óleo" }, quantity: 1, total: "9.90" }],
    })
    fireEvent.submit(form)

    await waitFor(() =>
      expect(createItem).toHaveBeenCalledWith("1", {
        product_id: "3",
        quantity: 1,
        unit_cost: "9.90",
      }),
    )
    expect(await screen.findByText("Filtro de óleo (x1)")).toBeInTheDocument()
    createItem.mockRestore()
  })

  it("remove um item pelo botão da linha", async () => {
    mockApi({
      items: [{ id: 5, product: { name: "Filtro de óleo" }, quantity: 1, total: "9.90" }],
    })
    const deleteItem = vi
      .spyOn(PurchaseOrderService, "purchaseOrderItemDelete")
      .mockResolvedValue({})
    renderPage()

    const row = (await screen.findByText("Filtro de óleo (x1)")).closest("div")
    fireEvent.click(within(row).getByRole("button"))

    await waitFor(() => expect(deleteItem).toHaveBeenCalledWith("1", 5))
    deleteItem.mockRestore()
  })

  it("Receber está desabilitado sem itens", async () => {
    mockApi()
    renderPage()

    expect(await screen.findByRole("button", { name: /receber/i })).toBeDisabled()
  })

  it("recebe o pedido após confirmar", async () => {
    mockApi({
      items: [{ id: 5, product: { name: "Filtro de óleo" }, quantity: 1, total: "9.90" }],
    })
    const receive = vi
      .spyOn(PurchaseOrderService, "receivePurchaseOrder")
      .mockResolvedValue({ ...purchaseOrder, status: "recebido" })
    renderPage()

    fireEvent.click(await screen.findByRole("button", { name: /receber/i }))
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar recebimento" }))

    await waitFor(() => expect(receive).toHaveBeenCalledWith("1", {}))
    receive.mockRestore()
  })

  it("salvar alterações volta pra listagem de compras", async () => {
    mockApi()
    vi.spyOn(PurchaseOrderService, "updatePurchaseOrder").mockResolvedValue({
      ...purchaseOrder,
    })
    renderPage()

    await screen.findByText("aberto")
    fireEvent.click(screen.getByRole("button", { name: "Salvar Alterações" }))

    expect(await screen.findByText("Lista de pedidos de compra")).toBeInTheDocument()
  })

  it("cancela o pedido após confirmar", async () => {
    mockApi()
    const cancel = vi
      .spyOn(PurchaseOrderService, "cancelPurchaseOrder")
      .mockResolvedValue({ ...purchaseOrder, status: "cancelado" })
    renderPage()

    fireEvent.click(await screen.findByRole("button", { name: "Cancelar" }))
    fireEvent.click(await screen.findByRole("button", { name: "Sim, cancelar" }))

    await waitFor(() => expect(cancel).toHaveBeenCalledWith("1"))
    cancel.mockRestore()
  })
})

describe("<PurchaseOrderEdit> — travado fora de 'aberto'", () => {
  it("recebido: sem ações de edição, sem botões de Receber/Cancelar", async () => {
    mockApi({ status: "recebido", received_at: "2026-09-10T12:00:00Z" })
    renderPage()

    expect(await screen.findByText(/edição bloqueada/i)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /receber/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Salvar Alterações" })).toBeDisabled()
  })
})
