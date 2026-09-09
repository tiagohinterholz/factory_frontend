import { describe, it, expect } from "vitest"
import {
  BUDGET_STATUS,
  budgetStatusTone,
  budgetIsPending,
  budgetCanDuplicate,
  budgetStatusDate,
} from "./status"

describe("budget status", () => {
  it("budgetIsPending só em 'pendente'", () => {
    expect(budgetIsPending(BUDGET_STATUS.PENDING)).toBe(true)
    expect(budgetIsPending(BUDGET_STATUS.APPROVED)).toBe(false)
  })

  it("budgetCanDuplicate só em cancelado/expirado", () => {
    expect(budgetCanDuplicate(BUDGET_STATUS.CANCELLED)).toBe(true)
    expect(budgetCanDuplicate(BUDGET_STATUS.EXPIRED)).toBe(true)
    expect(budgetCanDuplicate(BUDGET_STATUS.PENDING)).toBe(false)
    expect(budgetCanDuplicate(BUDGET_STATUS.APPROVED)).toBe(false)
  })

  it("budgetStatusDate: a data da situação conforme o status", () => {
    const dates = {
      approvedAt: "2026-09-06T12:00:00Z",
      cancelledAt: "2026-09-05T12:00:00Z",
      validUntil: "2026-09-04T12:00:00Z",
    }
    expect(budgetStatusDate(BUDGET_STATUS.APPROVED, dates)).toBe(dates.approvedAt)
    expect(budgetStatusDate(BUDGET_STATUS.CANCELLED, dates)).toBe(dates.cancelledAt)
    expect(budgetStatusDate(BUDGET_STATUS.EXPIRED, dates)).toBe(dates.validUntil)
    expect(budgetStatusDate(BUDGET_STATUS.PENDING, dates)).toBeNull()
    expect(budgetStatusDate(BUDGET_STATUS.APPROVED, {})).toBeNull()
    expect(budgetStatusDate(BUDGET_STATUS.APPROVED)).toBeNull()
  })

  it("budgetStatusTone: um tom por status, fallback pra desconhecido", () => {
    expect(budgetStatusTone(BUDGET_STATUS.PENDING)).toMatch(/amber/)
    expect(budgetStatusTone(BUDGET_STATUS.APPROVED)).toMatch(/emerald/)
    expect(budgetStatusTone(BUDGET_STATUS.CANCELLED)).toMatch(/rose/)
    expect(budgetStatusTone("xpto")).toMatch(/slate/)
  })
})
