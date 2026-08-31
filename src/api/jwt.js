// Lê o payload de um JWT no cliente. A assinatura NÃO é validada aqui —
// isso é papel do backend; aqui só olhamos `exp` para não renderizar a área
// logada com um token já morto.

export function decodeJwt(token) {
  if (typeof token !== "string") return null

  const parts = token.split(".")
  if (parts.length !== 3) return null

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

// true quando o token está ausente, ilegível, sem `exp` ou já vencido.
// `skewSeconds` dá uma folga para o desencontro de relógio cliente/servidor.
export function isExpired(token, skewSeconds = 30) {
  const payload = decodeJwt(token)
  if (!payload || typeof payload.exp !== "number") return true
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000
}
