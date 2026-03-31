import { api } from "@/api/http"

export async function getLicense() {
  const response = await api.get("/empreendimentos/licencas/");
  return response.data;
}

export async function getLicenseById(id) {
  const response = await api.get(`/empreendimentos/licencas/${id}/`);
  return response.data;
}

export async function getLicenseRenew(businessId, data = {}) {
  const response = await api.patch(`/empreendimentos/licencas/${businessId}/renovar/`, data);
  return response.data;
}

export async function LicenseRemaingDaysView() {
  const response = await api.get(`/empreendimentos/licencas/dias-restantes/`);
  return response.data;
}