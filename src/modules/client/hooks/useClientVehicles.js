import { useQuery } from "@tanstack/react-query"
import { ClientService } from "@/modules/client/services/client"
import { normalizeList } from "@/api/normalize-list"

// Veículos vinculados a um cliente (endpoint aninhado /clientes/:id/veiculos/).
export function useClientVehicles(clientId) {
  const query = useQuery({
    queryKey: ["vehicles", "by-client", clientId],
    queryFn: () => ClientService.vehicleByClient(clientId),
    enabled: Boolean(clientId),
    select: normalizeList,
  })

  return {
    vehicles: query.data?.results ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
  }
}
