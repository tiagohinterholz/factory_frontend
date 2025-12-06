import { api } from "@/api/http"

export async function getBusiness() {
  const response = await api.get("/empreendimentos/");
  return response.data;
}

export async function getBusinessById(id) {
  const response = await api.get(`/empreendimentos/${id}/`);
  return response.data;
}

export async function getBusinessLogo(id) {
  const response = await api.get(`/empreendimentos/${id}/`);
  return response.data.logo;
}

export async function createBusiness(payload) {
  const response = await api.post("/empreendimentos/", payload)
  return response.data
}

export async function updateBusiness(id, payload) {
  const response = await api.patch(`/empreendimentos/${id}/`, payload)
  return response.data
}

export async function getUsersByBusiness(id) {
  const response = await api.get(`/empreendimentos/${id}/usuarios/`);
  return response.data;
}

export async function getLicenseByBusiness(id) {
  const response = await api.get(`/empreendimentos/${id}/licenca/`);
  return response.data;
}

export async function deleteBusiness(id) {
  const response = await api.delete(`/empreendimentos/${id}/`);
  return response.data;
}