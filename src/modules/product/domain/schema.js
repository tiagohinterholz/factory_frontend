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
}
