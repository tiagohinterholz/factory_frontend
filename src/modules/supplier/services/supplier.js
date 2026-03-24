import { api } from "@/api/http"

export async function getSupplier() {
  const response = await api.get("/fornecedores/");
  return response.data;
}

export async function getSupplierById(id) {
  const response = await api.get(`/fornecedores/${id}/`);
  return response.data;
}

export async function createSupplier(payload) {
  const response = await api.post("/fornecedores/", payload)
  return response.data
}

export async function updateSupplier(id, payload) {
  const response = await api.patch(`/fornecedores/${id}/`, payload)
  return response.data
}

export async function deleteSupplier(id) {
  const response = await api.delete(`/fornecedores/${id}/`);
  return response.data;
}

export async function GetProductBySupplier(id) {
  const response = await api.delete(`/fornecedores/${id}/produtos`);
  return response.data;
}

export async function GetServiceBySupplier(id) {
  const response = await api.delete(`/fornecedores/${id}/servicos`);
  return response.data;
}