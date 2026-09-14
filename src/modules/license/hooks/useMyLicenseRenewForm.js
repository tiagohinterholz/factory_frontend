import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { LicenseService } from "@/modules/license/services/license"
import {
  licenseRenewSchema,
  licenseRenewDefaults,
  toLicenseRenewPayload,
  licenseKeys,
} from "../domain"
import { businessKeys } from "@/modules/business/domain"

// Renovação self-service: sem business_id (sempre o próprio negócio) e sem
// navegar pra outra tela — fica na mesma página, mostrando os dados
// atualizados.
export function useMyLicenseRenewForm() {
  return useResourceForm({
    schema: licenseRenewSchema,
    defaultValues: licenseRenewDefaults,
    load: async () => {
      const data = await LicenseService.getMyLicense()
      return {
        period: data.period ?? "MENSAL",
        max_users: String(data.max_users ?? 1),
      }
    },
    submit: (values) => LicenseService.renewMyLicense(toLicenseRenewPayload(values)),
    invalidate: [licenseKeys.mine, businessKeys.all],
    errorFallback: "Erro ao renovar a licença",
  })
}
