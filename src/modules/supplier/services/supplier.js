import { api } from "@/api/http"

export const SupplierService = {
  async getSupplier(params = {}) {
    const response = await api.get("/fornecedores/", { params })
    return response.data
  },

  async getSupplierById(id) {
    const response = await api.get(`/fornecedores/${id}/`)
    return response.data
  },

  async createSupplier(payload) {
    const response = await api.post("/fornecedores/", payload)
    return response.data
  },

  async updateSupplier(id, payload) {
    const response = await api.patch(`/fornecedores/${id}/`, payload)
    return response.data
  },

  async deleteSupplier(id) {
    const response = await api.delete(`/fornecedores/${id}/`)
    return response.data
  },

  async getProductBySupplier(id) {
    const response = await api.get(`/fornecedores/${id}/produtos/`)
    return response.data
  },

  async getServiceBySupplier(id) {
    const response = await api.get(`/fornecedores/${id}/servicos/`)
    return response.data
  },

  // PDFs prontos (application/pdf direto), mesmo padrão de ordens/orçamentos.
  async getSupplierProductsPdf(id) {
    const response = await api.get(`/fornecedores/${id}/produtos/pdf/`, { responseType: "blob" })
    return response.data
  },

  async getSupplierServicesPdf(id) {
    const response = await api.get(`/fornecedores/${id}/servicos/pdf/`, { responseType: "blob" })
    return response.data
  },
}
