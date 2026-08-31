import { z } from "zod"

// Backend: validate_strong_password (>=8, maiúscula, minúscula, dígito, especial),
// email formato + único no empreendimento, role em superuser/admin/colaborador,
// business_id obrigatório para admin/colaborador.
const SPECIAL = /[!@#$%^&*(),.?":{}|<>]/

export const userSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome"),
    email: z.email("E-mail inválido"),
    business_id: z.string().trim().optional().default(""),
    role: z.string().trim().min(1, "Selecione a função"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Precisa de uma letra maiúscula")
      .regex(/[a-z]/, "Precisa de uma letra minúscula")
      .regex(/\d/, "Precisa de um número")
      .regex(SPECIAL, "Precisa de um caractere especial"),
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
