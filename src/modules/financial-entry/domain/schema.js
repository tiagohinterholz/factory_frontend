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

const tagsField = z.array(z.string()).default([])
const optionalId = z.union([z.string(), z.number()]).optional().nullable()

export const financialEntrySchema = z.object({
  entry_type: requiredId("Selecione o tipo"),
  category: requiredId("Selecione a categoria"),
  financial_category_id: requiredId("Selecione a categoria"),
  financial_subcategory_id: optionalId,
  description: optionalText,
  amount: z.coerce.number().positive("Informe um valor maior que zero"),
  due_date: requiredId("Informe o vencimento"),
  tags: tagsField,
})

export const financialEntryDefaults = {
  entry_type: "a_pagar",
  category: "outro",
  financial_category_id: "",
  financial_subcategory_id: "",
  description: "",
  amount: "",
  due_date: "",
  tags: [],
}

export function toFinancialEntryPayload(values) {
  return {
    entry_type: values.entry_type,
    category: values.category,
    financial_category_id: values.financial_category_id || null,
    financial_subcategory_id: values.financial_subcategory_id || null,
    description: values.description || null,
    amount: values.amount,
    due_date: values.due_date,
    tags: values.tags ?? [],
  }
}

// edição: mesmos campos de exibição da criação, mas o payload de fato
// enviado depende de a entrada ser automática ou manual (ver
// financialEntryIsAutomatic em status.js) — automática só aceita due_date,
// o back rejeita qualquer outro campo no payload.
export const financialEntryEditSchema = z.object({
  category: requiredId("Selecione a categoria"),
  financial_category_id: optionalId,
  financial_subcategory_id: optionalId,
  description: optionalText,
  amount: z.coerce.number().positive("Informe um valor maior que zero"),
  due_date: requiredId("Informe o vencimento"),
  tags: tagsField,
})

export function toFinancialEntryUpdatePayload(values, isAutomatic) {
  if (isAutomatic) {
    return { due_date: values.due_date, tags: values.tags ?? [] }
  }
  return {
    description: values.description || null,
    amount: values.amount,
    due_date: values.due_date,
    category: values.category,
    financial_category_id: values.financial_category_id || null,
    financial_subcategory_id: values.financial_subcategory_id || null,
    tags: values.tags ?? [],
  }
}
