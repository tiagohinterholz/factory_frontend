import { describe, it, expect } from "vitest"
import { decodeJwt, isExpired } from "./jwt"

// monta um JWT falso: header e assinatura são irrelevantes aqui.
function makeToken(payload) {
  const body = btoa(JSON.stringify(payload)).replace(/=/g, "")
  return `header.${body}.signature`
}

describe("decodeJwt", () => {
  it("devolve o payload de um token bem formado", () => {
    const token = makeToken({ user_id: 7, exp: 1893456000 })
    expect(decodeJwt(token)).toEqual({ user_id: 7, exp: 1893456000 })
  })

  it("devolve null para entradas inválidas", () => {
    expect(decodeJwt(null)).toBeNull()
    expect(decodeJwt("")).toBeNull()
    expect(decodeJwt("nao-e-jwt")).toBeNull()
    expect(decodeJwt("a.b")).toBeNull()
    expect(decodeJwt("header.###.sig")).toBeNull()
  })
})

describe("isExpired", () => {
  const inOneHour = Math.floor(Date.now() / 1000) + 3600
  const oneHourAgo = Math.floor(Date.now() / 1000) - 3600

  it("false para token com exp no futuro", () => {
    expect(isExpired(makeToken({ exp: inOneHour }))).toBe(false)
  })

  it("true para token vencido", () => {
    expect(isExpired(makeToken({ exp: oneHourAgo }))).toBe(true)
  })

  it("true para token ausente, ilegível ou sem exp", () => {
    expect(isExpired(null)).toBe(true)
    expect(isExpired("lixo")).toBe(true)
    expect(isExpired(makeToken({ user_id: 1 }))).toBe(true)
  })

  it("respeita a folga de skew (token que vence dentro da folga conta como expirado)", () => {
    const inTenSeconds = Math.floor(Date.now() / 1000) + 10
    expect(isExpired(makeToken({ exp: inTenSeconds }), 30)).toBe(true)
    expect(isExpired(makeToken({ exp: inTenSeconds }), 0)).toBe(false)
  })
})
