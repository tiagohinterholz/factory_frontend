import { api } from "@/api/http"

export const UserService = {
  // Usuários do próprio negócio — sem business_id na URL, resolvido pelo
  // token (igual já era o CustomUserSerializer, só mudou a rota).
  async getUser(params = {}) {
    const response = await api.get("/configuracoes/usuarios/", { params })
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

  // Só a própria senha — PATCH /usuarios/<id>/ agora rejeita "password" no
  // payload (400). Endpoint dedicado, sem ID (resolvido pelo token).
  async changePassword(payload) {
    const response = await api.post("/usuarios/change-password/", payload)
    return response.data
  },
}
