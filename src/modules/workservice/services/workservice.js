import { api } from "@/api/http"

export const WorkServiceService = {
  async getWorkService(params = {}) {
    const response = await api.get("/servicos/", { params })
    return response.data
  },

  async getWorkServiceById(id) {
    const response = await api.get(`/servicos/${id}/`)
    return response.data
  },

  async createWorkService(payload) {
    const response = await api.post("/servicos/", payload)
    return response.data
  },

  async updateWorkService(id, payload) {
    const response = await api.patch(`/servicos/${id}/`, payload)
    return response.data
  },

  async deleteWorkService(id) {
    const response = await api.delete(`/servicos/${id}/`)
    return response.data
  },

  async getWorkServicePdf(id) {
    const response = await api.get(`/servicos/${id}/pdf/`, { responseType: "blob" })
    return response.data
  },
}
