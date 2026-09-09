import { describe, it, expect } from "vitest"
import {
  idOf,
  toDateInput,
  toDateTimeLocalInput,
  fromDateTimeLocalInput,
  activeItems,
  withSelectedOption,
} from "./dto"

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

describe("withSelectedOption", () => {
  const options = [
    { id: 1, name: "Ana" },
    { id: 2, name: "Beto" },
  ]

  it("prepende o fallback quando o valor selecionado não está na lista", () => {
    const result = withSelectedOption(options, 9, { id: 9, name: "Registro novo" })
    expect(result).toEqual([{ id: 9, name: "Registro novo" }, ...options])
  })

  it("compara id como string (select devolve string)", () => {
    const result = withSelectedOption(options, "9", { id: 9, name: "Registro novo" })
    expect(result[0]).toEqual({ id: 9, name: "Registro novo" })
  })

  it("no-op quando a opção já existe na lista", () => {
    expect(withSelectedOption(options, 2, { id: 2, name: "Beto (payload)" })).toBe(options)
  })

  it("no-op quando não há valor selecionado", () => {
    expect(withSelectedOption(options, "", { id: 9, name: "x" })).toBe(options)
    expect(withSelectedOption(options, null, { id: 9, name: "x" })).toBe(options)
  })

  it("no-op quando o fallback não tem id utilizável", () => {
    expect(withSelectedOption(options, 9, null)).toBe(options)
    expect(withSelectedOption(options, 9, { name: "sem id" })).toBe(options)
  })

  it("no-op quando o fallback não é o próprio valor selecionado", () => {
    expect(withSelectedOption(options, 9, { id: 8, name: "outro registro" })).toBe(options)
  })
})
