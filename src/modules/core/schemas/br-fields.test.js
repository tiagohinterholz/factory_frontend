import { describe, it, expect } from "vitest"
import { PLATE_RE, PLATE_MASK, PLATE_MASK_REPLACEMENT } from "./br-fields"

function applyMask(raw) {
  let result = ""
  let i = 0
  for (const maskChar of PLATE_MASK) {
    if (maskChar === "-") {
      result += "-"
      continue
    }
    if (i >= raw.length) break
    const pattern = PLATE_MASK_REPLACEMENT[maskChar]
    if (!pattern.test(raw[i])) break
    result += raw[i]
    i += 1
  }
  return result
}

describe("PLATE_MASK", () => {
  it("aceita o formato antigo (AAA-0000) sem travar a digitação", () => {
    expect(applyMask("ABC1234")).toBe("ABC-1234")
  })

  it("aceita o formato Mercosul (AAA-0A00) sem travar a digitação", () => {
    expect(applyMask("ABC1D23")).toBe("ABC-1D23")
  })

  it("o resultado final de cada formato bate com PLATE_RE (zod)", () => {
    expect(PLATE_RE.test(applyMask("ABC1234"))).toBe(true)
    expect(PLATE_RE.test(applyMask("ABC1D23"))).toBe(true)
  })
})
