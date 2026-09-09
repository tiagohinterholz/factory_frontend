import { describe, it, expect } from "vitest"
import {
  ORDER_STATUS,
  orderStatusTone,
  orderCanEditItems,
  orderCanFinish,
  orderCanInvoice,
  orderIsBilled,
} from "./status"

describe("order status", () => {
  it("orderCanEditItems / orderCanFinish só em 'em andamento'", () => {
    expect(orderCanEditItems(ORDER_STATUS.IN_PROGRESS)).toBe(true)
    expect(orderCanFinish(ORDER_STATUS.IN_PROGRESS)).toBe(true)
    for (const s of [ORDER_STATUS.TO_BILL, ORDER_STATUS.BILLED, ORDER_STATUS.CANCELLED, ""]) {
      expect(orderCanEditItems(s)).toBe(false)
      expect(orderCanFinish(s)).toBe(false)
    }
  })

  it("orderCanInvoice só em 'a faturar'", () => {
    expect(orderCanInvoice(ORDER_STATUS.TO_BILL)).toBe(true)
    expect(orderCanInvoice(ORDER_STATUS.IN_PROGRESS)).toBe(false)
    expect(orderCanInvoice(ORDER_STATUS.BILLED)).toBe(false)
  })

  it("orderIsBilled só em 'faturado'", () => {
    expect(orderIsBilled(ORDER_STATUS.BILLED)).toBe(true)
    expect(orderIsBilled(ORDER_STATUS.TO_BILL)).toBe(false)
  })

  it("orderStatusTone: um tom por status, fallback pra desconhecido", () => {
    expect(orderStatusTone(ORDER_STATUS.IN_PROGRESS)).toMatch(/amber/)
    expect(orderStatusTone(ORDER_STATUS.BILLED)).toMatch(/emerald/)
    expect(orderStatusTone("xpto")).toMatch(/slate/)
  })
})
