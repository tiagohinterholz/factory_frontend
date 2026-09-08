// Rótulo do card de agendamento — regra única do front (08/09/2026).
//
//   se tem OS e ela já saiu de "em andamento"  -> mostra o status da OS
//   senão, se a data/hora ainda é futura        -> "Aguardando Execução"
//   senão                                       -> "Em Andamento"
//
// "Aguardando" x "Em Andamento" é cálculo local (data vs agora), não vem do
// back. Sem cron: relê na hora de renderizar. `item.order` pode vir como id
// cru, objeto { id, status, ... } ou ausente — só o objeto carrega `status`.

const AWAITING = "Aguardando Execução"
const IN_PROGRESS = "Em Andamento"

export function appointmentStatusLabel(item) {
  const orderStatus = item?.order?.status
  if (orderStatus && orderStatus !== "em andamento") return orderStatus

  const when = new Date(`${item?.date ?? ""}T${item?.time || "00:00:00"}`)
  if (!Number.isNaN(when.getTime()) && when.getTime() > Date.now()) return AWAITING
  return IN_PROGRESS
}

// tom do badge por rótulo. Os status da OS reaproveitam as cores da OS.
export const APPOINTMENT_STATUS_TONE = {
  [AWAITING]: "bg-slate-100 text-slate-600",
  [IN_PROGRESS]: "bg-amber-100 text-amber-700",
  "a faturar": "bg-brand-subtle text-brand",
  faturado: "bg-emerald-100 text-emerald-700",
  cancelado: "bg-rose-100 text-rose-700",
}
