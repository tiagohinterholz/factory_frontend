import { useQuery } from "@tanstack/react-query"
import { PurchaseOrderService } from "@/modules/purchase/services/purchase-orders"
import { stockMovementKeys } from "@/modules/purchase/domain"
import { normalizeList } from "@/api/normalize-list"

// Kardex de um produto — "mostra o histórico de estoque desse produto".
export function useStockMovements(productId) {
  const query = useQuery({
    queryKey: stockMovementKeys.list({ productId }),
    enabled: Boolean(productId),
    queryFn: () => PurchaseOrderService.getStockMovements({ product_id: productId }),
    select: normalizeList,
  })

  return {
    movements: query.data?.results ?? [],
    loading: query.isPending,
    error: query.error ?? null,
  }
}
