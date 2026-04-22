import { api } from "@/api/http"

export class BudgetService {
  static async getBudget(params = {}) {
    const response = await api.get('/orcamentos/', { params });
    return response.data;
  }

  static async getBudgetById(id) {
    const response = await api.get(`/orcamentos/${id}/`);
    return response.data;
  }

  static async createBudget(payload) {
    const response = await api.post("/orcamentos/", payload)
    return response.data
  }

  static async updateBudget(id, payload) {
    const response = await api.patch(`/orcamentos/${id}/`, payload)
    return response.data
  }

  static async deleteBudget(id) {
    const response = await api.delete(`/orcamentos/${id}/`);
    return response.data;
  }

  static async approveBudget(id) {
    const response = await api.post(`/orcamentos/${id}/approve/`);
    return response.data;
  }

  static async cancelBudget(id) {
    const response = await api.post(`/orcamentos/${id}/cancel/`);
    return response.data;
  }

  static async budgetProduct(id) {
    const response = await api.get(`/orcamentos/${id}/produtos/`);
    return response.data;
  }

  static async budgetProductCreate(id, payload) {
    const response = await api.post(`/orcamentos/${id}/produtos/`, payload);
    return response.data;
  }

  static async budgetProductUpdate(id, payload, itemId) {
    const response = await api.patch(`/orcamentos/${id}/produtos/${itemId}/`, payload);
    return response.data;
  }

  static async budgetProductDelete(id, itemId) {
    const response = await api.delete(`/orcamentos/${id}/produtos/${itemId}/`);
    return response.data;
  }

  static async budgetService(id) {
    const response = await api.get(`/orcamentos/${id}/servicos/`);
    return response.data;
  }

  static async budgetServiceCreate(id, payload) {
    const response = await api.post(`/orcamentos/${id}/servicos/`, payload);
    return response.data;
  }

  static async budgetServiceUpdate(id, payload, itemId) {
    const response = await api.patch(`/orcamentos/${id}/servicos/${itemId}/`, payload);
    return response.data;
  }

  static async budgetServiceDelete(id, itemId) {
    const response = await api.delete(`/orcamentos/${id}/servicos/${itemId}/`);
    return response.data;
  }
}