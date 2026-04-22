import { api } from "@/api/http"


export class BusinessService {
  static async getBusiness(params = {}) {
    const response = await api.get("/empreendimentos/", { params });
    return response.data;
  }

  static async getBusinessById(id) {
    const response = await api.get(`/empreendimentos/${id}/`);
    return response.data;
  }

  static async getBusinessLogo(id) {
    const response = await api.get(`/empreendimentos/${id}/`);
    return response.data.logo;
  }

  static async createBusiness(payload) {
    const response = await api.post("/empreendimentos/", payload)
    return response.data
}

  static async updateBusiness(id, payload) {
    const response = await api.patch(`/empreendimentos/${id}/`, payload)
    return response.data
  }

  static async getUsersByBusiness(id) {
  const response = await api.get(`/empreendimentos/${id}/usuarios/`);
  return response.data;
}

  static async getLicenseByBusiness(id) {
    const response = await api.get(`/empreendimentos/${id}/licenca/`);
    return response.data;
  }

  static async deleteBusiness(id) {
    const response = await api.delete(`/empreendimentos/${id}/`);
    return response.data;
  }
}