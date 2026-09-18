import { api } from "@/api/http"

export const ProductSubcategoryService = {
  async getProductSubcategories(params = {}) {
    const response = await api.get("/subcategorias-produto/", { params })
    return response.data
  },

  async getProductSubcategory(id) {
    const response = await api.get(`/subcategorias-produto/${id}/`)
    return response.data
  },

  async createProductSubcategory(payload) {
    const response = await api.post("/subcategorias-produto/", payload)
    return response.data
  },

  async updateProductSubcategory(id, payload) {
    const response = await api.put(`/subcategorias-produto/${id}/`, payload)
    return response.data
  },

  async deleteProductSubcategory(id) {
    const response = await api.delete(`/subcategorias-produto/${id}/`)
    return response.data
  },
}
