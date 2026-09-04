import { api } from "@/api/http"

export const BusinessService = {
  async getBusiness(params = {}) {
    const response = await api.get("/empreendimentos/", { params })
    return response.data
  },

  async getBusinessById(id) {
    const response = await api.get(`/empreendimentos/${id}/`)
    return response.data
  },

  async getBusinessLogo(id) {
    const response = await api.get(`/empreendimentos/${id}/`)
    return response.data.logo
  },

  async createBusiness(payload) {
    const response = await api.post("/empreendimentos/", payload)
    return response.data
  },

  async updateBusiness(id, payload) {
    const response = await api.patch(`/empreendimentos/${id}/`, payload)
    return response.data
  },

  async getUsersByBusiness(id) {
    const response = await api.get(`/empreendimentos/${id}/usuarios/`)
    return response.data
  },

  async getLicenseByBusiness(id) {
    const response = await api.get(`/empreendimentos/${id}/licenca/`)
    return response.data
  },

  async deleteBusiness(id) {
    const response = await api.delete(`/empreendimentos/${id}/`)
    return response.data
  },

  // Horário de funcionamento por dia da semana (0=segunda ... 6=domingo).
  // GET libera pra superuser/admin/colaborador; PATCH só superuser/admin.
  async getBusinessHours(businessId) {
    const response = await api.get(`/empreendimentos/${businessId}/horarios/`)
    return response.data
  },

  async updateBusinessHour(businessId, weekday, payload) {
    const response = await api.patch(`/empreendimentos/${businessId}/horarios/${weekday}/`, payload)
    return response.data
  },
}
