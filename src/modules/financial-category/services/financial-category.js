import { api } from "@/api/http"

export const FinancialCategoryService = {
  async getCategories(params = {}) {
    const response = await api.get("/categorias-financeiro/", { params })
    return response.data
  },

  async getCategory(id) {
    const response = await api.get(`/categorias-financeiro/${id}/`)
    return response.data
  },

  async createCategory(payload) {
    const response = await api.post("/categorias-financeiro/", payload)
    return response.data
  },

  async updateCategory(id, payload) {
    const response = await api.put(`/categorias-financeiro/${id}/`, payload)
    return response.data
  },

  async deleteCategory(id) {
    const response = await api.delete(`/categorias-financeiro/${id}/`)
    return response.data
  },

  async getSubcategoriesByCategory(id, params = {}) {
    const response = await api.get(`/categorias-financeiro/${id}/subcategorias/`, { params })
    return response.data
  },

  async createSubcategory(payload) {
    const response = await api.post("/subcategorias-financeiro/", payload)
    return response.data
  },

  async deleteSubcategory(id) {
    const response = await api.delete(`/subcategorias-financeiro/${id}/`)
    return response.data
  },

  async getTags(params = {}) {
    const response = await api.get("/financeiro/tags/", { params })
    return response.data
  },

  async createTag(payload) {
    const response = await api.post("/financeiro/tags/", payload)
    return response.data
  },

  async updateTag(id, payload) {
    const response = await api.put(`/financeiro/tags/${id}/`, payload)
    return response.data
  },

  async deleteTag(id) {
    const response = await api.delete(`/financeiro/tags/${id}/`)
    return response.data
  },
}
