import { api } from "@/api/http"

export async function getOrder() {
  const response = await api.get("/ordens/");
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