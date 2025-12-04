import { api } from "@/api/http"

export async function getStates() {
  const response = await api.get("/estados/")
  return response.data
}

export async function getState(id) {
  const response = await api.get(`/estados/${id}/`)
  return response.data
}

export async function createState(payload) {
  const response = await api.post("/estados/", payload)
  return response.data
}

export async function updateState(id, payload) {
  const response = await api.put(`/estados/${id}/`, payload)
  return response.data
}

export async function deleteState(id) {
  const response = await api.delete(`/estados/${id}/`)
  return response.data
}
