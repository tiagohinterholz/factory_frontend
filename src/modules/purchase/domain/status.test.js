import { describe, it, expect } from "vitest"
import { purchaseOrderIsOpen, purchaseOrderStatusTone, stockMovementTypeLabel } from "./status"

describe("purchaseOrderIsOpen", () => {
  it("só 'aberto' é considerado aberto", () => {
    expect(purchaseOrderIsOpen("aberto")).toBe(true)
    expect(purchaseOrderIsOpen("recebido")).toBe(false)
    expect(purchaseOrderIsOpen("cancelado")).toBe(false)
  })
})

describe("purchaseOrderStatusTone", () => {
  it("tem um tom por status conhecido e um fallback neutro", () => {
    expect(purchaseOrderStatusTone("aberto")).toContain("amber")
    expect(purchaseOrderStatusTone("recebido")).toContain("emerald")
    expect(purchaseOrderStatusTone("cancelado")).toContain("rose")
    expect(purchaseOrderStatusTone("xpto")).toContain("slate")
  })
})

describe("stockMovementTypeLabel", () => {
  it("traduz os tipos conhecidos", () => {
    expect(stockMovementTypeLabel("compra")).toBe("Compra")
    expect(stockMovementTypeLabel("cancelamento_venda")).toBe("Cancelamento de venda")
  })
})
