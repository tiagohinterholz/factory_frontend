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
    financial_category_id: "4",
    description: "Aluguel de outubro",
    amount: "1500",
    due_date: "2026-10-05",
  }

  it("aceita um payload válido e tags vazias por padrão", () => {
    const result = financialEntrySchema.safeParse(valid)
    expect(result.success).toBe(true)
    expect(result.data.tags).toEqual([])
  })

  it("rejeita valor zero ou negativo", () => {
    expect(financialEntrySchema.safeParse({ ...valid, amount: "0" }).success).toBe(false)
    expect(financialEntrySchema.safeParse({ ...valid, amount: "-5" }).success).toBe(false)
  })

  it("exige tipo, categoria financeira e vencimento", () => {
    expect(financialEntrySchema.safeParse({ ...valid, entry_type: "" }).success).toBe(false)
    expect(financialEntrySchema.safeParse({ ...valid, financial_category_id: "" }).success).toBe(
      false,
    )
    expect(financialEntrySchema.safeParse({ ...valid, due_date: "" }).success).toBe(false)
  })

  it("descrição e subcategoria são opcionais", () => {
    const { description: _description, ...rest } = valid
    expect(financialEntrySchema.safeParse({ ...rest, financial_subcategory_id: "" }).success).toBe(
      true,
    )
  })
})

describe("toFinancialEntryPayload", () => {
  it("monta o payload com categoria, subcategoria e tags; vazios viram null", () => {
    const payload = toFinancialEntryPayload({
      entry_type: "a_pagar",
      category: "outro",
      financial_category_id: "9",
      financial_subcategory_id: "",
      description: "",
      amount: "1500",
      due_date: "2026-10-05",
      tags: ["Urgente"],
    })
    expect(payload).toEqual({
      entry_type: "a_pagar",
      category: "outro",
      financial_category_id: "9",
      financial_subcategory_id: null,
      description: null,
      amount: "1500",
      due_date: "2026-10-05",
      tags: ["Urgente"],
    })
  })
})

describe("toFinancialEntryUpdatePayload", () => {
  const values = {
    category: "aluguel",
    financial_category_id: "4",
    financial_subcategory_id: "7",
    description: "Aluguel",
    amount: "1300",
    due_date: "2026-11-05",
    tags: ["Fixo"],
  }

  it("entrada automática: só vencimento e tags vão no payload", () => {
    expect(toFinancialEntryUpdatePayload(values, true)).toEqual({
      due_date: "2026-11-05",
      tags: ["Fixo"],
    })
  })

  it("entrada manual: todos os campos editáveis vão no payload", () => {
    expect(toFinancialEntryUpdatePayload(values, false)).toEqual({
      description: "Aluguel",
      amount: "1300",
      due_date: "2026-11-05",
      category: "aluguel",
      financial_category_id: "4",
      financial_subcategory_id: "7",
      tags: ["Fixo"],
    })
  })

  it("entrada manual: descrição vazia vira null", () => {
    const payload = toFinancialEntryUpdatePayload({ ...values, description: "" }, false)
    expect(payload.description).toBeNull()
  })
})
