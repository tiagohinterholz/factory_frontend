import { useCallback, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { idOf } from "@/api/dto"
import { AppointmentService } from "@/modules/appointment/services/appointment"
import { OrderService } from "@/modules/order"
import {
  appointmentSchema,
  appointmentDefaults,
  toAppointmentPayload,
  appointmentKeys,
} from "../domain"
import { orderKeys } from "@/modules/order/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"

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

  // Registros crus do detalhe (OS/cliente/veículo já vinculados). A página usa
  // pra garantir a <option> do select mesmo com o cache de opções velho ou
  // cortado por filtro; a OS também decide se mostra "Finalizar atendimento".
  const [related, setRelated] = useState({ order: null, client: null, vehicle: null })
  const linkedOrder = related.order

  const loadRaw = useCallback(async () => {
    const data = await AppointmentService.getAppointmentById(id)
    setRelated({
      order: data.order ?? null,
      client: data.client ?? null,
      vehicle: data.vehicle ?? null,
    })
    return data
  }, [id])

  const { form, onSubmit, loading } = useResourceForm({
    schema: appointmentSchema,
    defaultValues: appointmentDefaults,
    load: async () => toAppointmentForm(await loadRaw()),
    submit: (values) => AppointmentService.updateAppointment(id, toAppointmentPayload(values)),
    redirectTo: "/agendamentos",
    invalidate: [appointmentKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao atualizar agendamento",
  })

  const remove = useResourceAction({
    mutationFn: () => AppointmentService.deleteAppointment(id),
    confirm: {
      title: "Excluir agendamento?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    },
    invalidate: [appointmentKeys.all, dashboardKeys.all],
    onSuccess: () => navigate("/agendamentos"),
    errorFallback: "Erro ao excluir agendamento",
  })

  // finaliza o serviço da OS vinculada (em andamento -> a faturar). A página só
  // mostra o botão quando há OS "em andamento", então não guarda id nulo aqui.
  const finishOrder = useResourceAction({
    mutationFn: () => OrderService.finishService(idOf(linkedOrder)),
    confirm: {
      title: "Finalizar atendimento?",
      message: "A OS vinculada vai para 'a faturar' e os itens não poderão mais ser editados.",
      confirmText: "Finalizar",
    },
    invalidate: [orderKeys.all, appointmentKeys.all, dashboardKeys.all],
    success: "Atendimento finalizado. OS pronta para faturar.",
    onSuccess: async () => form.reset(toAppointmentForm(await loadRaw())),
    errorFallback: "Erro ao finalizar o atendimento",
  })

  return {
    form,
    onSubmit,
    loading,
    handleDelete: remove.run,
    handleFinishOrder: finishOrder.run,
    linkedOrder,
    relatedClient: related.client,
    relatedVehicle: related.vehicle,
  }
}
