import { useQuery } from "@tanstack/react-query"
import { fetchAllPages } from "@/api/fetch-all-pages"
import { BusinessService } from "@/modules/business"
import { businessKeys } from "@/modules/business/domain"
import { ClientService } from "@/modules/client"
import { clientKeys } from "@/modules/client/domain"
import { VehicleService } from "@/modules/vehicle"
import { vehicleKeys } from "@/modules/vehicle/domain"
import { SupplierService } from "@/modules/supplier"
import { supplierKeys } from "@/modules/supplier/domain"
import { OrderService } from "@/modules/order"
import { orderKeys } from "@/modules/order/domain"
import { BudgetService } from "@/modules/budget"
import { budgetKeys } from "@/modules/budget/domain"
import { ProductService } from "@/modules/product"
import { productKeys } from "@/modules/product/domain"
import { WorkServiceService } from "@/modules/workservice"
import { workServiceKeys } from "@/modules/workservice/domain"
import { StateService } from "@/modules/location"
import { stateKeys } from "@/modules/location/state/domain"
import { cityKeys } from "@/modules/location/city/domain"
import { ManufacturerService } from "@/modules/manufacturer"
import { manufacturerKeys } from "@/modules/manufacturer/domain"
import { ProductCategoryService } from "@/modules/productcategory"
import { productCategoryKeys } from "@/modules/productcategory/domain"

// Listas completas (todas as páginas) pra popular os <select> dos formulários.
// Os hooks de lista (useClient, useVehicle, ...) só trazem a 1ª página — bom pra
// tabela, ruim pro select de edição. `staleTime` alto porque opção muda pouco.
const OPTIONS_STALE = 5 * 60_000

// `keyFactory` sempre a factory do módulo (nunca array na mão) — assim um
// rename futuro de um `.all` não quebra a invalidação silenciosamente.
function useOptions(keyFactory, fetchPage) {
  return useQuery({
    queryKey: [...keyFactory.all, "options"],
    queryFn: () => fetchAllPages(fetchPage),
    staleTime: OPTIONS_STALE,
  })
}

export function useBusinessOptions() {
  const query = useOptions(businessKeys, (page) => BusinessService.getBusiness({ page }))
  return { business: query.data ?? [], loading: query.isPending }
}

export function useClientOptions() {
  const query = useOptions(clientKeys, (page) => ClientService.getClient({ page }))
  return { client: query.data ?? [], loading: query.isPending }
}

export function useVehicleOptions() {
  const query = useOptions(vehicleKeys, (page) => VehicleService.getVehicle({ page }))
  return { vehicle: query.data ?? [], loading: query.isPending }
}

export function useSupplierOptions() {
  const query = useOptions(supplierKeys, (page) => SupplierService.getSupplier({ page }))
  return { supplier: query.data ?? [], loading: query.isPending }
}

export function useOrderOptions() {
  const query = useOptions(orderKeys, (page) => OrderService.getOrder({ page }))
  return { orders: query.data ?? [], loading: query.isPending }
}

export function useBudgetOptions() {
  const query = useOptions(budgetKeys, (page) => BudgetService.getBudget({ page }))
  return { budgets: query.data ?? [], loading: query.isPending }
}

export function useProductOptions() {
  const query = useOptions(productKeys, (page) => ProductService.getProduct({ page }))
  return { product: query.data ?? [], loading: query.isPending }
}

export function useWorkServiceOptions() {
  const query = useOptions(workServiceKeys, (page) => WorkServiceService.getWorkService({ page }))
  return { workservice: query.data ?? [], loading: query.isPending }
}

export function useStateOptions() {
  const query = useOptions(stateKeys, (page) => StateService.getStates({ page }))
  return { states: query.data ?? [], loading: query.isPending }
}

export function useCityOptionsByState(stateId) {
  const query = useQuery({
    queryKey: [...cityKeys.byState(stateId), "options"],
    queryFn: () => fetchAllPages((page) => StateService.getCitiesByState(stateId, page)),
    enabled: Boolean(stateId),
    staleTime: OPTIONS_STALE,
    select: (list) => [...list].sort((a, b) => (a.name || "").localeCompare(b.name || "")),
  })
  return { citiesByState: query.data ?? [], loading: query.isFetching }
}

export function useManufacturerOptions() {
  const query = useOptions(manufacturerKeys, (page) =>
    ManufacturerService.getManufacturers({ page }),
  )
  return { manufacturers: query.data ?? [], loading: query.isPending }
}

export function useModelOptionsByManufacturer(manufacturerId) {
  const query = useQuery({
    queryKey: [...manufacturerKeys.modelsByManufacturer(manufacturerId), "options"],
    queryFn: () =>
      fetchAllPages((page) =>
        ManufacturerService.getModelsByManufacturer(manufacturerId, { page }),
      ),
    enabled: Boolean(manufacturerId),
    staleTime: OPTIONS_STALE,
    select: (list) => [...list].sort((a, b) => (a.name || "").localeCompare(b.name || "")),
  })
  return { modelsByManufacturer: query.data ?? [], loading: query.isFetching }
}

export function useProductCategoryOptions() {
  const query = useOptions(productCategoryKeys, (page) =>
    ProductCategoryService.getProductCategories({ page }),
  )
  return { productCategories: query.data ?? [], loading: query.isPending }
}

export function useProductSubcategoryOptionsByCategory(categoryId) {
  const query = useQuery({
    queryKey: [...productCategoryKeys.subcategoriesByCategory(categoryId), "options"],
    queryFn: () =>
      fetchAllPages((page) =>
        ProductCategoryService.getSubcategoriesByCategory(categoryId, { page }),
      ),
    enabled: Boolean(categoryId),
    staleTime: OPTIONS_STALE,
    select: (list) => [...list].sort((a, b) => (a.name || "").localeCompare(b.name || "")),
  })
  return { subcategoriesByCategory: query.data ?? [], loading: query.isFetching }
}
