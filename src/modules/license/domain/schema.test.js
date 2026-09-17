import { describe, it, expect } from "vitest"
import { licenseRenewSchema } from "./schema"

describe("licenseRenewSchema", () => {
  it("aceita period e method válidos", () => {
    const result = licenseRenewSchema.safeParse({ period: "TRIMESTRAL", method: "PIX" })
    expect(result.success).toBe(true)
  })

  it("rejeita period inválido", () => {
    const result = licenseRenewSchema.safeParse({ period: "SEMANAL", method: "PIX" })
    expect(result.success).toBe(false)
  })

  it("rejeita method inválido", () => {
    const result = licenseRenewSchema.safeParse({ period: "MENSAL", method: "DINHEIRO" })
    expect(result.success).toBe(false)
  })
})
