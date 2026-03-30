import { api } from "@/api/http"

export async function getAppointment() {
  const response = await api.get("/agendamentos/");
  return response.data;
}

export async function getAppointmentById(id) {
  const response = await api.get(`/agendamentos/${id}/`);
  return response.data;
}

export async function createAppointment(payload) {
  const response = await api.post("/agendamentos/", payload)
  return response.data
}

export async function updateAppointment(id, payload) {
  const response = await api.patch(`/agendamentos/${id}/`, payload)
  return response.data
}

export async function deleteAppointment(id) {
  const response = await api.delete(`/agendamentos/${id}/`);
  return response.data;
}