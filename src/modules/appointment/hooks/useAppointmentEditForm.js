import { useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { idOf } from "@/api/dto"
import { AppointmentService } from "@/modules/appointment/services/appointment"
import { appointmentSchema, appointmentDefaults, toAppointmentPayload } from "../appointment.schema"

// dto da API -> shape do form (ids como string)
function toAppointmentForm(data) {
  return {
    business_id: idOf(data.business),
    client_id: idOf(data.client),
    vehicle_id: idOf(data.vehicle),
    order_id: idOf(data.order),
    date: data.date ?? "",
    time: data.time ?? "",
    observation: data.observation ?? "",
  }
}

export function useAppointmentEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const queryClient = useQueryClient()

  const { form, onSubmit, loading } = useResourceForm({
    schema: appointmentSchema,
    defaultValues: appointmentDefaults,
    load: async () => toAppointmentForm(await AppointmentService.getAppointmentById(id)),
    submit: (values) => AppointmentService.updateAppointment(id, toAppointmentPayload(values)),
    redirectTo: "/agendamentos",
    errorFallback: "Erro ao atualizar agendamento",
  })

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Excluir agendamento?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return
    await AppointmentService.deleteAppointment(id)
    queryClient.invalidateQueries()
    navigate("/agendamentos")
  }

  return { form, onSubmit, loading, handleDelete }
}
