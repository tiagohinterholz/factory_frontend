import { useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { idOf } from "@/api/dto"
import { UserService } from "@/modules/user/services/user"
import { userEditSchema, userEditDefaults, toUserEditPayload } from "../user.schema"

function toUserForm(data) {
  return {
    name: data.name ?? "",
    email: data.email ?? "",
    business_id: idOf(data.business),
    role: data.role ?? "",
    password: "",
    confirmPassword: "",
  }
}

export function useUserEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const queryClient = useQueryClient()

  const { form, onSubmit, loading } = useResourceForm({
    schema: userEditSchema,
    defaultValues: userEditDefaults,
    load: async () => toUserForm(await UserService.getUserById(id)),
    submit: (values) => UserService.updateUser(id, toUserEditPayload(values)),
    redirectTo: "/usuarios",
    errorFallback: "Erro ao atualizar usuário",
  })

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Excluir usuário?",
      message: "Esta pessoa perderá o acesso ao sistema. Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return
    await UserService.deleteUser(id)
    queryClient.invalidateQueries()
    navigate("/usuarios")
  }

  return { form, onSubmit, loading, handleDelete }
}
