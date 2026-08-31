import { useAuth } from "@/modules/auth/context/auth-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { ClientService } from "@/modules/client/services/client"
import { clientSchema, clientDefaults, toClientPayload } from "../client.schema"

export function useClientForm() {
  const { businessId } = useAuth()

  return useResourceForm({
    schema: clientSchema,
    defaultValues: { ...clientDefaults, business_id: businessId ? String(businessId) : "" },
    submit: (values) => ClientService.createClient(toClientPayload(values)),
    redirectTo: "/clientes",
    errorFallback: "Erro ao criar cliente. Verifique se os dados estão corretos.",
  })
}
