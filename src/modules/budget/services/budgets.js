import { api } from "@/api/http"

export async function getBudget(params = {}) {
  const response = await api.get('/orcamentos/', { params });
  return response.data;
}

export async function getBudgetById(id) {
  const response = await api.get(`/orcamentos/${id}/`);
  return response.data;
}

export async function createBudget(payload) {
  const response = await api.post("/orcamentos/", payload)
  return response.data
}

export async function updateBudget(id, payload) {
  const response = await api.patch(`/orcamentos/${id}/`, payload)
  return response.data
}

export async function deleteBudget(id) {
  const response = await api.delete(`/orcamentos/${id}/`);
  return response.data;
}

export async function approveBudget(id) {
  const response = await api.post(`/orcamentos/${id}/approve/`);
  return response.data;
}

export async function cancelBudget(id) {
  const response = await api.post(`/orcamentos/${id}/cancel/`);
  return response.data;
}

export async function budgetProduct(id) {
  const response = await api.get(`/orcamentos/${id}/produtos/`);
  return response.data;
}

export async function budgetProductCreate(id, payload) {
  const response = await api.post(`/orcamentos/${id}/produtos/`, payload);
  return response.data;
}

export async function budgetProductUpdate(id, payload, itemId) {
  const response = await api.patch(`/orcamentos/${id}/produtos/${itemId}/`, payload);
  return response.data;
}

export async function budgetProductDelete(id, itemId) {
  const response = await api.delete(`/orcamentos/${id}/produtos/${itemId}/`);
  return response.data;
}

export async function budgetService(id) {
  const response = await api.get(`/orcamentos/${id}/servicos/`);
  return response.data;
}

export async function budgetServiceCreate(id, payload) {
  const response = await api.post(`/orcamentos/${id}/servicos/`, payload);
  return response.data;
}

export async function budgetServiceUpdate(id, payload, itemId) {
  const response = await api.patch(`/orcamentos/${id}/servicos/${itemId}/`, payload);
  return response.data;
}

export async function budgetServiceDelete(id, itemId) {
  const response = await api.delete(`/orcamentos/${id}/servicos/${itemId}/`);
  return response.data;
}