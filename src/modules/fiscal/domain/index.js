export const fiscalNoteKeys = {
  all: ["fiscal-notes"],
  lists: () => [...fiscalNoteKeys.all, "list"],
  list: (params) => [...fiscalNoteKeys.lists(), params],
}

export const FISCAL_KIND_OPTIONS = [
  { id: "produto", name: "NF-e (produto)" },
  { id: "servico", name: "NFS-e (serviço)" },
]

export const FISCAL_STATUS_OPTIONS = [
  { id: "issued", name: "Emitida" },
  { id: "processing", name: "Processando" },
  { id: "pending", name: "Pendente" },
  { id: "failed", name: "Falhou" },
  { id: "cancelled", name: "Cancelada" },
]

const STATUS_TONE = {
  issued: "bg-emerald-100 text-emerald-700",
  processing: "bg-sky-100 text-sky-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-100 text-slate-600",
}

export const fiscalNoteStatusTone = (status) => STATUS_TONE[status] ?? "bg-slate-100 text-slate-600"
