import { useQuery } from "@tanstack/react-query"
import { normalizeList } from "@/api/normalize-list"
import { OrderService } from "@/modules/order"
import { BudgetService } from "@/modules/budget"
import { orderKeys } from "@/modules/order/domain"
import { budgetKeys } from "@/modules/budget/domain"

export function useClientRecords(clientId) {
  const orders = useQuery({
    queryKey: [...orderKeys.all, "by-client", clientId],
    queryFn: () => OrderService.getOrder({ client_id: clientId, ordering: "-created_at" }),
    enabled: Boolean(clientId),
    select: normalizeList,
  })
  const budgets = useQuery({
    queryKey: [...budgetKeys.all, "by-client", clientId],
    queryFn: () => BudgetService.getBudget({ client_id: clientId, ordering: "-created_at" }),
    enabled: Boolean(clientId),
    select: normalizeList,
  })
  return {
    orders: orders.data?.results ?? [],
    budgets: budgets.data?.results ?? [],
  }
}
