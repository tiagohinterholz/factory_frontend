import { api } from "@/api/http"

export class UserService {
  static async getUser(params = {}) {
    const response = await api.get('/usuarios/', { params });
    return response.data;
  }

  static async getUserById(id) {
    const response = await api.get(`/usuarios/${id}/`);
    return response.data;
  }

  static async createUser(payload) {
    const response = await api.post("/usuarios/", payload)
    return response.data
  }

  static async updateUser(id, payload) {
    const response = await api.patch(`/usuarios/${id}/`, payload)
    return response.data
  }

  static async deleteUser(id) {
    const response = await api.delete(`/usuarios/${id}/`);
    return response.data;
  }
}