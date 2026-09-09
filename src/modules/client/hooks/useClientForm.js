import { useAuth } from "@/modules/auth/context/auth-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { ClientService } from "@/modules/client/services/client"
import { clientSchema, clientDefaults, toClientPayload, clientKeys } from "../domain"
import { dashboardKeys } from "@/modules/dashboard/domain"

export function useClientForm() {
  const { businessId } = useAuth()

  return useResourceForm({
    schema: clientSchema,
    defaultValues: { ...clientDefaults, business_id: businessId ? String(businessId) : "" },
    submit: (values) => ClientService.createClient(toClientPayload(values)),
    redirectTo: "/clientes",
    invalidate: [clientKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao criar cliente. Verifique se os dados estão corretos.",
  })
}
