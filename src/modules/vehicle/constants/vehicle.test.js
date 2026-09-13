import { describe, it, expect } from "vitest"
import { manufactureYearOptions, modelYearOptions } from "./vehicle"

const CURRENT_YEAR = new Date().getFullYear()

describe("manufactureYearOptions", () => {
  it("vai do ano atual até 1940, mais recente primeiro", () => {
    expect(manufactureYearOptions[0]).toEqual({
      id: String(CURRENT_YEAR),
      name: String(CURRENT_YEAR),
    })
    expect(manufactureYearOptions.at(-1)).toEqual({ id: "1940", name: "1940" })
  })

  it("não inclui o ano seguinte (isso é só pro ano do modelo)", () => {
    expect(manufactureYearOptions.some((option) => option.id === String(CURRENT_YEAR + 1))).toBe(
      false,
    )
  })
})

describe("modelYearOptions", () => {
  it("aceita mais um ano que o atual (carro 'modelo do ano que vem')", () => {
    expect(modelYearOptions[0]).toEqual({
      id: String(CURRENT_YEAR + 1),
      name: String(CURRENT_YEAR + 1),
    })
    expect(modelYearOptions.at(-1)).toEqual({ id: "1940", name: "1940" })
  })

  it("tem exatamente um ano a mais que o de fabricação", () => {
    expect(modelYearOptions).toHaveLength(manufactureYearOptions.length + 1)
  })
})
