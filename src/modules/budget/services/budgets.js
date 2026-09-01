import { api } from "@/api/http"

export const BudgetService = {
  async getBudget(params = {}) {
    const response = await api.get("/orcamentos/", { params })
    return response.data
  },

  async getBudgetById(id) {
    const response = await api.get(`/orcamentos/${id}/`)
    return response.data
  },

  async createBudget(payload) {
    const response = await api.post("/orcamentos/", payload)
    return response.data
  },

  async updateBudget(id, payload) {
    const response = await api.patch(`/orcamentos/${id}/`, payload)
    return response.data
  },

  async deleteBudget(id) {
    const response = await api.delete(`/orcamentos/${id}/`)
    return response.data
  },

  async approveBudget(id) {
    const response = await api.post(`/orcamentos/${id}/approve/`)
    return response.data
  },

  async cancelBudget(id) {
    const response = await api.post(`/orcamentos/${id}/cancel/`)
    return response.data
  },

  async getBudgetPdf(id) {
    const response = await api.get(`/orcamentos/${id}/pdf/`, { responseType: "blob" })
    return response.data
  },

  async budgetProduct(id) {
    const response = await api.get(`/orcamentos/${id}/produtos/`)
    return response.data
  },

  async budgetProductCreate(id, payload) {
    const response = await api.post(`/orcamentos/${id}/produtos/`, payload)
    return response.data
  },

  async budgetProductUpdate(id, payload, itemId) {
    const response = await api.patch(`/orcamentos/${id}/produtos/${itemId}/`, payload)
    return response.data
  },

  async budgetProductDelete(id, itemId) {
    const response = await api.delete(`/orcamentos/${id}/produtos/${itemId}/`)
    return response.data
  },

  async budgetService(id) {
    const response = await api.get(`/orcamentos/${id}/servicos/`)
    return response.data
  },

  async budgetServiceCreate(id, payload) {
    const response = await api.post(`/orcamentos/${id}/servicos/`, payload)
    return response.data
  },

  async budgetServiceUpdate(id, payload, itemId) {
    const response = await api.patch(`/orcamentos/${id}/servicos/${itemId}/`, payload)
    return response.data
  },

  async budgetServiceDelete(id, itemId) {
    const response = await api.delete(`/orcamentos/${id}/servicos/${itemId}/`)
    return response.data
  },
}
