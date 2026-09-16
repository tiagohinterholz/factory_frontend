import { useState } from "react"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { AuthService } from "@/modules/auth/services/auth"
import { forgotPasswordSchema, forgotPasswordDefaults } from "../domain/schema"

// Sem redirectTo de propósito: a resposta é sempre a mesma mensagem
// genérica, então fica na própria tela mostrando "e-mail enviado" em vez
// de navegar pra algum lugar.
export function useForgotPasswordForm() {
  const [sent, setSent] = useState(false)

  const { form, onSubmit } = useResourceForm({
    schema: forgotPasswordSchema,
    defaultValues: forgotPasswordDefaults,
    submit: (values) => AuthService.forgotPassword(values.email),
    invalidate: [],
    onSuccess: () => setSent(true),
    errorFallback: "Não foi possível enviar o e-mail. Tente novamente.",
  })

  return { form, onSubmit, sent }
}
