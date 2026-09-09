import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useResourceList } from "./useResourceList"

// key factory de teste no mesmo formato dos módulos
const testKeys = {
  all: ["things"],
  lists: () => [...testKeys.all, "list"],
  list: (params) => [...testKeys.lists(), params],
}

function makeWrapper(queryClient) {
  return function Wrapper({ children }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function setup(options) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const { result } = renderHook(() => useResourceList(options), {
    wrapper: makeWrapper(queryClient),
  })
  return { result, queryClient }
}

const page = (results, count) => ({ results, count: count ?? results.length })

beforeEach(() => vi.clearAllMocks())

describe("useResourceList", () => {
  it("mapeia results/count -> items/totalItems e aplica normalizeList", async () => {
    const fetchPage = vi.fn().mockResolvedValue(page([{ id: 1 }, { id: 2 }], 7))
    const { result } = setup({ keyFactory: testKeys, fetchPage })

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.items).toEqual([{ id: 1 }, { id: 2 }])
    expect(result.current.totalItems).toBe(7)
    expect(result.current.error).toBeNull()
  })

  it("normaliza array cru vindo da API", async () => {
    const fetchPage = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }])
    const { result } = setup({ keyFactory: testKeys, fetchPage })
    await waitFor(() => expect(result.current.items).toHaveLength(3))
    expect(result.current.totalItems).toBe(3)
  })

  it("fetchPage recebe page + filtros não-vazios + ordering", async () => {
    const fetchPage = vi.fn().mockResolvedValue(page([]))
    const { result } = setup({
      keyFactory: testKeys,
      fetchPage,
      emptyFilters: { name: "", status: "" },
    })
    await waitFor(() => expect(fetchPage).toHaveBeenCalled())
    expect(fetchPage).toHaveBeenLastCalledWith({ page: 1 })

    act(() => result.current.applyFilters({ name: "ana", status: "" }))
    await waitFor(() => expect(fetchPage).toHaveBeenLastCalledWith({ page: 1, name: "ana" }))

    act(() => result.current.toggleSort("total"))
    await waitFor(() =>
      expect(fetchPage).toHaveBeenLastCalledWith({ page: 1, name: "ana", ordering: "total" }),
    )
  })

  it("applyFilters volta pra página 1", async () => {
    const fetchPage = vi.fn().mockResolvedValue(page([]))
    const { result } = setup({ keyFactory: testKeys, fetchPage, emptyFilters: { name: "" } })
    await waitFor(() => expect(fetchPage).toHaveBeenCalled())

    act(() => result.current.setCurrentPage(3))
    await waitFor(() => expect(result.current.currentPage).toBe(3))

    act(() => result.current.applyFilters({ name: "x" }))
    await waitFor(() => expect(result.current.currentPage).toBe(1))
  })

  it("toggleSort volta pra página 1", async () => {
    const fetchPage = vi.fn().mockResolvedValue(page([]))
    const { result } = setup({ keyFactory: testKeys, fetchPage, emptyFilters: { name: "" } })
    await waitFor(() => expect(fetchPage).toHaveBeenCalled())

    act(() => result.current.setCurrentPage(4))
    await waitFor(() => expect(result.current.currentPage).toBe(4))

    act(() => result.current.toggleSort("name"))
    await waitFor(() => expect(result.current.currentPage).toBe(1))
  })

  it("sem emptyFilters: filters/applyFilters vêm undefined e o fetch não manda filtro", async () => {
    const fetchPage = vi.fn().mockResolvedValue(page([]))
    const { result } = setup({ keyFactory: testKeys, fetchPage })
    await waitFor(() => expect(fetchPage).toHaveBeenCalled())

    expect(result.current.filters).toBeUndefined()
    expect(result.current.applyFilters).toBeUndefined()
    expect(fetchPage).toHaveBeenLastCalledWith({ page: 1 })
  })

  it("query key: sem filtros usa { page }; com filtros usa { page, filters, ordering }", async () => {
    const fetchPage = vi.fn().mockResolvedValue(page([]))
    const noFilters = setup({ keyFactory: testKeys, fetchPage })
    await waitFor(() => expect(fetchPage).toHaveBeenCalled())
    expect(noFilters.queryClient.getQueryCache().getAll()[0].queryKey).toEqual([
      "things",
      "list",
      { page: 1 },
    ])

    const withFilters = setup({
      keyFactory: testKeys,
      fetchPage,
      emptyFilters: { name: "" },
    })
    await waitFor(() => expect(withFilters.result.current.loading).toBe(false))
    expect(withFilters.queryClient.getQueryCache().getAll()[0].queryKey).toEqual([
      "things",
      "list",
      { page: 1, filters: { name: "" }, ordering: "" },
    ])
  })

  it("erro da API vai pra `error`, não estoura", async () => {
    const fetchPage = vi.fn().mockRejectedValue(new Error("boom"))
    const { result } = setup({ keyFactory: testKeys, fetchPage })
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
    expect(result.current.items).toEqual([])
  })

  it("mudar a página refaz o fetch com a nova página", async () => {
    const fetchPage = vi.fn().mockResolvedValue(page([]))
    const { result } = setup({ keyFactory: testKeys, fetchPage })
    await waitFor(() => expect(fetchPage).toHaveBeenCalled())

    act(() => result.current.setCurrentPage(2))
    await waitFor(() => expect(fetchPage).toHaveBeenLastCalledWith({ page: 2 }))
  })
})
