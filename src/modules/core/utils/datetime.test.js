import { describe, it, expect } from "vitest"
import { formatDateTime } from "./datetime"

describe("formatDateTime", () => {
  it("formata datetime ISO com a data e a hora (pt-BR)", () => {
    // meio-dia UTC não vira outro dia em nenhum fuso real
    const out = formatDateTime("2026-09-06T12:00:00.000Z")
    expect(out).toContain("06/09/2026")
    expect(out).toMatch(/\d{2}:\d{2}/)
  })

  it("valor vazio ou inválido vira string vazia", () => {
    expect(formatDateTime(null)).toBe("")
    expect(formatDateTime("")).toBe("")
    expect(formatDateTime("não-é-data")).toBe("")
  })
})
