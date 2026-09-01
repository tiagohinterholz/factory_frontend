import { api } from "@/api/http"

export const OrderService = {
  async getOrder(params = {}) {
    const response = await api.get("/ordens/", { params })
    return response.data
  },

  async getOrderById(id) {
    const response = await api.get(`/ordens/${id}/`)
    return response.data
  },

  async createOrder(payload) {
    const response = await api.post("/ordens/", payload)
    return response.data
  },

  async updateOrder(id, payload) {
    const response = await api.patch(`/ordens/${id}/`, payload)
    return response.data
  },

  async deleteOrder(id) {
    const response = await api.delete(`/ordens/${id}/`)
    return response.data
  },

  async invoiceOrder(id) {
    const response = await api.post(`/ordens/${id}/faturar/`)
    return response.data
  },

  async getOrderPdf(id) {
    const response = await api.get(`/ordens/${id}/pdf/`, { responseType: "blob" })
    return response.data
  },

  async orderProduct(id) {
    const response = await api.get(`/ordens/${id}/produtos/`)
    return response.data
  },

  async orderProductCreate(id, payload) {
    const response = await api.post(`/ordens/${id}/produtos/`, payload)
    return response.data
  },

  async orderProductUpdate(id, payload, itemId) {
    const response = await api.patch(`/ordens/${id}/produtos/${itemId}/`, payload)
    return response.data
  },

  async orderProductDelete(id, itemId) {
    const response = await api.delete(`/ordens/${id}/produtos/${itemId}/`)
    return response.data
  },

  async orderService(id) {
    const response = await api.get(`/ordens/${id}/servicos/`)
    return response.data
  },

  async orderServiceCreate(id, payload) {
    const response = await api.post(`/ordens/${id}/servicos/`, payload)
    return response.data
  },

  async orderServiceUpdate(id, payload, itemId) {
    const response = await api.patch(`/ordens/${id}/servicos/${itemId}/`, payload)
    return response.data
  },

  async orderServiceDelete(id, itemId) {
    const response = await api.delete(`/ordens/${id}/servicos/${itemId}/`)
    return response.data
  },
}
