import { describe, it, expect, vi } from "vitest"
import { fetchAllPages } from "./fetch-all-pages"

// helper: simula um back paginado (DRF-like) com `size` itens por página
function paginatedBackend(total, size) {
  const items = Array.from({ length: total }, (_, i) => ({ id: i + 1 }))
  return vi.fn((page) => {
    const start = (page - 1) * size
    return Promise.resolve({
      count: total,
      results: items.slice(start, start + size),
    })
  })
}

describe("fetchAllPages", () => {
  it("uma página só (total <= tamanho da página) não busca página 2", async () => {
    const fetchPage = paginatedBackend(5, 10)

    const results = await fetchAllPages(fetchPage)

    expect(results).toHaveLength(5)
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })

  it("busca todas as páginas e junta os resultados na ordem, incluindo a 1ª", async () => {
    const fetchPage = paginatedBackend(23, 10)

    const results = await fetchAllPages(fetchPage)

    expect(results).toHaveLength(23)
    expect(results.map((r) => r.id)).toEqual(Array.from({ length: 23 }, (_, i) => i + 1))
    expect(fetchPage).toHaveBeenCalledTimes(3)
  })

  it("não depende de um tamanho de página chumbado — funciona com qualquer PAGE_SIZE do back", async () => {
    const fetchPage = paginatedBackend(9, 4)

    const results = await fetchAllPages(fetchPage)

    expect(results).toHaveLength(9)
    expect(fetchPage).toHaveBeenCalledTimes(3)
  })

  it("array cru (sem paginação) devolve ele mesmo", async () => {
    const fetchPage = vi.fn(() => Promise.resolve([{ id: 1 }, { id: 2 }]))

    const results = await fetchAllPages(fetchPage)

    expect(results).toEqual([{ id: 1 }, { id: 2 }])
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })

  it("respeita o limite de maxPages", async () => {
    const fetchPage = paginatedBackend(100, 10)

    const results = await fetchAllPages(fetchPage, { maxPages: 2 })

    expect(results).toHaveLength(20)
    expect(fetchPage).toHaveBeenCalledTimes(2)
  })
})
