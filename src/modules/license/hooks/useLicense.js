import { useQuery } from "@tanstack/react-query"
import { LicenseService } from "@/modules/license/services/license"
import { licenseKeys } from "@/modules/license/domain"

export function useLicense() {
  const query = useQuery({
    queryKey: licenseKeys.all,
    queryFn: () => LicenseService.getLicense(),
  })

  return {
    license: query.data ?? [],
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
  }
}
