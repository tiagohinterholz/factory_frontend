import { api } from "@/api/http"

export class SupplierService {
  static async getSupplier(params = {}) {
    const response = await api.get('/fornecedores/', { params });
    return response.data;
  }

  static async getSupplierById(id) {
    const response = await api.get(`/fornecedores/${id}/`);
    return response.data;
  }

  static async createSupplier(payload) {
    const response = await api.post("/fornecedores/", payload)
    return response.data
  }

  static async updateSupplier(id, payload) {
    const response = await api.patch(`/fornecedores/${id}/`, payload)
    return response.data
  }

  static async deleteSupplier(id) {
    const response = await api.delete(`/fornecedores/${id}/`);
    return response.data;
  }

  static async getProductBySupplier(id) {
    const response = await api.get(`/fornecedores/${id}/produtos/`);
    return response.data;
  }

  static async getServiceBySupplier(id) {
    const response = await api.get(`/fornecedores/${id}/servicos/`);
    return response.data;
  }
}