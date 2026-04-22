import { api } from "@/api/http"

export class VehicleService {
  static async getVehicle(params = {}) {
    const response = await api.get('/veiculos/', { params });
    return response.data;
  }

  static async getVehicleById(id) {
    const response = await api.get(`/veiculos/${id}/`);
    return response.data;
  }

  static async createVehicle(payload) {
    const response = await api.post("/veiculos/", payload)
    return response.data
  }

  static async updateVehicle(id, payload) {
    const response = await api.patch(`/veiculos/${id}/`, payload)
    return response.data
  }

  static async deleteVehicle(id) {
    const response = await api.delete(`/veiculos/${id}/`);
    return response.data;
  }
}