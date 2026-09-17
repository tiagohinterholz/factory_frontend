import { z } from "zod"

const optionalText = z.string().trim().optional().default("")

// Backend: name obrigatório, unit_price DecimalField, stock_quantity IntegerField >= 0.
export const productSchema = z.object({
  business_id: z.string().trim().optional().default(""),
  supplier_id: z.string().trim().min(1, "Selecione o fornecedor"),
  name: z.string().trim().min(1, "Informe o nome"),
  brand: optionalText,
  reference: optionalText,
  description: optionalText,
  stock_quantity: z.coerce.number().int("Deve ser um inteiro").min(0, "Não pode ser negativo"),
  unit_price: z.coerce.number().min(0, "Preço inválido"),
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
  name: "",
  brand: "",
  reference: "",
  description: "",
  stock_quantity: "",
  unit_price: "",
  minimum_stock: "",
}

// form -> payload: minimum_stock precisa ir explicitamente `null` quando
// vazio (não só omitido) pra um PATCH parcial conseguir *limpar* o alerta —
// omitir o campo faria o back manter o valor antigo.
export function toProductPayload(values) {
  return {
    ...values,
    minimum_stock: values.minimum_stock ?? null,
  }
}
