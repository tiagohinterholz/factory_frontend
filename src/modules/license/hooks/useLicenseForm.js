import { useAuth } from "@/modules/auth/context/auth-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { LicenseService } from "@/modules/license/services/license"
import { licenseSchema, licenseDefaults, toLicensePayload } from "../license.schema"

export function useLicenseForm() {
  const { businessId, isSuperUser } = useAuth()

  const { form, onSubmit } = useResourceForm({
    schema: licenseSchema,
    defaultValues: {
      ...licenseDefaults,
      business_id: businessId ? String(businessId) : "",
    },
    submit: (values) =>
      LicenseService.getLicenseRenew(values.business_id, toLicensePayload(values)),
    redirectTo: "/empreendimentos/licencas",
    errorFallback:
      "Erro ao configurar/renovar licença. Verifique se o empreendimento já possui uma base de licença.",
  })

  return { form, onSubmit, isSuperUser }
}
