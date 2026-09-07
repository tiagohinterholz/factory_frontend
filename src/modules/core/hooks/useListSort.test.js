import { describe, it, expect, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useListSort } from "./useListSort"

describe("useListSort", () => {
  it("cicla no mesmo campo: asc -> desc -> sem ordenação", () => {
    const { result } = renderHook(() => useListSort())
    expect(result.current.ordering).toBe("")

    act(() => result.current.toggle("total"))
    expect(result.current.ordering).toBe("total")

    act(() => result.current.toggle("total"))
    expect(result.current.ordering).toBe("-total")

    act(() => result.current.toggle("total"))
    expect(result.current.ordering).toBe("")
  })

  it("trocar de campo começa em asc", () => {
    const { result } = renderHook(() => useListSort())
    act(() => result.current.toggle("total"))
    act(() => result.current.toggle("status"))
    expect(result.current.ordering).toBe("status")
  })

  it("toggle chama onChanged (reset de página)", () => {
    const onChanged = vi.fn()
    const { result } = renderHook(() => useListSort(onChanged))
    act(() => result.current.toggle("total"))
    expect(onChanged).toHaveBeenCalledTimes(1)
  })
})
