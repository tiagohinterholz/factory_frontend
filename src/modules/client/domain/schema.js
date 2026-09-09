import { z } from "zod"

// O backend valida CPF/telefone COM máscara (apps/core/utils/validators.py).
const CPF_RE = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
const PHONE_RE = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/

const optionalText = z.string().trim().optional().default("")
// ids vêm do <select> (string) ou do form.reset (string, normalizado no loader)
const idField = z.string().trim().min(1, "Obrigatório")

export const clientSchema = z.object({
  business_id: z.string().trim().optional().default(""),
  first_name: z.string().trim().min(1, "Informe o nome"),
  last_name: z.string().trim().min(1, "Informe o sobrenome"),
  cpf: z.string().regex(CPF_RE, "CPF inválido. Formato: 000.000.000-00"),
  state_id: idField,
  city_id: idField,
  address: optionalText,
  number: optionalText,
  complement: optionalText,
  phone: z.string().regex(PHONE_RE, "Telefone inválido. Formato: (00) 00000-0000"),
  email: z
    .union([z.email("E-mail inválido"), z.literal("")])
    .optional()
    .default(""),
})

export const clientDefaults = {
  business_id: "",
  first_name: "",
  last_name: "",
  cpf: "",
  state_id: "",
  city_id: "",
  address: "",
  number: "",
  complement: "",
  phone: "",
  email: "",
}

// form -> payload: manda cpf/telefone COM máscara (é o que o backend valida);
// remove email vazio (o serializer roda validate_email em "" e rejeita).
export function toClientPayload(values) {
  const payload = { ...values }
  if (!payload.email) delete payload.email
  return payload
}
