import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { UserService } from "@/modules/user/services/user"
import { normalizeList } from "@/api/normalize-list"
import { userKeys } from "@/modules/user/domain"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

export function useUser() {
  const [currentPage, setCurrentPage] = useState(1)

  const query = useQuery({
    queryKey: userKeys.list({ page: currentPage }),
    queryFn: () => UserService.getUser({ page: currentPage }),
    placeholderData: keepPreviousData,
    select: normalizeList,
  })

  const remove = useResourceAction({
    mutationFn: (item) => UserService.deleteUser(item.id),
    confirm: (item) => ({
      title: "Excluir usuário?",
      message: `"${item.name}" perderá o acesso ao sistema.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [userKeys.all],
    errorFallback: "Erro ao excluir usuário.",
  })

  return {
    user: query.data?.results ?? [],
    totalItems: query.data?.count ?? 0,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
    remove: remove.run,
    currentPage,
    setCurrentPage,
  }
}
