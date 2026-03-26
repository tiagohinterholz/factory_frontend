import { api } from "@/api/http"

export async function getClient() {
  const response = await api.get("/clientes/");
  return response.data;
}

export async function getClientById(id) {
  const response = await api.get(`/clientes/${id}/`);
  return response.data;
}

export async function createClient(payload) {
  const response = await api.post("/clientes/", payload)
  return response.data
}

export async function updateClient(id, payload) {
  const response = await api.patch(`/clientes/${id}/`, payload)
  return response.data
}

export async function deleteClient(id) {
  const response = await api.delete(`/clientes/${id}/`);
  return response.data;
}

export async function vehicleByClient(id) {
  const response = await api.get(`/clientes/${id}/veiculos/`);
  return response.data;
}