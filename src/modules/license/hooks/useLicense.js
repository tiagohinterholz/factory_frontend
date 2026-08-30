import { useQuery } from "@tanstack/react-query"
import { LicenseService } from "@/modules/license/services/license"

export function useLicense() {
  const query = useQuery({
    queryKey: ["licenses"],
    queryFn: () => LicenseService.getLicense(),
  })

  return {
    license: query.data ?? [],
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
  }
}
