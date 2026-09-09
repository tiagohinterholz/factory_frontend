import { useState } from "react"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { VehicleService } from "@/modules/vehicle/services/vehicle"
import { useListFilters } from "@/modules/core/hooks/useListFilters"
import { useListSort } from "@/modules/core/hooks/useListSort"
import { normalizeList } from "@/api/normalize-list"
import { vehicleKeys } from "@/modules/vehicle/domain"

const EMPTY_FILTERS = { model: "", plate: "", color: "", client: "" }

export function useVehicle() {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const {
    filters,
    apply: applyFilters,
    params: filterParams,
  } = useListFilters(EMPTY_FILTERS, () => setCurrentPage(1))
  const { ordering, toggle: toggleSort } = useListSort(() => setCurrentPage(1))

  const query = useQuery({
    queryKey: vehicleKeys.list({ page: currentPage, filters, ordering }),
    queryFn: () =>
      VehicleService.getVehicle({
        page: currentPage,
        ...filterParams,
        ...(ordering ? { ordering } : {}),
      }),
    placeholderData: keepPreviousData,
    select: normalizeList,
  })

  const removeMutation = useMutation({
    mutationFn: (id) => VehicleService.deleteVehicle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vehicleKeys.all }),
  })

  return {
    vehicle: query.data?.results ?? [],
    totalItems: query.data?.count ?? 0,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
    remove: removeMutation.mutateAsync,
    filters,
    applyFilters,
    ordering,
    toggleSort,
    currentPage,
    setCurrentPage,
  }
}
