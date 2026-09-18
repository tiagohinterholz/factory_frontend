import { z } from "zod"
import { CNPJ_RE, optionalText } from "@/modules/core/schemas/br-fields"

// O backend valida CPF/telefone COM máscara (apps/core/utils/validators.py).
const CPF_RE = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
const PHONE_RE = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/

// ids vêm do <select> (string) ou do form.reset (string, normalizado no loader)
const idField = z.string().trim().min(1, "Obrigatório")

// PF exige cpf/first_name/last_name; PJ exige cnpj/corporate_name — os dois
// lados ficam opcionais no shape base e a obrigatoriedade condicional entra
// no superRefine, espelhando a validação do back (client_serializer.py).
export const clientSchema = z
  .object({
    business_id: z.string().trim().optional().default(""),
    client_type: z.enum(["PF", "PJ"]).default("PF"),
    first_name: optionalText,
    last_name: optionalText,
    cpf: optionalText,
    cnpj: optionalText,
    corporate_name: optionalText,
    trade_name: optionalText,
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
  .superRefine((data, ctx) => {
    if (data.client_type === "PJ") {
      if (!CNPJ_RE.test(data.cnpj)) {
        ctx.addIssue({
          code: "custom",
          path: ["cnpj"],
          message: "CNPJ inválido. Formato: 00.000.000/0000-00",
        })
      }
      if (!data.corporate_name.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["corporate_name"],
          message: "Informe a razão social",
        })
      }
    } else {
      if (!CPF_RE.test(data.cpf)) {
        ctx.addIssue({
          code: "custom",
          path: ["cpf"],
          message: "CPF inválido. Formato: 000.000.000-00",
        })
      }
      if (!data.first_name.trim()) {
        ctx.addIssue({ code: "custom", path: ["first_name"], message: "Informe o nome" })
      }
      if (!data.last_name.trim()) {
        ctx.addIssue({ code: "custom", path: ["last_name"], message: "Informe o sobrenome" })
      }
    }
  })

export const clientDefaults = {
  business_id: "",
  client_type: "PF",
  first_name: "",
  last_name: "",
  cpf: "",
  cnpj: "",
  corporate_name: "",
  trade_name: "",
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
