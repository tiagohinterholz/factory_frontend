import { describe, it, expect } from "vitest"
import { toLicenseRenewPayload } from "./schema"

describe("toLicenseRenewPayload", () => {
  it("manda só period e max_users", () => {
    const payload = toLicenseRenewPayload({ period: "TRIMESTRAL", max_users: "3" })
    expect(Object.keys(payload).sort()).toEqual(["max_users", "period"])
  })

  it("max_users vem como number, não string", () => {
    expect(toLicenseRenewPayload({ period: "MENSAL", max_users: "3" }).max_users).toBe(3)
  })
})
