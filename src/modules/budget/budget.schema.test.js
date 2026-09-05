import { describe, it, expect } from "vitest"
import { toBudgetPayload } from "./budget.schema"

describe("toBudgetPayload", () => {
  const base = { business_id: "1", client_id: "2", vehicle_id: "3" }

  it("converte o valor do <input type=datetime-local> para ISO 8601", () => {
    const payload = toBudgetPayload({ ...base, valid_until: "2026-10-05T23:59" })
    // reconstrói o instante local esperado sem depender do fuso do CI
    const expected = new Date("2026-10-05T23:59").toISOString()
    expect(payload.valid_until).toBe(expected)
    expect(payload.valid_until).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  })

  it("omite valid_until quando vazio (o back mantém/aplica o valor dele)", () => {
    const payload = toBudgetPayload({ ...base, valid_until: "" })
    expect(payload).not.toHaveProperty("valid_until")
    expect(payload).toEqual({ business_id: "1", client_id: "2", vehicle_id: "3" })
  })

  it("ids vazios viram null", () => {
    expect(toBudgetPayload({ business_id: "", client_id: "", vehicle_id: "" })).toEqual({
      business_id: null,
      client_id: null,
      vehicle_id: null,
    })
  })
})
