import { useState } from "react"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { BusinessService } from "@/modules/business/services/business"
import { normalizeList } from "@/api/normalize-list"
import { businessKeys } from "@/modules/business/domain"

export function useBusiness() {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)

  const query = useQuery({
    queryKey: businessKeys.list({ page: currentPage }),
    queryFn: () => BusinessService.getBusiness({ page: currentPage }),
    placeholderData: keepPreviousData,
    select: normalizeList,
  })

  const removeMutation = useMutation({
    mutationFn: (id) => BusinessService.deleteBusiness(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: businessKeys.all }),
  })

  return {
    business: query.data?.results ?? [],
    totalItems: query.data?.count ?? 0,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
    remove: removeMutation.mutateAsync,
    currentPage,
    setCurrentPage,
  }
}
