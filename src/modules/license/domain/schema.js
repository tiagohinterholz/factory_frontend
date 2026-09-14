import { z } from "zod"

// Renovação self-service: PATCH /configuracoes/licenca/renovar/, sem
// business_id (é sempre o próprio negócio) e sem activation_date — o corpo é
// só { period, max_users }.
export const licenseRenewSchema = z.object({
  period: z.enum(["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"], {
    message: "Selecione o período",
  }),
  max_users: z.coerce
    .number({ message: "Informe o limite de usuários" })
    .int("Valor inválido")
    .min(1, "Mínimo de 1 usuário")
    .max(10, "Máximo de 10 usuários"),
})

export const licenseRenewDefaults = {
  period: "MENSAL",
  max_users: "1",
}

export function toLicenseRenewPayload(values) {
  return {
    period: values.period,
    max_users: Number(values.max_users),
  }
}
