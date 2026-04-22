import { api } from "@/api/http"

export class AppointmentService {
  async getAppointment(params) {
    const response = await api.get("/agendamentos/", { params });
    return response.data;
  }

  async getAppointmentById(id) {
    const response = await api.get(`/agendamentos/${id}/`);
    return response.data;
  }

  async createAppointment(payload) {
    const response = await api.post("/agendamentos/", payload)
    return response.data
  }

  async updateAppointment(id, payload) {
    const response = await api.patch(`/agendamentos/${id}/`, payload)
    return response.data
  }

  async deleteAppointment(id) {
    const response = await api.delete(`/agendamentos/${id}/`);
    return response.data;
  }
}