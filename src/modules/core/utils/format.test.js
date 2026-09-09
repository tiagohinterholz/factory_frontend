import { describe, it, expect } from "vitest"
import { formatMoney, formatDate, formatDateTime } from "./format"

describe("formatMoney", () => {
  it("formata número e string numérica em pt-BR com R$", () => {
    expect(formatMoney(1500)).toBe("R$ 1.500,00")
    expect(formatMoney("6000.00")).toBe("R$ 6.000,00")
    expect(formatMoney(150.5)).toBe("R$ 150,50")
    expect(formatMoney(0)).toBe("R$ 0,00")
  })

  it("valor ausente ou inválido vira R$ 0,00", () => {
    expect(formatMoney(null)).toBe("R$ 0,00")
    expect(formatMoney(undefined)).toBe("R$ 0,00")
    expect(formatMoney("abc")).toBe("R$ 0,00")
  })

  it("arredonda para 2 casas", () => {
    expect(formatMoney("2.999")).toBe("R$ 3,00")
    expect(formatMoney(1234.5)).toBe("R$ 1.234,50")
  })
})

describe("formatDate", () => {
  it("datetime ISO -> dd/mm/aaaa", () => {
    expect(formatDate("2026-09-06T12:00:00.000Z")).toBe("06/09/2026")
  })

  it("date puro (YYYY-MM-DD) não escorrega de fuso", () => {
    expect(formatDate("2026-09-10")).toBe("10/09/2026")
  })

  it("vazio, nulo ou inválido vira string vazia", () => {
    expect(formatDate(null)).toBe("")
    expect(formatDate("")).toBe("")
    expect(formatDate("não-é-data")).toBe("")
  })
})

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
