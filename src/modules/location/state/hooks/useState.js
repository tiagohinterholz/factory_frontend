import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { StateService } from "@/modules/location/state/services/state"
import { normalizeList } from "@/api/normalize-list"

export function useStates() {
  const [currentPage, setCurrentPage] = useState(1)

  const query = useQuery({
    queryKey: ["states", { page: currentPage }],
    queryFn: () => StateService.getStates({ page: currentPage }),
    placeholderData: keepPreviousData,
    select: normalizeList,
  })

  return {
    states: query.data?.results ?? [],
    totalItems: query.data?.count ?? 0,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
    currentPage,
    setCurrentPage,
  }
}
