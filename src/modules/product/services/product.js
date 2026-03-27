import { api } from "@/api/http"

export async function getProduct() {
  const response = await api.get("/produtos/");
  return response.data;
}

export async function getProductById(id) {
  const response = await api.get(`/produtos/${id}/`);
  return response.data;
}

export async function createProduct(payload) {
  const response = await api.post("/produtos/", payload)
  return response.data
}

export async function updateProduct(id, payload) {
  const response = await api.patch(`/produtos/${id}/`, payload)
  return response.data
}

export async function deleteProduct(id) {
  const response = await api.delete(`/produtos/${id}/`);
  return response.data;
}