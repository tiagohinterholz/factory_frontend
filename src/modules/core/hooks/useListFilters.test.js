import { describe, it, expect, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useListFilters } from "./useListFilters"

const EMPTY = { status: "", client_id: "", date_from: "", date_to: "" }

describe("useListFilters", () => {
  it("params omite os campos vazios", () => {
    const { result } = renderHook(() => useListFilters(EMPTY))
    expect(result.current.params).toEqual({})

    act(() => result.current.apply({ ...EMPTY, status: "pendente", client_id: "5" }))
    expect(result.current.params).toEqual({ status: "pendente", client_id: "5" })
  })

  it("apply chama onApplied (reset de página)", () => {
    const onApplied = vi.fn()
    const { result } = renderHook(() => useListFilters(EMPTY, onApplied))

    act(() => result.current.apply({ ...EMPTY, status: "aprovado" }))

    expect(onApplied).toHaveBeenCalledTimes(1)
    expect(result.current.filters.status).toBe("aprovado")
  })
})
