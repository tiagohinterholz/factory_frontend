import { describe, it, expect } from "vitest"
import { idOf, toDateInput, toDateTimeLocalInput, fromDateTimeLocalInput, activeItems } from "./dto"

describe("idOf", () => {
  it("aceita objeto aninhado, id cru e vazio", () => {
    expect(idOf({ id: 7 })).toBe("7")
    expect(idOf(7)).toBe("7")
    expect(idOf(null)).toBe("")
  })
})

describe("toDateInput", () => {
  it("recorta a data ISO para YYYY-MM-DD", () => {
    expect(toDateInput("2026-10-05T10:43:04.350685-03:00")).toBe("2026-10-05")
    expect(toDateInput(null)).toBe("")
  })
})

describe("toDateTimeLocalInput / fromDateTimeLocalInput", () => {
  it("round-trip: ISO -> datetime-local -> ISO preserva o instante (ao minuto)", () => {
    const iso = "2026-10-05T23:59:00.000Z"
    const local = toDateTimeLocalInput(iso)
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    expect(fromDateTimeLocalInput(local)).toBe(iso)
  })

  it("string vazia / valor inválido viram '' e null", () => {
    expect(toDateTimeLocalInput(null)).toBe("")
    expect(toDateTimeLocalInput("nao-e-data")).toBe("")
    expect(fromDateTimeLocalInput("")).toBeNull()
    expect(fromDateTimeLocalInput("nao-e-data")).toBeNull()
  })
})

describe("activeItems", () => {
  it("mantém só os is_active; tolera null/undefined", () => {
    const list = [
      { id: 1, is_active: true },
      { id: 2, is_active: false },
      { id: 3, is_active: true },
    ]
    expect(activeItems(list).map((i) => i.id)).toEqual([1, 3])
    expect(activeItems(null)).toEqual([])
    expect(activeItems(undefined)).toEqual([])
  })
})
