import { api } from "@/api/http"

export class LicenseService {
  static async getLicense() {
    const response = await api.get("/empreendimentos/licencas/");
    return response.data;
  }

  static async getLicenseById(id) {
    const response = await api.get(`/empreendimentos/licencas/${id}/`);
    return response.data;
  }

  static async getLicenseRenew(businessId, data = {}) {
    const response = await api.patch(`/empreendimentos/licencas/${businessId}/renovar/`, data);
    return response.data;
  }

  static async LicenseRemaingDaysView() {
    const response = await api.get(`/empreendimentos/licencas/dias-restantes/`);
    return response.data;
  }
}