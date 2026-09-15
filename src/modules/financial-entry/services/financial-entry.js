import { api } from "@/api/http"

export const FinancialEntryService = {
  async getFinancialEntry(params = {}) {
    const response = await api.get("/financeiro/", { params })
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

  // paymentDate (ISO "YYYY-MM-DD") opcional — sem ele o back usa a data de hoje.
  async markFinancialEntryPaid(id, paymentDate) {
    const response = await api.post(
      `/financeiro/${id}/pagar/`,
      paymentDate ? { payment_date: paymentDate } : undefined,
    )
    return response.data
  },

  async cancelFinancialEntry(id) {
    const response = await api.post(`/financeiro/${id}/cancelar/`)
    return response.data
  },

  // dispara a criação da cobrança no gateway (async — o back nunca
  // confirma na resposta síncrona, só quando o webhook chegar). Devolve o
  // Payment recém-criado, sempre com status "pendente".
  async generateCharge(id, method) {
    const response = await api.post(`/financeiro/${id}/gerar-cobranca/`, { method })
    return response.data
  },
}
