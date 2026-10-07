import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import PurchaseOrderList from "./PurchaseOrderList"
import { PurchaseOrderService } from "../services/purchase-orders"

let lastPurchaseOrdersUrl

function mockPurchaseOrders(results) {
  server.use(
    http.get(`${API}/compras/`, ({ request }) => {
      lastPurchaseOrdersUrl = new URL(request.url)
      return HttpResponse.json({
        results: results ?? [
          {
            id: 7,
            supplier: { id: 9, corporate_name: "Bosch Ltda" },
            status: "aberto",
            total: "300.00",
            created_at: "2026-09-10T12:00:00Z",
          },
        ],
        count: (results ?? [1]).length,
      })
    }),
    http.get(`${API}/fornecedores/`, () =>
      HttpResponse.json({ results: [{ id: 9, corporate_name: "Bosch Ltda" }], count: 1 }),
    ),
  )
}

describe("<PurchaseOrderList>", () => {
  it("renderiza a tabela com os dados da API", async () => {
    mockPurchaseOrders()
    renderWithProviders(<PurchaseOrderList />)

    expect(await screen.findByText("#7")).toBeInTheDocument()
    expect(screen.getByText("aberto")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Bosch Ltda" })).toHaveAttribute(
      "href",
      "/fornecedores/9",
    )
  })

  it("receber/cancelar só aparecem na linha de pedido aberto", async () => {
    mockPurchaseOrders([
      {
        id: 1,
        supplier: null,
        status: "aberto",
        total: "0",
        items: [{ id: 1 }],
        created_at: "2026-09-10T12:00:00Z",
      },
      {
        id: 2,
        supplier: null,
        status: "recebido",
        total: "0",
        items: [{ id: 2 }],
        created_at: "2026-09-10T12:00:00Z",
      },
    ])
    renderWithProviders(<PurchaseOrderList />)
    await screen.findByText("#1")

    expect(screen.getAllByRole("button", { name: "Receber pedido de compra" })).toHaveLength(1)
    expect(screen.getAllByRole("button", { name: "Cancelar pedido de compra" })).toHaveLength(1)
  })

  it("Receber vem desabilitado quando o pedido não tem item", async () => {
    mockPurchaseOrders([
      { id: 1, supplier: null, status: "aberto", total: "0", created_at: "2026-09-10T12:00:00Z" },
    ])
    renderWithProviders(<PurchaseOrderList />)
    await screen.findByText("#1")

    expect(
      screen.getByRole("button", { name: "Adicione ao menos um item primeiro" }),
    ).toBeDisabled()
  })

  it("recebe pelo botão da linha após confirmar", async () => {
    mockPurchaseOrders([
      {
        id: 1,
        supplier: null,
        status: "aberto",
        total: "0",
        items: [{ id: 1 }],
        created_at: "2026-09-10T12:00:00Z",
      },
    ])
    const receive = vi
      .spyOn(PurchaseOrderService, "receivePurchaseOrder")
      .mockResolvedValue({ id: 1, status: "recebido" })

    renderWithProviders(<PurchaseOrderList />)
    await screen.findByText("#1")

    fireEvent.click(screen.getByRole("button", { name: "Receber pedido de compra" }))
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar recebimento" }))

    await waitFor(() => expect(receive).toHaveBeenCalledWith(1, {}))
    receive.mockRestore()
  })

  it("cancela pelo botão da linha após confirmar", async () => {
    mockPurchaseOrders([
      { id: 1, supplier: null, status: "aberto", total: "0", created_at: "2026-09-10T12:00:00Z" },
    ])
    const cancel = vi
      .spyOn(PurchaseOrderService, "cancelPurchaseOrder")
      .mockResolvedValue({ id: 1, status: "cancelado" })

    renderWithProviders(<PurchaseOrderList />)
    await screen.findByText("#1")

    fireEvent.click(screen.getByRole("button", { name: "Cancelar pedido de compra" }))
    fireEvent.click(await screen.findByRole("button", { name: "Sim, cancelar" }))

    await waitFor(() => expect(cancel).toHaveBeenCalledWith(1))
    cancel.mockRestore()
  })

  it("aplica o filtro de status: 'Filtros' > status > 'Filtrar' manda ?status=", async () => {
    mockPurchaseOrders()
    renderWithProviders(<PurchaseOrderList />)
    await screen.findByText("#7")

    fireEvent.click(screen.getByRole("button", { name: /filtros/i }))
    fireEvent.click(await screen.findByRole("button", { name: /selecione o\(a\) status/i }))
    fireEvent.click(await screen.findByRole("option", { name: "Recebido" }))
    fireEvent.click(screen.getByRole("button", { name: "Filtrar" }))

    await waitFor(() => expect(lastPurchaseOrdersUrl.searchParams.get("status")).toBe("recebido"))
  })
})
