import { api } from "@/api/http"

export const PurchaseOrderService = {
  async getPurchaseOrders(params = {}) {
    const response = await api.get("/compras/", { params })
    return response.data
  },

  async getPurchaseOrderById(id) {
    const response = await api.get(`/compras/${id}/`)
    return response.data
  },

  async createPurchaseOrder(payload) {
    const response = await api.post("/compras/", payload)
    return response.data
  },

  async updatePurchaseOrder(id, payload) {
    const response = await api.patch(`/compras/${id}/`, payload)
    return response.data
  },

  // soma o estoque de cada item e gera a FinancialEntry "a pagar" —
  // irreversível, só funciona enquanto o pedido está "aberto".
  async receivePurchaseOrder(id, payload) {
    const response = await api.post(`/compras/${id}/receber/`, payload)
    return response.data
  },

  async cancelPurchaseOrder(id) {
    const response = await api.post(`/compras/${id}/cancelar/`)
    return response.data
  },

  async purchaseOrderItemCreate(id, payload) {
    const response = await api.post(`/compras/${id}/itens/`, payload)
    return response.data
  },

  async purchaseOrderItemDelete(id, itemId) {
    const response = await api.delete(`/compras/${id}/itens/${itemId}/`)
    return response.data
  },

  // kardex — histórico de movimento de estoque, filtrável por produto.
  async getStockMovements(params = {}) {
    const response = await api.get("/compras/movimentos-estoque/", { params })
    return response.data
  },
}
