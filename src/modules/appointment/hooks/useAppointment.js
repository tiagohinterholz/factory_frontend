import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { AppointmentService } from "@/modules/appointment/services/appointment"
import { useDebouncedValue } from "@/modules/core/hooks/useDebouncedValue"
import { normalizeList } from "@/api/normalize-list"

export function useAppointment() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const search = useDebouncedValue(searchTerm, 300)

  const query = useQuery({
    queryKey: ["appointments", { search, page: currentPage }],
    queryFn: () => AppointmentService.getAppointment({ search, page: currentPage }),
    placeholderData: keepPreviousData,
    select: normalizeList,
  })

  return {
    appointments: query.data?.results ?? [],
    totalItems: query.data?.count ?? 0,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
  }
}
