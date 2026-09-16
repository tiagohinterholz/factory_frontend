import { z } from "zod"
import { PASSWORD_RULES } from "@/modules/core/utils/password-policy"

const passwordRuleFor = (id) => PASSWORD_RULES.find((rule) => rule.id === id)

// Backend: validate_strong_password (>=8, maiúscula, minúscula, dígito,
// especial) — fonte única pra qualquer tela que define uma senha nova
// (criar usuário, ativação de conta do cadastro público, e futuramente
// redefinir senha).
export const passwordFields = {
  password: z
    .string()
    .min(8, passwordRuleFor("length").label)
    .refine(passwordRuleFor("upper").test, passwordRuleFor("upper").label)
    .refine(passwordRuleFor("lower").test, passwordRuleFor("lower").label)
    .refine(passwordRuleFor("digit").test, passwordRuleFor("digit").label)
    .refine(passwordRuleFor("special").test, passwordRuleFor("special").label),
  confirmPassword: z.string(),
}

export const passwordFieldsDefaults = { password: "", confirmPassword: "" }

export function passwordsMatch(values) {
  return values.password === values.confirmPassword
}

export const PASSWORD_MISMATCH_ISSUE = {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
}
