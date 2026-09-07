import { useState } from "react"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { ClientService } from "@/modules/client/services/client"
import { useListFilters } from "@/modules/core/hooks/useListFilters"
import { normalizeList } from "@/api/normalize-list"

const QUERY_KEY = "clients"
const EMPTY_FILTERS = { name: "", cpf: "" }

export function useClient() {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const {
    filters,
    apply: applyFilters,
    params: filterParams,
  } = useListFilters(EMPTY_FILTERS, () => setCurrentPage(1))

  const query = useQuery({
    queryKey: [QUERY_KEY, { page: currentPage, filters }],
    queryFn: () => ClientService.getClient({ page: currentPage, ...filterParams }),
    placeholderData: keepPreviousData,
    select: normalizeList,
  })

  const removeMutation = useMutation({
    mutationFn: (id) => ClientService.deleteClient(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })

  return {
    client: query.data?.results ?? [],
    totalItems: query.data?.count ?? 0,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
    remove: removeMutation.mutateAsync,
    filters,
    applyFilters,
    currentPage,
    setCurrentPage,
  }
}
