import { api } from "@/api/http"

export async function getUser() {
  const response = await api.get("/usuarios/");
  return response.data;
}

export async function getUserById(id) {
  const response = await api.get(`/usuarios/${id}/`);
  return response.data;
}

export async function createUser(payload) {
  const response = await api.post("/usuarios/", payload)
  return response.data
}

export async function updateUser(id, payload) {
  const response = await api.patch(`/usuarios/${id}/`, payload)
  return response.data
}

export async function deleteUser(id) {
  const response = await api.delete(`/usuarios/${id}/`);
  return response.data;
}