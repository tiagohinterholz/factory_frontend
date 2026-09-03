import { useQuery } from "@tanstack/react-query"
import { VehicleService } from "@/modules/vehicle/services/vehicle"

// Histórico de OS e orçamentos de um veículo (endpoints /ordens/veiculo/<id>/
// e /orcamentos/veiculo/<id>/ — arrays diretos).
export function useVehicleHistory(vehicleId) {
  const orders = useQuery({
    queryKey: ["vehicle-orders", vehicleId],
    queryFn: () => VehicleService.getVehicleOrders(vehicleId),
    enabled: Boolean(vehicleId),
  })

  const budgets = useQuery({
    queryKey: ["vehicle-budgets", vehicleId],
    queryFn: () => VehicleService.getVehicleBudgets(vehicleId),
    enabled: Boolean(vehicleId),
  })

  return {
    orders: orders.data ?? [],
    budgets: budgets.data ?? [],
    loading: orders.isPending || budgets.isPending,
    error: orders.error ?? budgets.error ?? null,
  }
}
