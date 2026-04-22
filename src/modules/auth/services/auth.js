import { api } from "@/api/http"

export class AuthService {
  async login(payload) {
    const response = await api.post("/usuarios/login/", payload);
    return response.data;
  }

  async logout() {
    const refresh = localStorage.getItem('refresh')
    const access = localStorage.getItem('access')

    try {
        await api.post(
            '/usuarios/logout/',
            { refresh },
            { headers: { Authorization: `Bearer ${access}` }}
        )
    } catch (err) {
        alert("Erro no logout:", err);
  }
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
  }
}