import { api } from "@/api/http"

export const FiscalNoteService = {
  async getFiscalNotes(params = {}) {
    const response = await api.get("/notas-fiscais/", { params })
    return response.data
  },
}
