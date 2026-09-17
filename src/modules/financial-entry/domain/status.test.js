import { describe, it, expect } from "vitest"
import {
  FINANCIAL_ENTRY_STATUS,
  financialEntryStatusTone,
  financialEntryIsLocked,
  financialEntryCanAct,
  financialEntryIsAutomatic,
  financialEntryTypeLabel,
  financialEntryCategoryLabel,
} from "./status"

describe("financial entry status", () => {
  it("financialEntryIsLocked só em pago/cancelado", () => {
    expect(financialEntryIsLocked(FINANCIAL_ENTRY_STATUS.PAID)).toBe(true)
    expect(financialEntryIsLocked(FINANCIAL_ENTRY_STATUS.CANCELLED)).toBe(true)
    expect(financialEntryIsLocked(FINANCIAL_ENTRY_STATUS.PENDING)).toBe(false)
    expect(financialEntryIsLocked(FINANCIAL_ENTRY_STATUS.OVERDUE)).toBe(false)
  })

  it("financialEntryCanAct é o oposto de financialEntryIsLocked", () => {
    expect(financialEntryCanAct(FINANCIAL_ENTRY_STATUS.PAID)).toBe(false)
    expect(financialEntryCanAct(FINANCIAL_ENTRY_STATUS.PENDING)).toBe(true)
  })

  it("financialEntryIsAutomatic: true quando tem order ou supplier", () => {
    expect(financialEntryIsAutomatic({ order: { id: 1 } })).toBe(true)
    expect(financialEntryIsAutomatic({ supplier: { id: 1 } })).toBe(true)
    expect(financialEntryIsAutomatic({ order: null, supplier: null })).toBe(false)
    expect(financialEntryIsAutomatic({})).toBe(false)
  })

  it("financialEntryStatusTone: um tom por status, fallback pra desconhecido", () => {
    expect(financialEntryStatusTone(FINANCIAL_ENTRY_STATUS.PENDING)).toMatch(/amber/)
    expect(financialEntryStatusTone(FINANCIAL_ENTRY_STATUS.PAID)).toMatch(/emerald/)
    expect(financialEntryStatusTone(FINANCIAL_ENTRY_STATUS.OVERDUE)).toMatch(/rose/)
    expect(financialEntryStatusTone(FINANCIAL_ENTRY_STATUS.CANCELLED)).toMatch(/slate/)
    expect(financialEntryStatusTone("xpto")).toMatch(/slate/)
  })

  it("financialEntryTypeLabel/financialEntryCategoryLabel traduzem os códigos", () => {
    expect(financialEntryTypeLabel("a_pagar")).toBe("A pagar")
    expect(financialEntryTypeLabel("a_receber")).toBe("A receber")
    expect(financialEntryCategoryLabel("aluguel")).toBe("Aluguel")
    expect(financialEntryCategoryLabel("venda_servico")).toBe("Venda de serviço/produto")
    // fallback: código desconhecido devolve ele mesmo, sem quebrar
    expect(financialEntryTypeLabel("xpto")).toBe("xpto")
  })
})
