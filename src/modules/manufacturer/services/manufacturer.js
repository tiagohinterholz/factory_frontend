import { api } from "@/api/http"

export const ManufacturerService = {
  async getManufacturers(params = {}) {
    const response = await api.get("/marcas/", { params })
    return response.data
  },

  async getManufacturer(id) {
    const response = await api.get(`/marcas/${id}/`)
    return response.data
  },

  async createManufacturer(payload) {
    const response = await api.post("/marcas/", payload)
    return response.data
  },

  async updateManufacturer(id, payload) {
    const response = await api.put(`/marcas/${id}/`, payload)
    return response.data
  },

  async deleteManufacturer(id) {
    const response = await api.delete(`/marcas/${id}/`)
    return response.data
  },

  // Modelos da marca, paginado — usado no <select> em cascata do veículo e
  // na lista de vinculados de ManufacturerEdit.
  async getModelsByManufacturer(id, params = {}) {
    const response = await api.get(`/marcas/${id}/modelos/`, { params })
    return response.data
  },
}
