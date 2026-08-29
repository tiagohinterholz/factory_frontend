import { api } from "@/api/http"
import { authStorage } from "@/api/auth-storage"

export const AuthService = {
  async login(payload) {
    const response = await api.post("/usuarios/login/", payload)
    return response.data
  },

  // Só a chamada de API. Limpar a sessão é responsabilidade do AuthContext.
  async logout() {
    const refresh = authStorage.getRefresh()
    const access = authStorage.getAccess()

    try {
      await api.post(
        "/usuarios/logout/",
        { refresh },
        { headers: { Authorization: `Bearer ${access}` } }
      )
    } catch (err) {
      alert("Erro no logout:", err)
    }
  },
}
