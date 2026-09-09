import { z } from "zod"
import { requiredId, requiredText } from "@/modules/core/schemas/br-fields"

// A licença é renovada via PATCH /empreendimentos/licencas/{business_id}/renovar/.
// business_id vai na URL; period/max_users/activation_date vão no corpo.
export const licenseSchema = z.object({
  business_id: requiredId("Selecione o empreendimento"),
  period: z.enum(["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"], {
    message: "Selecione o período",
  }),
  max_users: z.coerce
    .number({ message: "Informe o limite de usuários" })
    .int("Valor inválido")
    .min(1, "Mínimo de 1 usuário")
    .max(10, "Máximo de 10 usuários"),
  activation_date: requiredText("Informe a data de ativação"),
})

export const licenseDefaults = {
  business_id: "",
  period: "MENSAL",
  max_users: "1",
  activation_date: new Date().toISOString().split("T")[0],
}

// form -> corpo do PATCH de renovação.
export function toLicensePayload(values) {
  return {
    period: values.period,
    max_users: Number(values.max_users),
    activation_date: values.activation_date
      ? new Date(values.activation_date).toISOString()
      : undefined,
  }
}
