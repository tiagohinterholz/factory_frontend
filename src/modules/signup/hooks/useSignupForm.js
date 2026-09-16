import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { SignupService } from "@/modules/signup/services/signup"
import { signupSchema, signupDefaults } from "../domain"

export function useSignupForm({ period }) {
  return useResourceForm({
    schema: signupSchema,
    defaultValues: {
      ...signupDefaults,
      period: period || "",
    },
    submit: (values) => SignupService.create(values),
    // não é lista cacheada nenhuma (visitante anônimo, sem sessão) — não
    // tem o que invalidar, só evita o refetch global padrão do hook.
    invalidate: [],
    redirectTo: (result) => `/assinar/${result.id}/pagamento`,
    errorFallback: "Não foi possível concluir o cadastro. Verifique os dados.",
  })
}
