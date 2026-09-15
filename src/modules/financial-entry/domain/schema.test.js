import { describe, it, expect } from "vitest"
import {
  financialEntrySchema,
  toFinancialEntryPayload,
  toFinancialEntryUpdatePayload,
} from "./schema"

describe("financialEntrySchema", () => {
  const valid = {
    entry_type: "a_pagar",
    category: "aluguel",
    description: "Aluguel de outubro",
    amount: "1500",
    due_date: "2026-10-05",
  }

  it("aceita um payload válido", () => {
    expect(financialEntrySchema.safeParse(valid).success).toBe(true)
  })

  it("rejeita valor zero ou negativo", () => {
    expect(financialEntrySchema.safeParse({ ...valid, amount: "0" }).success).toBe(false)
    expect(financialEntrySchema.safeParse({ ...valid, amount: "-5" }).success).toBe(false)
  })

  it("exige tipo, categoria e vencimento", () => {
    expect(financialEntrySchema.safeParse({ ...valid, entry_type: "" }).success).toBe(false)
    expect(financialEntrySchema.safeParse({ ...valid, category: "" }).success).toBe(false)
    expect(financialEntrySchema.safeParse({ ...valid, due_date: "" }).success).toBe(false)
  })

  it("descrição é opcional", () => {
    const { description: _description, ...rest } = valid
    expect(financialEntrySchema.safeParse(rest).success).toBe(true)
  })
})

describe("toFinancialEntryPayload", () => {
  it("monta o payload de criação, descrição vazia vira null", () => {
    const payload = toFinancialEntryPayload({
      entry_type: "a_pagar",
      category: "aluguel",
      description: "",
      amount: "1500",
      due_date: "2026-10-05",
    })
    expect(payload).toEqual({
      entry_type: "a_pagar",
      category: "aluguel",
      description: null,
      amount: "1500",
      due_date: "2026-10-05",
    })
  })
})

describe("toFinancialEntryUpdatePayload", () => {
  const values = {
    category: "aluguel",
    description: "Aluguel",
    amount: "1300",
    due_date: "2026-11-05",
  }

  it("entrada automática: só due_date vai no payload", () => {
    expect(toFinancialEntryUpdatePayload(values, true)).toEqual({ due_date: "2026-11-05" })
  })

  it("entrada manual: todos os campos editáveis vão no payload", () => {
    expect(toFinancialEntryUpdatePayload(values, false)).toEqual({
      description: "Aluguel",
      amount: "1300",
      due_date: "2026-11-05",
      category: "aluguel",
    })
  })

  it("entrada manual: descrição vazia vira null", () => {
    const payload = toFinancialEntryUpdatePayload({ ...values, description: "" }, false)
    expect(payload.description).toBeNull()
  })
})
