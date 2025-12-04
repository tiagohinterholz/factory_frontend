import { api } from "@/api/http"

export async function getCities() {
  const response = await api.get("/cidades/")
  return response.data
}

export async function getCity(id) {
  const response = await api.get(`/cidades/${id}/`)
  return response.data
}

export async function getCitiesByState(id) {
  const response = await api.get(`estados/${id}/cidades/`)
  return response.data
}

export async function createCity(payload) {
  const response = await api.post("/cidades/", payload)
  return response.data
}

export async function updateCity(id, payload) {
  const response = await api.put(`/cidades/${id}/`, payload)
  return response.data
}

export async function deleteCity(id) {
  const response = await api.delete(`/cidades/${id}/`)
  return response.data
}
