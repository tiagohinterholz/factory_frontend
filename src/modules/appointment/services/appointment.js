import { api } from "@/api/http"

export class AppointmentService {
  static async getAppointment(params) {
    const response = await api.get("/agendamentos/", { params })
    return response.data
  }

  static async getAppointmentById(id) {
    const response = await api.get(`/agendamentos/${id}/`)
    return response.data
  }

  static async createAppointment(payload) {
    const response = await api.post("/agendamentos/", payload)
    return response.data
  }

  static async updateAppointment(id, payload) {
    const response = await api.patch(`/agendamentos/${id}/`, payload)
    return response.data
  }

  static async deleteAppointment(id) {
    const response = await api.delete(`/agendamentos/${id}/`)
    return response.data
  }
}
