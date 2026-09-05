import { describe, it, expect } from "vitest"
import { toOrderPayload } from "./order.schema"

describe("toOrderPayload", () => {
  const base = { business_id: "1", client_id: "2", vehicle_id: "3" }

  it("converte service_date (datetime-local) para ISO 8601 com timezone", () => {
    const payload = toOrderPayload({ ...base, service_date: "2026-09-05T14:30" })
    expect(payload.service_date).toBe(new Date("2026-09-05T14:30").toISOString())
    expect(payload.service_date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  })

  it("service_date vazio vira null (limpar não mexe no agendamento)", () => {
    expect(toOrderPayload({ ...base, service_date: "" }).service_date).toBeNull()
  })

  it("billing_date segue como data pura, sem virar datetime", () => {
    const payload = toOrderPayload({ ...base, billing_date: "2026-09-10" })
    expect(payload.billing_date).toBe("2026-09-10")
  })

  it("ids e campos opcionais vazios viram null", () => {
    expect(toOrderPayload({ business_id: "", client_id: "", vehicle_id: "" })).toEqual({
      business_id: null,
      client_id: null,
      vehicle_id: null,
      budget_id: null,
      service_date: null,
      billing_date: null,
      notes: null,
    })
  })
})
