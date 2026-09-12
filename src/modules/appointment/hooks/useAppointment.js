import { useQuery } from "@tanstack/react-query"
import { AppointmentService } from "@/modules/appointment/services/appointment"
import { appointmentKeys } from "@/modules/appointment/domain"
import { fetchAllPages } from "@/api/fetch-all-pages"

// O calendário semanal precisa enxergar agendamento de qualquer data (passada,
// hoje ou futura) pra navegar entre semanas. O back ordena por data/hora
// ASCENDENTE — só a 1ª página (BUG-2) trazia sempre os 10 mais antigos, então
// qualquer agendamento de hoje/futuro sumia assim que a lista passava de 10.
export function useAppointment() {
  const query = useQuery({
    queryKey: appointmentKeys.list({ all: true }),
    queryFn: () => fetchAllPages((page) => AppointmentService.getAppointment({ page })),
  })

  return {
    appointments: query.data ?? [],
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
  }
}
