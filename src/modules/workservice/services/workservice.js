import { api } from "@/api/http"

export class WorkService {
  static async getWorkService(params = {}) {
    const response = await api.get('/servicos/', { params });
    return response.data;
  }

  static async getWorkServiceById(id) {
    const response = await api.get(`/servicos/${id}/`);
    return response.data;
  }

  static async createWorkService(payload) {
    const response = await api.post("/servicos/", payload)
    return response.data
  }

  static async updateWorkService(id, payload) {
    const response = await api.patch(`/servicos/${id}/`, payload)
    return response.data
  }

  static async deleteWorkService(id) {
    const response = await api.delete(`/servicos/${id}/`);
    return response.data;
  }
}