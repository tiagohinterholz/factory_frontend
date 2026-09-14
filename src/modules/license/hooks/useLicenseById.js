import { useQuery } from "@tanstack/react-query"
import { LicenseService } from "@/modules/license/services/license"
import { licenseKeys } from "@/modules/license/domain"

// Detalhe de uma licença específica (superusuário, só leitura — GET
// /licencas/<id>/). Renovar por ID saiu do contrato.
export function useLicenseById(id) {
  const query = useQuery({
    queryKey: licenseKeys.detail(id),
    queryFn: () => LicenseService.getLicenseById(id),
    enabled: Boolean(id),
  })

  return {
    license: query.data ?? null,
    loading: query.isPending,
    error: query.error ?? null,
  }
}
