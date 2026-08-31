import { api } from "@/api/http"

// Exportação de relatórios — assíncrona no backend (Celery):
// POST cria o job (202, status "pending"); GET faz o polling até "done"
// (com `file_url`) ou "failed" (com `error_message`).
// Tipos suportados hoje: "orders", "budgets", "stock".
export const ReportService = {
  async requestExport(type) {
    const { data } = await api.post(`/relatorios/${type}/`)
    return data
  },

  async getStatus(id) {
    const { data } = await api.get(`/relatorios/${id}/`)
    return data
  },
}
