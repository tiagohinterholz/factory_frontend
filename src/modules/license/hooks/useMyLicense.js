import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/modules/auth/context/auth-context"
import { LicenseService } from "@/modules/license/services/license"
import { licenseKeys } from "@/modules/license/domain"

// Licença do próprio negócio (self, singular). Superusuário não tem
// negócio vinculado — nem dispara a query, pra não gastar request num 400
// esperado nem ficar "carregando" pra sempre com a query desabilitada.
export function useMyLicense() {
  const { isSuperUser } = useAuth()

  const query = useQuery({
    queryKey: licenseKeys.mine,
    queryFn: () => LicenseService.getMyLicense(),
    enabled: !isSuperUser,
  })

  return {
    license: query.data ?? null,
    loading: !isSuperUser && query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
  }
}
