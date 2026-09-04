import { api } from "@/api/http"

// Estado é somente-leitura exceto por is_active. Sem POST/DELETE (405 no backend).
// PATCH /estados/<id>/ grava só is_active — name/abbreviation são ignorados.
export const StateService = {
  async getStates(params = {}) {
    const response = await api.get("/estados/", { params })
    return response.data
  },

  async getState(id) {
    const response = await api.get(`/estados/${id}/`)
    return response.data
  },

  async updateState(id, payload) {
    const response = await api.patch(`/estados/${id}/`, payload)
    return response.data
  },

  async getCitiesByState(id, page) {
    const response = await api.get(`estados/${id}/cidades/`, { params: { page } })
    return response.data
  },
}
