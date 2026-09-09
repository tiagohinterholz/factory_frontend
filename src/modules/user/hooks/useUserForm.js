import { useAuth } from "@/modules/auth/context/auth-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { UserService } from "@/modules/user/services/user"
import { userSchema, userDefaults, toUserPayload, userKeys } from "../domain"

export function useUserForm() {
  const { businessId } = useAuth()

  return useResourceForm({
    schema: userSchema,
    defaultValues: { ...userDefaults, business_id: businessId ? String(businessId) : "" },
    submit: (values) => UserService.createUser(toUserPayload(values)),
    redirectTo: "/usuarios",
    invalidate: [userKeys.all],
    errorFallback: "Erro ao criar usuário",
  })
}
