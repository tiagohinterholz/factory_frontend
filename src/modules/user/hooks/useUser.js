import { useState } from "react"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { UserService } from "@/modules/user/services/user"
import { normalizeList } from "@/api/normalize-list"
import { userKeys } from "@/modules/user/domain"
import { useToast } from "@/modules/core/feedback/toast-context"

export function useUser() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)

  const query = useQuery({
    queryKey: userKeys.list({ page: currentPage }),
    queryFn: () => UserService.getUser({ page: currentPage }),
    placeholderData: keepPreviousData,
    select: normalizeList,
  })

  const removeMutation = useMutation({
    mutationFn: (id) => UserService.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
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
    currentPage,
    setCurrentPage,
  }
}
