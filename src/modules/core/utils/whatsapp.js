// wa.me só aceita dígitos; telefone BR (DDD + 8/9 dígitos) ganha o 55 na
// frente. null quando não há telefone — quem chama decide se esconde o botão.
export function whatsappLink(phone) {
  const digits = String(phone ?? "").replace(/\D/g, "")
  if (!digits) return null
  return `https://wa.me/${digits.length <= 11 ? `55${digits}` : digits}`
}
