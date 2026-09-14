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

// Edição: sem campo de senha — PATCH /usuarios/<id>/ rejeita "password" no
// payload (400 "Campo inválido"). Trocar senha é só pelo endpoint dedicado
// (changePasswordSchema, abaixo), e só da própria conta.
export const userEditSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome"),
  email: z.email("E-mail inválido"),
  business_id: z.string().trim().optional().default(""),
  role: z.string().trim().min(1, "Selecione a função"),
})

export const userEditDefaults = {
  name: "",
  email: "",
  business_id: "",
  role: "",
}

export function toUserEditPayload(values) {
  const payload = { ...values }
  if (!payload.business_id) delete payload.business_id
  return payload
}

// POST /usuarios/change-password/ — sempre a própria senha (resolvida pelo
// token, sem ID). confirmPassword é só validação do front; o back não tem
// esse campo.
export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Informe a senha atual"),
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

export const changePasswordDefaults = {
  current_password: "",
  password: "",
  confirmPassword: "",
}

export function toChangePasswordPayload(values) {
  return { current_password: values.current_password, new_password: values.password }
}
