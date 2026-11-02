import { api } from "@/api/http"

export const FinancialEntryService = {
  async getFinancialEntry(params = {}) {
    const response = await api.get("/financeiro/", { params })
    return response.data
  },

  async getCharts(params = {}) {
    const response = await api.get("/financeiro/graficos/", { params })
    return response.data
  },

  async getFinancialEntryById(id) {
    const response = await api.get(`/financeiro/${id}/`)
    return response.data
  },

  async createFinancialEntry(payload) {
    const response = await api.post("/financeiro/", payload)
    return response.data
  },

  async updateFinancialEntry(id, payload) {
    const response = await api.patch(`/financeiro/${id}/`, payload)
    return response.data
  },

  async markFinancialEntryPaid(id, { paymentDate, paymentMethod, installments } = {}) {
    const response = await api.post(`/financeiro/${id}/pagar/`, {
      ...(paymentDate ? { payment_date: paymentDate } : {}),
      ...(paymentMethod ? { payment_method: paymentMethod } : {}),
      ...(installments ? { installments } : {}),
    })
    return response.data
  },

  async cancelFinancialEntry(id) {
    const response = await api.post(`/financeiro/${id}/cancelar/`)
    return response.data
  },
}
