import { api } from "@/api/http"

export const AuthService = {
  async login(payload) {
    const response = await api.post("/usuarios/login/", payload)
    return response.data
  },

  // Só a chamada de API. Limpar a sessão é responsabilidade do AuthContext.
  // O refresh vai no cookie HttpOnly; o backend o lê de lá e o invalida.
  async logout() {
    try {
      await api.post("/usuarios/logout/", {})
    } catch (error) {
      console.error("Erro no logout:", error)
    }
  },

  // Resposta é sempre a mesma ("se o email existir..."), de propósito —
  // não vaza se a conta existe ou não.
  async forgotPassword(email) {
    const response = await api.post("/usuarios/forgot-password/", { email })
    return response.data
  },

  async resetPassword(uidb64, token, newPassword) {
    const response = await api.post(`/usuarios/reset-password/${uidb64}/${token}/`, {
      new_password: newPassword,
    })
    return response.data
  },
}
