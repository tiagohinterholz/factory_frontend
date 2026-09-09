import { useAuth } from "@/modules/auth/context/auth-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { UserService } from "@/modules/user/services/user"
import { userSchema, userDefaults, toUserPayload } from "../domain"

export function useUserForm() {
  const { businessId } = useAuth()

  return useResourceForm({
    schema: userSchema,
    defaultValues: { ...userDefaults, business_id: businessId ? String(businessId) : "" },
    submit: (values) => UserService.createUser(toUserPayload(values)),
    redirectTo: "/usuarios",
    errorFallback: "Erro ao criar usuário",
  })
}
