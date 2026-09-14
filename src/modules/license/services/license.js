import { api } from "@/api/http"

export const LicenseService = {
  // self — negócio do usuário logado (admin/colaborador). Sem ID, resolvido
  // pelo token. Superusuário (sem negócio) recebe 400.
  async getMyLicense() {
    const response = await api.get("/configuracoes/licenca/")
    return response.data
  },

  async renewMyLicense(payload) {
    const response = await api.patch("/configuracoes/licenca/renovar/", payload)
    return response.data
  },

  async getMyLicenseRemainingDays() {
    const response = await api.get("/configuracoes/licenca/dias-restantes/")
    return response.data
  },

  // superusuário navegando licenças de outros negócios — só leitura por ora
  // (renovar por ID saiu do contrato, sem endpoint substituto ainda).
  async getLicenses(params = {}) {
    const response = await api.get("/licencas/", { params })
    return response.data
  },

  async getLicenseById(id) {
    const response = await api.get(`/licencas/${id}/`)
    return response.data
  },
}
