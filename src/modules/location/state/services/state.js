import { api } from "@/api/http"

export class StateService {
  static async getStates(params = {}) {
    const response = await api.get("/estados/", { params })
    return response.data
  }

  static async getState(id) {
    const response = await api.get(`/estados/${id}/`)
    return response.data
  }

  static async createState(payload) {
    const response = await api.post("/estados/", payload)
    return response.data
  }

  static async updateState(id, payload) {
    const response = await api.put(`/estados/${id}/`, payload)
    return response.data
  }

  static async deleteState(id) {
    const response = await api.delete(`/estados/${id}/`)
    return response.data
  }

  static async getCitiesByState(id) {
    const response = await api.get(`estados/${id}/cidades/`)
    return response.data
  }
}