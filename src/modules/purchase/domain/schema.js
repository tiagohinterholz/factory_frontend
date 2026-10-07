import { z } from "zod"
import { requiredId, optionalText } from "@/modules/core/schemas/br-fields"

// Backend (PurchaseOrderSerializer): supplier_id obrigatório; status/total/
// datas são geridos por ação (adicionar item, receber, cancelar), nunca
// enviados pelo formulário.
export const purchaseOrderSchema = z.object({
  supplier_id: requiredId("Selecione o fornecedor"),
  notes: optionalText,
})

export const purchaseOrderDefaults = {
  supplier_id: "",
  notes: "",
}

export function toPurchaseOrderPayload(values) {
  return {
    supplier_id: values.supplier_id || null,
    notes: values.notes || null,
  }
}

// item do pedido de compra (PurchaseOrderItemSerializer): product_id,
// quantity, unit_cost — o preço de custo é digitado na hora, não vem do
// cadastro do produto (que guarda o preço de VENDA, um dado diferente).
export const purchaseOrderItemSchema = z.object({
  product_id: requiredId("Selecione o produto"),
  quantity: z.coerce.number().int("Deve ser um inteiro").min(1, "Mínimo de 1 unidade"),
  unit_cost: z.coerce.number().min(0.01, "Informe o custo unitário"),
})

export const purchaseOrderItemDefaults = {
  product_id: "",
  quantity: 1,
  unit_cost: "",
}
