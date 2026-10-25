import { describe, it, expect } from "vitest"
import { niceTicks, compactMoney } from "./charts"

describe("niceTicks", () => {
  it("usa passos redondos e cobre o maior valor", () => {
    expect(niceTicks(3150)).toEqual({ top: 4000, ticks: [0, 1000, 2000, 3000, 4000] })
    expect(niceTicks(450)).toEqual({ top: 600, ticks: [0, 200, 400, 600] })
  })

  it("sem dados ainda desenha uma escala", () => {
    expect(niceTicks(0).ticks.length).toBeGreaterThan(1)
  })
})

describe("compactMoney", () => {
  it("abrevia milhares e milhões", () => {
    expect(compactMoney(2000)).toBe("R$ 2 mil")
    expect(compactMoney(1500000)).toBe("R$ 1,5 mi")
    expect(compactMoney(80)).toBe("R$ 80")
  })
})
