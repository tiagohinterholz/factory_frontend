import { describe, it, expect } from "vitest"
import { appointmentWhen } from "./format"

describe("appointmentWhen", () => {
  it("com horário: dia da semana abreviado + HH:mm (sem segundos)", () => {
    // 2026-09-10 é uma quinta-feira
    expect(appointmentWhen("2026-09-10", "14:30:00")).toMatch(/^qui\.,\s14:30$/)
  })

  it("sem horário: dia da semana abreviado + dd/mm", () => {
    expect(appointmentWhen("2026-09-10", "")).toMatch(/^qui\.,\s10\/09$/)
    expect(appointmentWhen("2026-09-10")).toMatch(/^qui\.,\s10\/09$/)
  })

  it("sem data, ou data/hora inválida, vira string vazia", () => {
    expect(appointmentWhen("", "14:30")).toBe("")
    expect(appointmentWhen(null, "14:30")).toBe("")
    expect(appointmentWhen("não-é-data", "14:30")).toBe("")
  })
})
