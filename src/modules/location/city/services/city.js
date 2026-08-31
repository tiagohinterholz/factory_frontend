import { api } from "@/api/http"

export const CityService = {
  async getCities(params = {}) {
    const response = await api.get("/cidades/", { params })
    return response.data
  },

  async getCity(id) {
    const response = await api.get(`/cidades/${id}/`)
    return response.data
  },

  async createCity(payload) {
    const response = await api.post("/cidades/", payload)
    return response.data
  },

  async updateCity(id, payload) {
    const response = await api.put(`/cidades/${id}/`, payload)
    return response.data
  },

  async deleteCity(id) {
    const response = await api.delete(`/cidades/${id}/`)
    return response.data
  },
}
