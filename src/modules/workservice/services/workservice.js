import { api } from "@/api/http"

export async function getWorkService(params = {}) {
  const response = await api.get('/servicos/', { params });
  return response.data;
}

export async function getWorkServiceById(id) {
  const response = await api.get(`/servicos/${id}/`);
  return response.data;
}

export async function createWorkService(payload) {
  const response = await api.post("/servicos/", payload)
  return response.data
}

export async function updateWorkService(id, payload) {
  const response = await api.patch(`/servicos/${id}/`, payload)
  return response.data
}

export async function deleteWorkService(id) {
  const response = await api.delete(`/servicos/${id}/`);
  return response.data;
}