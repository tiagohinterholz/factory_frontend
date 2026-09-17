import { describe, it, expect } from "vitest"
import {
  financialMonthMiniStats,
  financialMonthTypeOptions,
  financialMonthStatusOptions,
  financialMonthNextStatus,
  currentMonthRange,
} from "./financial-month"

const cellOf = (count, total) => ({ count, total })

const BREAKDOWN = {
  a_receber: {
    pendente: cellOf(2, "490.00"),
    pago: cellOf(3, "2640.00"),
    atrasado: cellOf(1, "480.00"),
    cancelado: cellOf(1, "390.00"),
  },
  a_pagar: {
    pendente: cellOf(2, "12760.00"),
    pago: cellOf(2, "4320.00"),
    atrasado: cellOf(2, "1430.00"),
    cancelado: cellOf(0, "0.00"),
  },
}

describe("financialMonthMiniStats", () => {
  it("soma a_receber pendente+atrasado para 'a faturar'", () => {
    const stats = financialMonthMiniStats(BREAKDOWN)
    expect(stats.toBill).toBe(970)
  })

  it("usa só a_receber pago para 'faturado'", () => {
    const stats = financialMonthMiniStats(BREAKDOWN)
    expect(stats.billed).toBe(2640)
  })

  it("soma a_pagar pendente+atrasado para 'a pagar em aberto'", () => {
    const stats = financialMonthMiniStats(BREAKDOWN)
    expect(stats.payablesOpen).toBe(14190)
  })

  it("não quebra com breakdown ausente", () => {
    expect(financialMonthMiniStats(null)).toEqual({
      toBill: 0,
      billed: 0,
      payablesOpen: 0,
    })
  })
})

describe("financialMonthTypeOptions", () => {
  it("soma a contagem dos 4 status por tipo", () => {
    const options = financialMonthTypeOptions(BREAKDOWN)
    expect(options).toEqual([
      { id: "a_receber", label: "A receber", count: 7 },
      { id: "a_pagar", label: "A pagar", count: 6 },
    ])
  })
})

describe("financialMonthStatusOptions", () => {
  it("traz label, tom e contagem de cada status pro tipo escolhido", () => {
    const options = financialMonthStatusOptions(BREAKDOWN, "a_pagar")
    expect(options).toEqual([
      { id: "pago", label: "Pago", tone: "ok", count: 2 },
      { id: "pendente", label: "Pendente", tone: "info", count: 2 },
      { id: "atrasado", label: "Atrasado", tone: "danger", count: 2 },
      { id: "cancelado", label: "Cancelado", tone: "muted", count: 0 },
    ])
  })
})

describe("financialMonthNextStatus", () => {
  it("mantém o status atual se ele tiver lançamentos no tipo novo", () => {
    expect(financialMonthNextStatus(BREAKDOWN, "a_pagar", "pendente")).toBe("pendente")
  })

  it("pula pro primeiro status com contagem se o atual estiver zerado", () => {
    expect(financialMonthNextStatus(BREAKDOWN, "a_pagar", "cancelado")).toBe("pago")
  })

  it("cai em 'pendente' se nenhum status tiver lançamento", () => {
    const empty = {
      a_receber: {
        pendente: cellOf(0, "0"),
        pago: cellOf(0, "0"),
        atrasado: cellOf(0, "0"),
        cancelado: cellOf(0, "0"),
      },
    }
    expect(financialMonthNextStatus(empty, "a_receber", "cancelado")).toBe("pendente")
  })
})

describe("currentMonthRange", () => {
  it("calcula o primeiro e o último dia do mês de referência", () => {
    const range = currentMonthRange(new Date(2026, 8, 15)) // setembro/2026 (mês 0-indexado)
    expect(range).toEqual({ date_from: "2026-09-01", date_to: "2026-09-30" })
  })

  it("acerta o último dia em mês com 31 dias e ano bissexto (fevereiro)", () => {
    expect(currentMonthRange(new Date(2026, 0, 5))).toEqual({
      date_from: "2026-01-01",
      date_to: "2026-01-31",
    })
    expect(currentMonthRange(new Date(2024, 1, 10))).toEqual({
      date_from: "2024-02-01",
      date_to: "2024-02-29",
    })
  })
})
