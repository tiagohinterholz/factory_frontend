export const LicenseOptions = [
  { id: "MENSAL", name: "Mensal" },
  { id: "TRIMESTRAL", name: "Trimestral" },
  { id: "SEMESTRAL", name: "Semestral" },
  { id: "ANUAL", name: "Anual" },
]

export const StatusOptions = [
  { id: "TRIAL", name: "Em Teste" },
  { id: "ACTIVE", name: "Ativo" },
  { id: "EXPIRED", name: "Expirado" },
]

// forma de pagamento da cobrança de renovação (4.4.2) — mesmas opções do
// Payment.METHOD_CHOICES no back, duplicado aqui pra não acoplar o módulo
// de licença ao de financeiro (a lista já existe também em
// financial-entry/domain/payment.js, pra outro contexto de cobrança).
export const PaymentMethodOptions = [
  { id: "PIX", name: "Pix" },
  { id: "BOLETO", name: "Boleto" },
  { id: "CREDIT_CARD", name: "Cartão de crédito" },
]
