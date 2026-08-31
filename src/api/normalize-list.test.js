import { describe, it, expect } from "vitest"
import { normalizeList } from "./normalize-list"

describe("normalizeList", () => {
  it("array cru -> { results, count }", () => {
    expect(normalizeList([1, 2, 3])).toEqual({ results: [1, 2, 3], count: 3 })
  })

  it("{ results, count } passa direto", () => {
    expect(normalizeList({ results: [{ id: 1 }], count: 42 })).toEqual({
      results: [{ id: 1 }],
      count: 42,
    })
  })

  it("{ results } sem count -> count = length", () => {
    expect(normalizeList({ results: [1, 2] })).toEqual({ results: [1, 2], count: 2 })
  })

  it("lixo -> vazio", () => {
    expect(normalizeList(null)).toEqual({ results: [], count: 0 })
    expect(normalizeList(undefined)).toEqual({ results: [], count: 0 })
    expect(normalizeList({ foo: "bar" })).toEqual({ results: [], count: 0 })
  })
})
