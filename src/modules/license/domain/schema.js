import { z } from "zod"

// Renovação/upgrade de licença (4.4.2): POST /configuracoes/licenca/renovar/
// só cria a cobrança (sempre o próprio negócio, sem business_id no corpo) —
// o back resolve o preço pelo catálogo PLANS, max_users nunca vem daqui.
export const licenseRenewSchema = z.object({
  period: z.enum(["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"], {
    message: "Selecione o período",
  }),
  method: z.enum(["PIX", "BOLETO", "CREDIT_CARD"], {
    message: "Selecione a forma de pagamento",
  }),
})

export const licenseRenewDefaults = {
  period: "MENSAL",
  method: "PIX",
}
