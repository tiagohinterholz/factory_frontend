import { useQuery } from "@tanstack/react-query"
import { DashboardService } from "@/modules/dashboard/services/dashboard"

export function useDashboard() {
  const query = useQuery({
    queryKey: ["dashboard"],
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
