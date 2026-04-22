import { api } from "@/api/http"


export class OrderService {
  static async getOrder(params = {}) {
    const response = await api.get('/ordens/', { params });
    return response.data;
  }

  static async getOrderById(id) {
    const response = await api.get(`/ordens/${id}/`);
    return response.data;
  }

  static async createOrder(payload) {
    const response = await api.post("/ordens/", payload)
    return response.data
  }

  static async updateOrder(id, payload) {
    const response = await api.patch(`/ordens/${id}/`, payload)
    return response.data
  }

  static async deleteOrder(id) {
    const response = await api.delete(`/ordens/${id}/`);
    return response.data;
  }

  static async invoiceOrder(id) {
    const response = await api.post(`/ordens/${id}/faturar/`);
    return response.data;
  }

  static async orderProduct(id) {
    const response = await api.get(`/ordens/${id}/produtos/`);
    return response.data;
  }

  static async orderProductCreate(id, payload) {
    const response = await api.post(`/ordens/${id}/produtos/`, payload);
    return response.data;
  }

  static async orderProductUpdate(id, payload, itemId) {
    const response = await api.patch(`/ordens/${id}/produtos/${itemId}/`, payload);
    return response.data;
  }

  static async orderProductDelete(id, itemId) {
    const response = await api.delete(`/ordens/${id}/produtos/${itemId}/`);
    return response.data;
  }

  static async orderService(id) {
    const response = await api.get(`/ordens/${id}/servicos/`);
    return response.data;
  }

  static async orderServiceCreate(id, payload) {
    const response = await api.post(`/ordens/${id}/servicos/`, payload);
    return response.data;
  }

  static async orderServiceUpdate(id, payload, itemId) {
    const response = await api.patch(`/ordens/${id}/servicos/${itemId}/`, payload);
    return response.data;
  }

  static async orderServiceDelete(id, itemId) {
    const response = await api.delete(`/ordens/${id}/servicos/${itemId}/`);
    return response.data;
  }
}