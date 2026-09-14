import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { UserService } from "@/modules/user/services/user"
import { changePasswordSchema, changePasswordDefaults, toChangePasswordPayload } from "../domain"

// Não usa useResourceForm de propósito: o back devolve erro ora em
// { detail: "..." } (senha fraca), ora em { error: "..." } (senha atual
// incorreta) — parseApiError já extrai a mensagem certa dos dois formatos,
// mas o useResourceForm trataria a chave "error" como um campo de form e
// chamaria setError("error", ...) em vez de toast (mensagem sumiria, já que
// nenhum campo se chama "error"). useResourceAction sempre mostra toast,
// então não cai nessa armadilha.
export function useChangePasswordForm() {
  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: changePasswordDefaults,
  })

  const action = useResourceAction({
    mutationFn: (values) => UserService.changePassword(toChangePasswordPayload(values)),
    success: "Senha alterada com sucesso.",
    errorFallback: "Não foi possível alterar a senha.",
    onSuccess: () => form.reset(changePasswordDefaults),
  })

  const onSubmit = form.handleSubmit((values) => action.run(values))

  return { form, onSubmit, submitting: action.pending }
}
