import { api } from "@/api/http"

export class ClientService {
  static async getClient(params = {}) {
    const response = await api.get('/clientes/', { params });
    return response.data;
  }

  static async getClientById(id) {
    const response = await api.get(`/clientes/${id}/`);
    return response.data;
  }

  static async createClient(payload) {
    const response = await api.post("/clientes/", payload)
    return response.data
  }

  static async updateClient(id, payload) {
    const response = await api.patch(`/clientes/${id}/`, payload)
    return response.data
  }

  static async deleteClient(id) {
    const response = await api.delete(`/clientes/${id}/`);
    return response.data;
  }

  static async vehicleByClient(id) {
    const response = await api.get(`/clientes/${id}/veiculos/`);
    return response.data;
  }
}