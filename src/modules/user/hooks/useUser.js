import { UserService } from "@/modules/user/services/user"
import { userKeys } from "@/modules/user/domain"
import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

export function useUser() {
  const list = useResourceList({
    keyFactory: userKeys,
    fetchPage: (params) => UserService.getUser(params),
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

  const { items, ...rest } = list
  return { ...rest, user: items, remove: remove.run }
}
