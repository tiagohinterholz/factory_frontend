import { api } from "@/api/http"

export const UserService = {
  async getUser(params = {}) {
    const response = await api.get("/usuarios/", { params })
    return response.data
  },

  async getUserById(id) {
    const response = await api.get(`/usuarios/${id}/`)
    return response.data
  },

  async createUser(payload) {
    const response = await api.post("/usuarios/", payload)
    return response.data
  },

  async updateUser(id, payload) {
    const response = await api.patch(`/usuarios/${id}/`, payload)
    return response.data
  },

  async deleteUser(id) {
    const response = await api.delete(`/usuarios/${id}/`)
    return response.data
  },
}
