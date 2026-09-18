import { api } from "@/api/http"

export const ProductCategoryService = {
  async getProductCategories(params = {}) {
    const response = await api.get("/categorias-produto/", { params })
    return response.data
  },

  async getProductCategory(id) {
    const response = await api.get(`/categorias-produto/${id}/`)
    return response.data
  },

  async createProductCategory(payload) {
    const response = await api.post("/categorias-produto/", payload)
    return response.data
  },

  async updateProductCategory(id, payload) {
    const response = await api.put(`/categorias-produto/${id}/`, payload)
    return response.data
  },

  async deleteProductCategory(id) {
    const response = await api.delete(`/categorias-produto/${id}/`)
    return response.data
  },

  async getSubcategoriesByCategory(id, params = {}) {
    const response = await api.get(`/categorias-produto/${id}/subcategorias/`, { params })
    return response.data
  },
}
