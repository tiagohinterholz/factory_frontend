import { useState } from "react"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { WorkService } from "@/modules/workservice/services/workservice"
import { useDebouncedValue } from "@/modules/core/hooks/useDebouncedValue"
import { normalizeList } from "@/api/normalize-list"

const QUERY_KEY = "workservices"

export function useWorkService() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const search = useDebouncedValue(searchTerm, 300)

  const query = useQuery({
    queryKey: [QUERY_KEY, { search, page: currentPage }],
    queryFn: () => WorkService.getWorkService({ search, page: currentPage }),
    placeholderData: keepPreviousData,
    select: normalizeList,
  })

  const removeMutation = useMutation({
    mutationFn: (id) => WorkService.deleteWorkService(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })

  return {
    workservice: query.data?.results ?? [],
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
