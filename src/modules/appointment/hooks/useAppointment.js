import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { AppointmentService } from "@/modules/appointment/services/appointment"
import { appointmentKeys } from "@/modules/appointment/domain"
import { normalizeList } from "@/api/normalize-list"

export function useAppointment() {
  const [currentPage, setCurrentPage] = useState(1)

  const query = useQuery({
    queryKey: appointmentKeys.list({ page: currentPage }),
    queryFn: () => AppointmentService.getAppointment({ page: currentPage }),
    placeholderData: keepPreviousData,
    select: normalizeList,
  })

  return {
    appointments: query.data?.results ?? [],
    totalItems: query.data?.count ?? 0,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
    currentPage,
    setCurrentPage,
  }
}
