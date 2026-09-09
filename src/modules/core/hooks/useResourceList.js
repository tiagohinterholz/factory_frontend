import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { useListFilters } from "@/modules/core/hooks/useListFilters"
import { useListSort } from "@/modules/core/hooks/useListSort"
import { normalizeList } from "@/api/normalize-list"

// Estado de uma listagem paginada: useQuery + filtros + ordenação + página, já
// ligados entre si — trocar filtro ou ordenação volta pra página 1.
//
//   keyFactory   — objeto de query keys do módulo (precisa ter .list(params))
//   fetchPage    — (params) => Promise  (params já vem com page + filtros + ordering)
//   emptyFilters — objeto de filtros zerados; omitido = listagem sem filtros/sort
//
// Devolve { items, totalItems, loading, error, refetch, filters, applyFilters,
//           ordering, toggleSort, currentPage, setCurrentPage }. `filters` e
// `applyFilters` vêm undefined quando não há `emptyFilters`.
export function useResourceList({ keyFactory, fetchPage, emptyFilters }) {
  const [currentPage, setCurrentPage] = useState(1)
  const hasFilters = Boolean(emptyFilters)

  const filtersState = useListFilters(emptyFilters ?? {}, () => setCurrentPage(1))
  const { ordering, toggle: toggleSort } = useListSort(() => setCurrentPage(1))

  const filters = hasFilters ? filtersState.filters : undefined
  const filterParams = hasFilters ? filtersState.params : {}

  const listParams = hasFilters ? { page: currentPage, filters, ordering } : { page: currentPage }

  const query = useQuery({
    queryKey: keyFactory.list(listParams),
    queryFn: () =>
      fetchPage({
        page: currentPage,
        ...filterParams,
        ...(ordering ? { ordering } : {}),
      }),
    placeholderData: keepPreviousData,
    select: normalizeList,
  })

  return {
    items: query.data?.results ?? [],
    totalItems: query.data?.count ?? 0,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
    filters,
    applyFilters: hasFilters ? filtersState.apply : undefined,
    ordering,
    toggleSort,
    currentPage,
    setCurrentPage,
  }
}
