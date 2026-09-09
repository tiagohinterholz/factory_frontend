import { describe, it, expect } from "vitest"
import { toAppointmentPayload } from "./schema"

const base = {
  business_id: "2",
  client_id: "5",
  vehicle_id: "9",
  order_id: "",
  date: "2026-09-10",
  time: "",
  observation: "",
}

describe("toAppointmentPayload", () => {
  it("order_id vazio vira null (o back aceita null, não '')", () => {
    expect(toAppointmentPayload(base).order_id).toBeNull()
  })

  it("order_id preenchido é mantido", () => {
    expect(toAppointmentPayload({ ...base, order_id: "7" }).order_id).toBe("7")
  })

  it("time vazio é omitido do payload", () => {
    expect(toAppointmentPayload(base)).not.toHaveProperty("time")
  })

  it("time preenchido é mantido", () => {
    expect(toAppointmentPayload({ ...base, time: "14:00" }).time).toBe("14:00")
  })

  it("não muta o objeto recebido", () => {
    const values = { ...base, order_id: "" }
    toAppointmentPayload(values)
    expect(values.order_id).toBe("")
  })
})
