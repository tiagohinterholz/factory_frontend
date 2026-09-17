import { describe, it, expect } from "vitest"
import { purchaseOrderSchema, purchaseOrderItemSchema } from "./schema"

describe("purchaseOrderSchema", () => {
  it("exige o fornecedor", () => {
    const result = purchaseOrderSchema.safeParse({ supplier_id: "", notes: "" })
    expect(result.success).toBe(false)
  })

  it("aceita com fornecedor e observação opcional em branco", () => {
    const result = purchaseOrderSchema.safeParse({ supplier_id: "1", notes: "" })
    expect(result.success).toBe(true)
  })
})

describe("purchaseOrderItemSchema", () => {
  it("exige produto, quantidade mínima 1 e custo unitário", () => {
    expect(
      purchaseOrderItemSchema.safeParse({ product_id: "", quantity: 1, unit_cost: 10 }).success,
    ).toBe(false)
    expect(
      purchaseOrderItemSchema.safeParse({ product_id: "1", quantity: 0, unit_cost: 10 }).success,
    ).toBe(false)
    expect(
      purchaseOrderItemSchema.safeParse({ product_id: "1", quantity: 1, unit_cost: 0 }).success,
    ).toBe(false)
  })

  it("aceita um item válido", () => {
    const result = purchaseOrderItemSchema.safeParse({
      product_id: "1",
      quantity: 3,
      unit_cost: "9.90",
    })
    expect(result.success).toBe(true)
  })
})
