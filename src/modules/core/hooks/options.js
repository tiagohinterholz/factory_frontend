import { useQuery } from "@tanstack/react-query"
import { fetchAllPages } from "@/api/fetch-all-pages"
import { BusinessService } from "@/modules/business/services/business"
import { ClientService } from "@/modules/client/services/client"
import { VehicleService } from "@/modules/vehicle/services/vehicle"
import { SupplierService } from "@/modules/supplier/services/supplier"
import { OrderService } from "@/modules/order/services/order"
import { ProductService } from "@/modules/product/services/product"
import { WorkServiceService } from "@/modules/workservice/services/workservice"
import { StateService } from "@/modules/location/state/services/state"

// Listas completas (todas as páginas) pra popular os <select> dos formulários.
// Os hooks de lista (useClient, useVehicle, ...) só trazem a 1ª página — bom pra
// tabela, ruim pro select de edição. `staleTime` alto porque opção muda pouco.
const OPTIONS_STALE = 5 * 60_000

function useOptions(key, fetchPage) {
  return useQuery({
    queryKey: [...key, "options"],
    queryFn: () => fetchAllPages(fetchPage),
    staleTime: OPTIONS_STALE,
  })
}

export function useBusinessOptions() {
  const query = useOptions(["businesses"], (page) => BusinessService.getBusiness({ page }))
  return { business: query.data ?? [], loading: query.isPending }
}

export function useClientOptions() {
  const query = useOptions(["clients"], (page) => ClientService.getClient({ page }))
  return { client: query.data ?? [], loading: query.isPending }
}

export function useVehicleOptions() {
  const query = useOptions(["vehicles"], (page) => VehicleService.getVehicle({ page }))
  return { vehicle: query.data ?? [], loading: query.isPending }
}

export function useSupplierOptions() {
  const query = useOptions(["suppliers"], (page) => SupplierService.getSupplier({ page }))
  return { supplier: query.data ?? [], loading: query.isPending }
}

export function useOrderOptions() {
  const query = useOptions(["orders"], (page) => OrderService.getOrder({ page }))
  return { orders: query.data ?? [], loading: query.isPending }
}

export function useProductOptions() {
  const query = useOptions(["products"], (page) => ProductService.getProduct({ page }))
  return { product: query.data ?? [], loading: query.isPending }
}

export function useWorkServiceOptions() {
  const query = useOptions(["workservices"], (page) => WorkServiceService.getWorkService({ page }))
  return { workservice: query.data ?? [], loading: query.isPending }
}

export function useStateOptions() {
  const query = useOptions(["states"], (page) => StateService.getStates({ page }))
  return { states: query.data ?? [], loading: query.isPending }
}

export function useCityOptionsByState(stateId) {
  const query = useQuery({
    queryKey: ["cities", "options", "by-state", stateId],
    queryFn: () => fetchAllPages((page) => StateService.getCitiesByState(stateId, page)),
    enabled: Boolean(stateId),
    staleTime: OPTIONS_STALE,
    select: (list) => [...list].sort((a, b) => (a.name || "").localeCompare(b.name || "")),
  })
  return { citiesByState: query.data ?? [], loading: query.isFetching }
}
