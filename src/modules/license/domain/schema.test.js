import { describe, it, expect } from "vitest"
import { toLicensePayload } from "./schema"

const base = {
  business_id: "3",
  period: "TRIMESTRAL",
  max_users: "3",
  activation_date: "2026-09-10",
}

describe("toLicensePayload", () => {
  it("business_id fica de fora (vai na URL do PATCH de renovação)", () => {
    expect(toLicensePayload(base)).not.toHaveProperty("business_id")
    expect(Object.keys(toLicensePayload(base)).sort()).toEqual([
      "activation_date",
      "max_users",
      "period",
    ])
  })

  it("max_users vem como number, não string", () => {
    expect(toLicensePayload(base).max_users).toBe(3)
  })

  it("activation_date vira ISO 8601", () => {
    expect(toLicensePayload(base).activation_date).toBe(new Date("2026-09-10").toISOString())
  })

  it("activation_date vazio vira undefined", () => {
    expect(toLicensePayload({ ...base, activation_date: "" }).activation_date).toBeUndefined()
  })
})
