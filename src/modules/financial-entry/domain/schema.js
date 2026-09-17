import { z } from "zod"
import { requiredId, optionalText } from "@/modules/core/schemas/br-fields"

// Backend (FinancialEntryWriteSerializer): criação/edição via API é sempre
// manual — "order"/"supplier" nunca aparecem no payload, só o sistema
// preenche isso internamente (hook do invoice_order). category restrita a
// aluguel/folha/outro (FinancialEntry.MANUAL_CATEGORIES no back) — o back
// rejeita qualquer outra, então nem oferecemos aqui.
export const FINANCIAL_ENTRY_TYPE_OPTIONS = [
  { id: "a_pagar", name: "A pagar" },
  { id: "a_receber", name: "A receber" },
]

export const FINANCIAL_ENTRY_CATEGORY_OPTIONS = [
  { id: "aluguel", name: "Aluguel" },
  { id: "folha", name: "Folha de pagamento" },
  { id: "outro", name: "Outro" },
]

export const financialEntrySchema = z.object({
  entry_type: requiredId("Selecione o tipo"),
  category: requiredId("Selecione a categoria"),
  description: optionalText,
  amount: z.coerce.number().positive("Informe um valor maior que zero"),
  due_date: requiredId("Informe o vencimento"),
})

export const financialEntryDefaults = {
  entry_type: "a_pagar",
  category: "aluguel",
  description: "",
  amount: "",
  due_date: "",
}

export function toFinancialEntryPayload(values) {
  return {
    entry_type: values.entry_type,
    category: values.category,
    description: values.description || null,
    amount: values.amount,
    due_date: values.due_date,
  }
}

// edição: mesmos campos de exibição da criação, mas o payload de fato
// enviado depende de a entrada ser automática ou manual (ver
// financialEntryIsAutomatic em status.js) — automática só aceita due_date,
// o back rejeita qualquer outro campo no payload.
export const financialEntryEditSchema = z.object({
  category: requiredId("Selecione a categoria"),
  description: optionalText,
  amount: z.coerce.number().positive("Informe um valor maior que zero"),
  due_date: requiredId("Informe o vencimento"),
})

export function toFinancialEntryUpdatePayload(values, isAutomatic) {
  if (isAutomatic) {
    return { due_date: values.due_date }
  }
  return {
    description: values.description || null,
    amount: values.amount,
    due_date: values.due_date,
    category: values.category,
  }
}
