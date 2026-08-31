import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useDebouncedValue } from "./useDebouncedValue"

describe("useDebouncedValue", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("começa com o valor inicial", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 300))
    expect(result.current).toBe("a")
  })

  it("só propaga depois do delay", () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), {
      initialProps: { v: "a" },
    })

    rerender({ v: "b" })
    expect(result.current).toBe("a")

    act(() => vi.advanceTimersByTime(299))
    expect(result.current).toBe("a")

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe("b")
  })

  it("mudanças rápidas: só o último valor sai", () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), {
      initialProps: { v: "a" },
    })

    rerender({ v: "b" })
    act(() => vi.advanceTimersByTime(100))
    rerender({ v: "c" })
    act(() => vi.advanceTimersByTime(100))
    rerender({ v: "d" })
    act(() => vi.advanceTimersByTime(300))

    expect(result.current).toBe("d")
  })
})
