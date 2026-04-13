import { api } from "@/api/http"

export async function getOrder(params = {}) {
  const response = await api.get('/ordens/', { params });
  return response.data;
}

export async function getOrderById(id) {
  const response = await api.get(`/ordens/${id}/`);
  return response.data;
}

export async function createOrder(payload) {
  const response = await api.post("/ordens/", payload)
  return response.data
}

export async function updateOrder(id, payload) {
  const response = await api.patch(`/ordens/${id}/`, payload)
  return response.data
}

export async function deleteOrder(id) {
  const response = await api.delete(`/ordens/${id}/`);
  return response.data;
}

export async function invoiceOrder(id) {
  const response = await api.post(`/ordens/${id}/faturar/`);
  return response.data;
}

export async function orderProduct(id) {
  const response = await api.get(`/ordens/${id}/produtos/`);
  return response.data;
}

export async function orderProductCreate(id, payload) {
  const response = await api.post(`/ordens/${id}/produtos/`, payload);
  return response.data;
}

export async function orderProductUpdate(id, payload, itemId) {
  const response = await api.patch(`/ordens/${id}/produtos/${itemId}/`, payload);
  return response.data;
}

export async function orderProductDelete(id, itemId) {
  const response = await api.delete(`/ordens/${id}/produtos/${itemId}/`);
  return response.data;
}

export async function orderService(id) {
  const response = await api.get(`/ordens/${id}/servicos/`);
  return response.data;
}

export async function orderServiceCreate(id, payload) {
  const response = await api.post(`/ordens/${id}/servicos/`, payload);
  return response.data;
}

export async function orderServiceUpdate(id, payload, itemId) {
  const response = await api.patch(`/ordens/${id}/servicos/${itemId}/`, payload);
  return response.data;
}

export async function orderServiceDelete(id, itemId) {
  const response = await api.delete(`/ordens/${id}/servicos/${itemId}/`);
  return response.data;
}