import { api } from "@/api/http"

export async function getVehicle() {
  const response = await api.get("/veiculos/");
  return response.data;
}

export async function getVehicleById(id) {
  const response = await api.get(`/veiculos/${id}/`);
  return response.data;
}

export async function createVehicle(payload) {
  const response = await api.post("/veiculos/", payload)
  return response.data
}

export async function updateVehicle(id, payload) {
  const response = await api.patch(`/veiculos/${id}/`, payload)
  return response.data
}

export async function deleteVehicle(id) {
  const response = await api.delete(`/veiculos/${id}/`);
  return response.data;
}