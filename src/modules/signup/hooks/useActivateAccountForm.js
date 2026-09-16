import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useToast } from "@/modules/core/feedback/toast-context"
import { SignupService } from "@/modules/signup/services/signup"
import { activateAccountSchema, activateAccountDefaults } from "../domain"

export function useActivateAccountForm({ uidb64, token }) {
  const toast = useToast()

  return useResourceForm({
    schema: activateAccountSchema,
    defaultValues: activateAccountDefaults,
    submit: (values) => SignupService.activateAccount(uidb64, token, values.password),
    invalidate: [],
    onSuccess: () => toast.success("Conta ativada! Faça login pra começar."),
    redirectTo: "/login",
    errorFallback: "Não foi possível ativar a conta. O link pode ter expirado.",
  })
}
