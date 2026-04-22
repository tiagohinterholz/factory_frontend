import { api } from "@/api/http"

export class CityService {
  static async getCities(params = {}) {
    const response = await api.get("/cidades/", { params })
    return response.data
  }

  static async getCity(id) {
    const response = await api.get(`/cidades/${id}/`)
    return response.data
  }

  static async createCity(payload) {
    const response = await api.post("/cidades/", payload)
    return response.data
  }

  static async updateCity(id, payload) {
    const response = await api.put(`/cidades/${id}/`, payload)
    return response.data
  }

  static async deleteCity(id) {
    const response = await api.delete(`/cidades/${id}/`)
    return response.data
  }
}
