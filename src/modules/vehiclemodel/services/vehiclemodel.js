import { api } from "@/api/http"

export const VehicleModelService = {
  async getVehicleModels(params = {}) {
    const response = await api.get("/modelos-veiculo/", { params })
    return response.data
  },

  async getVehicleModel(id) {
    const response = await api.get(`/modelos-veiculo/${id}/`)
    return response.data
  },

  async createVehicleModel(payload) {
    const response = await api.post("/modelos-veiculo/", payload)
    return response.data
  },

  async updateVehicleModel(id, payload) {
    const response = await api.put(`/modelos-veiculo/${id}/`, payload)
    return response.data
  },

  async deleteVehicleModel(id) {
    const response = await api.delete(`/modelos-veiculo/${id}/`)
    return response.data
  },
}
