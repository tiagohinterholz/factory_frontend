import { api } from "@/api/http"

export async function getBusiness() {
  const response = await api.get("/empreendimentos/");
  return response.data;
}

export async function getBusinessById(id) {
  const response = await api.get(`/empreendimentos/${id}/`);
  return response.data;
}

export async function createBusiness(payload) {
  const response = await api.post("/empreendimentos/", payload)
  return response.data
}