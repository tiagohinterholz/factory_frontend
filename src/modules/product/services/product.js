import { api } from "@/api/http"

export const ProductService = {
  async getProduct(params = {}) {
    const response = await api.get("/produtos/", { params })
    return response.data
  },

  async getProductById(id) {
    const response = await api.get(`/produtos/${id}/`)
    return response.data
  },

  async createProduct(payload) {
    const response = await api.post("/produtos/", payload)
    return response.data
  },

  async updateProduct(id, payload) {
    const response = await api.patch(`/produtos/${id}/`, payload)
    return response.data
  },

  async deleteProduct(id) {
    const response = await api.delete(`/produtos/${id}/`)
    return response.data
  },

  async getProductPdf(id) {
    const response = await api.get(`/produtos/${id}/pdf/`, { responseType: "blob" })
    return response.data
  },
}
