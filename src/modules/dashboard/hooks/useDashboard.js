import { useQuery } from "@tanstack/react-query"
import { DashboardService } from "@/modules/dashboard/services/dashboard"
import { dashboardKeys } from "../domain"

export function useDashboard() {
  const query = useQuery({
    queryKey: dashboardKeys.all,
    queryFn: () => DashboardService.getDashboard(),
    staleTime: 60_000,
  })

  return {
    data: query.data ?? null,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
  }
}
