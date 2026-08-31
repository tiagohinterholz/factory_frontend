import { api } from "@/api/http"

export const LicenseService = {
  async getLicense() {
    const response = await api.get("/empreendimentos/licencas/")
    return response.data
  },

  async getLicenseById(id) {
    const response = await api.get(`/empreendimentos/licencas/${id}/`)
    return response.data
  },

  async getLicenseRenew(businessId, data = {}) {
    const response = await api.patch(`/empreendimentos/licencas/${businessId}/renovar/`, data)
    return response.data
  },

  async LicenseRemaingDaysView() {
    const response = await api.get(`/empreendimentos/licencas/dias-restantes/`)
    return response.data
  },
}
