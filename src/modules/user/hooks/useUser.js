import { useState } from "react"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { UserService } from "@/modules/user/services/user"
import { useDebouncedValue } from "@/modules/core/hooks/useDebouncedValue"
import { normalizeList } from "@/api/normalize-list"
import { useToast } from "@/modules/core/feedback/toast-context"

const QUERY_KEY = "users"

export function useUser() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const search = useDebouncedValue(searchTerm, 300)

  const query = useQuery({
    queryKey: [QUERY_KEY, { search, page: currentPage }],
    queryFn: () => UserService.getUser({ search, page: currentPage }),
    placeholderData: keepPreviousData,
    select: normalizeList,
  })

  const removeMutation = useMutation({
    mutationFn: (id) => UserService.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
    onError: (mutationError) => {
      console.error("Erro ao excluir usuário:", mutationError)
      toast.error("Erro ao excluir usuário.")
    },
  })

  return {
    user: query.data?.results ?? [],
    totalItems: query.data?.count ?? 0,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
    handleDelete: removeMutation.mutate,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
  }
}
