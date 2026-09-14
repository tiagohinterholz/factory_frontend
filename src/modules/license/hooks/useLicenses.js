import { LicenseService } from "@/modules/license/services/license"
import { licenseKeys } from "@/modules/license/domain"
import { useResourceList } from "@/modules/core/hooks/useResourceList"

// Navegação de licenças de outros negócios (superusuário) — só leitura,
// GET /licencas/. Renovar por ID saiu do contrato, sem endpoint substituto.
export function useLicenses() {
  const list = useResourceList({
    keyFactory: licenseKeys,
    fetchPage: (params) => LicenseService.getLicenses(params),
  })

  const { items, ...rest } = list
  return { ...rest, licenses: items }
}
