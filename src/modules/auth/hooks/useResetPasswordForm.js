import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useToast } from "@/modules/core/feedback/toast-context"
import { AuthService } from "@/modules/auth/services/auth"
import { resetPasswordSchema, resetPasswordDefaults } from "../domain/schema"

export function useResetPasswordForm({ uidb64, token }) {
  const toast = useToast()

  return useResourceForm({
    schema: resetPasswordSchema,
    defaultValues: resetPasswordDefaults,
    submit: (values) => AuthService.resetPassword(uidb64, token, values.password),
    invalidate: [],
    onSuccess: () => toast.success("Senha redefinida! Faça login com a nova senha."),
    redirectTo: "/login",
    errorFallback: "Não foi possível redefinir a senha. O link pode ter expirado.",
  })
}
