import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { LicenseService } from "@/modules/license/services/license"
import { licenseRenewSchema, licenseRenewDefaults } from "../domain"

// Renovação/upgrade de licença (4.4.2): sem business_id (sempre o próprio
// negócio) e sem `load` — não é editar nada existente, é sempre gerar uma
// cobrança nova. No sucesso, navega pra tela de espera do pagamento (mesmo
// padrão do checkout público em SignupPayment.jsx); a licença em si só é
// atualizada de fato quando o pagamento é confirmado.
export function useMyLicenseRenewForm() {
  return useResourceForm({
    schema: licenseRenewSchema,
    defaultValues: licenseRenewDefaults,
    submit: (values) => LicenseService.renewMyLicense(values),
    redirectTo: (payment) => `/configuracoes/licenca/pagamento/${payment.id}`,
    errorFallback: "Erro ao gerar a cobrança de renovação",
  })
}
