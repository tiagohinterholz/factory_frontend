import { useAuth } from "@/modules/auth/context/auth-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { AppointmentService } from "@/modules/appointment/services/appointment"
import { appointmentSchema, appointmentDefaults, toAppointmentPayload } from "../appointment.schema"

export function useAppointmentForm() {
  const { businessId } = useAuth()

  return useResourceForm({
    schema: appointmentSchema,
    defaultValues: {
      ...appointmentDefaults,
      business_id: businessId ? String(businessId) : "",
    },
    submit: (values) => AppointmentService.createAppointment(toAppointmentPayload(values)),
    redirectTo: "/agendamentos",
    errorFallback: "Erro ao criar agendamento",
  })
}
