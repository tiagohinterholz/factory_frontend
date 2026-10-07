import { z } from "zod"
import {
  passwordFields,
  passwordFieldsDefaults,
  passwordsMatch,
  PASSWORD_MISMATCH_ISSUE,
} from "@/modules/core/schemas/password"

// Backend: validate_strong_password (>=8, maiúscula, minúscula, dígito, especial),
// email formato + único no empreendimento, role em superuser/admin/atendente/
// mecanico/gerente/financeiro, business_id obrigatório pra qualquer um exceto superuser.
export const userSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome"),
    email: z.email("E-mail inválido"),
    business_id: z.string().trim().optional().default(""),
    role: z.string().trim().min(1, "Selecione a função"),
    ...passwordFields,
  })
  .refine(passwordsMatch, PASSWORD_MISMATCH_ISSUE)

export const userDefaults = {
  name: "",
  email: "",
  business_id: "",
  role: "",
  ...passwordFieldsDefaults,
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
    ...passwordFields,
  })
  .refine(passwordsMatch, PASSWORD_MISMATCH_ISSUE)

export const changePasswordDefaults = {
  current_password: "",
  ...passwordFieldsDefaults,
}

export function toChangePasswordPayload(values) {
  return { current_password: values.current_password, new_password: values.password }
}
