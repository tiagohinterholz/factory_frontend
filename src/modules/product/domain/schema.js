import { z } from "zod"

const optionalText = z.string().trim().optional().default("")

// Backend: name obrigatório, unit_price DecimalField, stock_quantity IntegerField >= 0.
export const productSchema = z.object({
  business_id: z.string().trim().optional().default(""),
  supplier_id: z.string().trim().min(1, "Selecione o fornecedor"),
  subcategory_id: z.string().trim().optional().default(""),
  name: z.string().trim().min(1, "Informe o nome"),
  brand: optionalText,
  reference: optionalText,
  description: optionalText,
  stock_quantity: z.coerce.number().int("Deve ser um inteiro").min(0, "Não pode ser negativo"),
  unit_price: z.coerce.number().min(0, "Preço inválido"),
  // nulo/vazio = custo não informado ainda (item 4.1) — mesmo preprocess do
  // minimum_stock abaixo.
  cost_price: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().min(0, "Preço inválido").optional(),
  ),
  unit_of_measure: z.enum(["UN", "LT", "KG", "MT", "CX", "PAR", "CJ"]).default("UN"),
  sku: optionalText,
  ncm: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((value) => value === "" || /^\d{8}$/.test(value), "NCM inválido — 8 dígitos"),
  // nulo/vazio = sem alerta de estoque mínimo configurado (comportamento de
  // hoje) — preprocess trata "" como "sem valor" antes do coerce (que faria
  // Number("") virar 0, um estoque mínimo de verdade, não "sem alerta").
  minimum_stock: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().int("Deve ser um inteiro").min(0, "Não pode ser negativo").optional(),
  ),
})

export const productDefaults = {
  business_id: "",
  supplier_id: "",
  // category_id não existe no back (só subcategory_id) — é só o estado do
  // <select> em cascata no front, descartado no payload.
  category_id: "",
  subcategory_id: "",
  name: "",
  brand: "",
  reference: "",
  description: "",
  stock_quantity: "",
  unit_price: "",
  cost_price: "",
  unit_of_measure: "UN",
  sku: "",
  ncm: "",
  minimum_stock: "",
}

// form -> payload: minimum_stock/cost_price/subcategory_id precisam ir
// explicitamente `null` quando vazios (não só omitidos) pra um PATCH
// parcial conseguir *limpar* o valor — omitir o campo faria o back manter
// o valor antigo. subcategory_id vazio também não pode virar "" (o
// PrimaryKeyRelatedField do back só aceita inteiro ou null).
export function toProductPayload(values) {
  return {
    ...values,
    subcategory_id: values.subcategory_id || null,
    cost_price: values.cost_price ?? null,
    minimum_stock: values.minimum_stock ?? null,
  }
}
