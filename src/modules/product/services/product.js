import { api } from "@/api/http"


export class ProductService {
  static async getProduct(params = {}) {
    const response = await api.get('/produtos/', { params });
    return response.data;
  }

  static async getProductById(id) {
    const response = await api.get(`/produtos/${id}/`);
    return response.data;
  }

  static async createProduct(payload) {
    const response = await api.post("/produtos/", payload)
    return response.data
  }

  static async updateProduct(id, payload) {
    const response = await api.patch(`/produtos/${id}/`, payload)
    return response.data
  }

  static async deleteProduct(id) {
    const response = await api.delete(`/produtos/${id}/`);
    return response.data;
  }
}