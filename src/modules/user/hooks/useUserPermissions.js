import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { UserService } from "@/modules/user/services/user"
import { userKeys } from "@/modules/user/domain"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"

// Permissão extra de UM usuário específico, além do que o papel dele já dá
// (backend: users.can_manage_permissions, só o Administrador). PATCH manda
// o conjunto inteiro marcado, não soma/subtrai em cima do que já tinha.
export function useUserPermissions(userId) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const queryKey = userKeys.permissions(userId)

  const query = useQuery({
    queryKey,
    queryFn: () => UserService.getUserPermissions(userId),
    enabled: Boolean(userId),
  })

  const mutation = useMutation({
    mutationFn: (codenames) =>
      UserService.updateUserPermissions(userId, { permissions: codenames }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, (current) => ({ ...current, ...data }))
      toast.success("Permissões atualizadas.")
    },
    onError: (error) => {
      toast.error(parseApiError(error, "Não foi possível salvar as permissões.").message)
    },
  })

  return {
    assignable: query.data?.assignable ?? [],
    loading: query.isPending,
    error: query.error ?? null,
    save: (codenames) => mutation.mutateAsync(codenames),
    saving: mutation.isPending,
  }
}
