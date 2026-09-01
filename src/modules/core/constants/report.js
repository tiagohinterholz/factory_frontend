// Status aceitos por cada tipo de relatório (bate com o backend).
export const REPORT_STATUS_OPTIONS = {
  orders: [
    { id: "a faturar", name: "A faturar" },
    { id: "faturado", name: "Faturado" },
    { id: "cancelado", name: "Cancelado" },
  ],
  budgets: [
    { id: "pendente", name: "Pendente" },
    { id: "aprovado", name: "Aprovado" },
    { id: "expirado", name: "Expirado" },
    { id: "cancelado", name: "Cancelado" },
  ],
}

// Tipos que aceitam filtros no POST /relatorios/{type}/
export const FILTERABLE_REPORTS = ["orders", "budgets"]
