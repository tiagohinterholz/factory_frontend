import { api } from "@/api/http"

export const LicenseService = {
  // self — negócio do usuário logado (admin/atendente). Sem ID, resolvido
  // pelo token. Superusuário (sem negócio) recebe 400.
  async getMyLicense() {
    const response = await api.get("/configuracoes/licenca/")
    return response.data
  },

  // renovação/upgrade (4.4.2) — só cria a cobrança (Payment), a licença em
  // si só muda quando o pagamento é confirmado (webhook).
  async renewMyLicense(payload) {
    const response = await api.post("/configuracoes/licenca/renovar/", payload)
    return response.data
  },

  // polling da cobrança de renovação até checkout_url/error_message aparecer.
  async getPaymentStatus(paymentId) {
    const response = await api.get(`/financeiro/pagamentos/${paymentId}/`)
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
