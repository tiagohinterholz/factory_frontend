import { useQuery } from "@tanstack/react-query"
import { VehicleService } from "@/modules/vehicle/services/vehicle"
import { orderKeys } from "@/modules/order/domain"
import { budgetKeys } from "@/modules/budget/domain"

// Histórico de OS e orçamentos de um veículo (endpoints /ordens/veiculo/<id>/
// e /orcamentos/veiculo/<id>/ — arrays diretos). As query keys vivem dentro
// de orderKeys/budgetKeys (não de vehicleKeys) justamente pra que invalidar
// orderKeys.all/budgetKeys.all — o que toda mutation de OS/orçamento já faz —
// também invalide esse histórico por prefixo, sem precisar saber o vehicleId.
export function useVehicleHistory(vehicleId) {
  const orders = useQuery({
    queryKey: orderKeys.byVehicle(vehicleId),
    queryFn: () => VehicleService.getVehicleOrders(vehicleId),
    enabled: Boolean(vehicleId),
  })

  const budgets = useQuery({
    queryKey: budgetKeys.byVehicle(vehicleId),
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
