import { api } from "@/api/http"

// Remove campos vazios — o backend aceita corpo vazio (= sem filtro) e não
// gosta de `status: ""` / `client_id: null` soltos.
function cleanFilters(raw = {}) {
  const out = {}
  if (raw.status) out.status = raw.status
  if (raw.client_id) out.client_id = Number(raw.client_id)
  if (raw.vehicle_id) out.vehicle_id = Number(raw.vehicle_id)
  if (raw.supplier_id) out.supplier_id = Number(raw.supplier_id)
  if (raw.date_from) out.date_from = raw.date_from
  if (raw.date_to) out.date_to = raw.date_to
  return out
}

// Exportação de relatórios — assíncrona no backend (Celery):
// POST cria o job (202, status "pending"); GET faz o polling até "done"
// (com `file_url`, agora .pdf) ou "failed" (com `error_message`).
// Tipos: "orders" e "budgets" aceitam filtros no corpo; "stock" não.
export const ReportService = {
  async requestExport(type, filters) {
    const { data } = await api.post(`/relatorios/${type}/`, cleanFilters(filters))
    return data
  },

  async getStatus(id) {
    const { data } = await api.get(`/relatorios/${id}/`)
    return data
  },
}
