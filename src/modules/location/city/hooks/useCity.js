import { useState } from "react"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { CityService } from "@/modules/location/city/services/city"
import { StateService } from "@/modules/location/state/services/state"
import { useDebouncedValue } from "@/modules/core/hooks/useDebouncedValue"
import { normalizeList } from "@/api/normalize-list"

const QUERY_KEY = "cities"

export function useCities() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const search = useDebouncedValue(searchTerm, 300)

  const query = useQuery({
    queryKey: [QUERY_KEY, { search, page: currentPage }],
    queryFn: () => CityService.getCities({ search, page: currentPage }),
    placeholderData: keepPreviousData,
    select: normalizeList,
  })

  const removeMutation = useMutation({
    mutationFn: (id) => CityService.deleteCity(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })

  return {
    cities: query.data?.results ?? [],
    totalItems: query.data?.count ?? 0,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
    remove: removeMutation.mutateAsync,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
  }
}

// Cidades de um estado, ordenadas por nome. Só busca quando há stateId.
export function useCitiesByState(stateId) {
  const query = useQuery({
    queryKey: [QUERY_KEY, "by-state", stateId],
    queryFn: () => StateService.getCitiesByState(stateId),
    enabled: Boolean(stateId),
    select: (response) => {
      const list = normalizeList(response).results
      return [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    },
  })

  return {
    citiesByState: query.data ?? [],
    loading: query.isFetching,
  }
}
