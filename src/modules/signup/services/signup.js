import { api } from "@/api/http"

export const SignupService = {
  async create(payload) {
    const response = await api.post("/cadastro-publico/", payload)
    return response.data
  },

  async getStatus(id) {
    const response = await api.get(`/cadastro-publico/${id}/`)
    return response.data
  },

  async activateAccount(uidb64, token, newPassword) {
    const response = await api.post(`/usuarios/ativar-conta/${uidb64}/${token}/`, {
      new_password: newPassword,
    })
    return response.data
  },
}
