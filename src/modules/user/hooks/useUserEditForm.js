import { useNavigate, useParams } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { idOf } from "@/api/dto"
import { UserService } from "@/modules/user/services/user"
import { userEditSchema, userEditDefaults, toUserEditPayload, userKeys } from "../domain"

function toUserForm(data) {
  return {
    name: data.name ?? "",
    email: data.email ?? "",
    business_id: idOf(data.business),
    // nome pra exibir quando quem edita não é superuser (não escolhe o
    // empreendimento num <select>, só mostra o nome) — vem prontinho no
    // GET do próprio usuário, sem precisar cruzar com a lista de
    // /empreendimentos/ (que pra um admin comum pode nem trazer nada).
    business_name: data.business?.corporate_name || data.business?.trade_name || "",
    role: data.role ?? "",
  }
}

export function useUserEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { form, onSubmit, loading } = useResourceForm({
    schema: userEditSchema,
    defaultValues: userEditDefaults,
    load: async () => toUserForm(await UserService.getUserById(id)),
    submit: (values) => UserService.updateUser(id, toUserEditPayload(values)),
    redirectTo: "/usuarios",
    invalidate: [userKeys.all],
    errorFallback: "Erro ao atualizar usuário",
  })

  const remove = useResourceAction({
    mutationFn: () => UserService.deleteUser(id),
    confirm: {
      title: "Excluir usuário?",
      message: "Esta pessoa perderá o acesso ao sistema. Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    },
    invalidate: [userKeys.all],
    onSuccess: () => navigate("/usuarios"),
    errorFallback: "Erro ao excluir usuário",
  })

  return { form, onSubmit, loading, handleDelete: remove.run }
}
