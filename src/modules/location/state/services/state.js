import { api } from "@/api/http"

export const StateService = {
  async getStates(params = {}) {
    const response = await api.get("/estados/", { params })
    return response.data
  },

  async getState(id) {
    const response = await api.get(`/estados/${id}/`)
    return response.data
  },

  async createState(payload) {
    const response = await api.post("/estados/", payload)
    return response.data
  },

  async updateState(id, payload) {
    const response = await api.put(`/estados/${id}/`, payload)
    return response.data
  },

  async deleteState(id) {
    const response = await api.delete(`/estados/${id}/`)
    return response.data
  },

  async getCitiesByState(id, page) {
    const response = await api.get(`estados/${id}/cidades/`, { params: { page } })
    return response.data
  },
}
