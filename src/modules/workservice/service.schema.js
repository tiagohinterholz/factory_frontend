import { z } from "zod"

// Backend (Service): name obrigatório, description TextField obrigatório (sem blank),
// unit_price DecimalField, business_id/supplier_id FKs obrigatórios.
export const serviceSchema = z.object({
  business_id: z.string().trim().optional().default(""),
  supplier_id: z.string().trim().min(1, "Selecione o fornecedor"),
  name: z.string().trim().min(1, "Informe o nome"),
  description: z.string().trim().min(1, "Informe a descrição"),
  unit_price: z.coerce.number().min(0, "Preço inválido"),
})

export const serviceDefaults = {
  business_id: "",
  supplier_id: "",
  name: "",
  description: "",
  unit_price: "",
}
