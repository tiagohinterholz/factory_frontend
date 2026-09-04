import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { StateService } from "@/modules/location/state/services/state"
import { useDebouncedValue } from "@/modules/core/hooks/useDebouncedValue"
import { normalizeList } from "@/api/normalize-list"

export function useStates() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const search = useDebouncedValue(searchTerm, 300)

  const query = useQuery({
    queryKey: ["states", { search, page: currentPage }],
    queryFn: () => StateService.getStates({ search, page: currentPage }),
    placeholderData: keepPreviousData,
    select: normalizeList,
  })

  return {
    states: query.data?.results ?? [],
    totalItems: query.data?.count ?? 0,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
  }
}
