import { api } from "@/api/http"

export const VehicleService = {
  async getVehicle(params = {}) {
    const response = await api.get("/veiculos/", { params })
    return response.data
  },

  async getVehicleById(id) {
    const response = await api.get(`/veiculos/${id}/`)
    return response.data
  },

  async createVehicle(payload) {
    const response = await api.post("/veiculos/", payload)
    return response.data
  },

  async updateVehicle(id, payload) {
    const response = await api.patch(`/veiculos/${id}/`, payload)
    return response.data
  },

  async deleteVehicle(id) {
    const response = await api.delete(`/veiculos/${id}/`)
    return response.data
  },
}
