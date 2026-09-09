import { z } from "zod"
import { PASSWORD_RULES } from "@/modules/core/utils/password-policy"

// Backend: validate_strong_password (>=8, maiúscula, minúscula, dígito, especial),
// email formato + único no empreendimento, role em superuser/admin/colaborador,
// business_id obrigatório para admin/colaborador.
const passwordRuleFor = (id) => PASSWORD_RULES.find((rule) => rule.id === id)

export const userSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome"),
    email: z.email("E-mail inválido"),
    business_id: z.string().trim().optional().default(""),
    role: z.string().trim().min(1, "Selecione a função"),
    password: z
      .string()
      .min(8, passwordRuleFor("length").label)
      .refine(passwordRuleFor("upper").test, passwordRuleFor("upper").label)
      .refine(passwordRuleFor("lower").test, passwordRuleFor("lower").label)
      .refine(passwordRuleFor("digit").test, passwordRuleFor("digit").label)
      .refine(passwordRuleFor("special").test, passwordRuleFor("special").label),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export const userDefaults = {
  name: "",
  email: "",
  business_id: "",
  role: "",
  password: "",
  confirmPassword: "",
}

export function toUserPayload(values) {
  const payload = { ...values }
  delete payload.confirmPassword
  if (!payload.business_id) delete payload.business_id
  return payload
}

// Edição: senha em branco = mantém a atual (não manda o campo pro back).
// Se a pessoa começar a digitar, vale a mesma política da criação.
export const userEditSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome"),
    email: z.email("E-mail inválido"),
    business_id: z.string().trim().optional().default(""),
    role: z.string().trim().min(1, "Selecione a função"),
    password: z
      .string()
      .optional()
      .default("")
      .superRefine((value, ctx) => {
        if (!value) return
        PASSWORD_RULES.filter((rule) => !rule.test(value)).forEach((rule) => {
          ctx.addIssue({ code: "custom", message: rule.label })
        })
      }),
    confirmPassword: z.string().optional().default(""),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export const userEditDefaults = {
  name: "",
  email: "",
  business_id: "",
  role: "",
  password: "",
  confirmPassword: "",
}

export function toUserEditPayload(values) {
  const payload = { ...values }
  delete payload.confirmPassword
  if (!payload.password) delete payload.password
  if (!payload.business_id) delete payload.business_id
  return payload
}
