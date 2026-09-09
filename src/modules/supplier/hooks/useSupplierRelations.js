import { useQuery } from "@tanstack/react-query"
import { SupplierService } from "@/modules/supplier/services/supplier"
import { normalizeList } from "@/api/normalize-list"
import { productKeys } from "@/modules/product/domain"
import { workServiceKeys } from "@/modules/workservice/domain"

// Produtos e serviços fornecidos por um fornecedor
// (endpoints aninhados /fornecedores/:id/produtos/ e /servicos/).
export function useSupplierRelations(supplierId) {
  const enabled = Boolean(supplierId)

  const productsQuery = useQuery({
    queryKey: productKeys.bySupplier(supplierId),
    queryFn: () => SupplierService.getProductBySupplier(supplierId),
    enabled,
    select: normalizeList,
  })

  const servicesQuery = useQuery({
    queryKey: workServiceKeys.bySupplier(supplierId),
    queryFn: () => SupplierService.getServiceBySupplier(supplierId),
    enabled,
    select: normalizeList,
  })

  return {
    products: productsQuery.data?.results ?? [],
    services: servicesQuery.data?.results ?? [],
    loading: productsQuery.isLoading || servicesQuery.isLoading,
    error: productsQuery.error ?? servicesQuery.error ?? null,
  }
}
