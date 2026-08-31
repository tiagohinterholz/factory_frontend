import { api } from "@/api/http"

export const ClientService = {
  async getClient(params = {}) {
    const response = await api.get("/clientes/", { params })
    return response.data
  },

  async getClientById(id) {
    const response = await api.get(`/clientes/${id}/`)
    return response.data
  },

  async createClient(payload) {
    const response = await api.post("/clientes/", payload)
    return response.data
  },

  async updateClient(id, payload) {
    const response = await api.patch(`/clientes/${id}/`, payload)
    return response.data
  },

  async deleteClient(id) {
    const response = await api.delete(`/clientes/${id}/`)
    return response.data
  },

  async vehicleByClient(id) {
    const response = await api.get(`/clientes/${id}/veiculos/`)
    return response.data
  },
}
