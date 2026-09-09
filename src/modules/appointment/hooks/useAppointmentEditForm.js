import { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { idOf } from "@/api/dto"
import { AppointmentService } from "@/modules/appointment/services/appointment"
import { OrderService } from "@/modules/order/services/order"
import { appointmentSchema, appointmentDefaults, toAppointmentPayload } from "../domain"

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
  const toast = useToast()
  const queryClient = useQueryClient()

  // OS vinculada crua do detalhe (OrderFlatSerializer: id, status, ...). A página
  // usa pra garantir a <option> do select mesmo com o cache de opções velho, e
  // pra decidir se mostra "Finalizar atendimento".
  const [linkedOrder, setLinkedOrder] = useState(null)

  const loadRaw = useCallback(async () => {
    const data = await AppointmentService.getAppointmentById(id)
    setLinkedOrder(data.order ?? null)
    return data
  }, [id])

  const { form, onSubmit, loading } = useResourceForm({
    schema: appointmentSchema,
    defaultValues: appointmentDefaults,
    load: async () => toAppointmentForm(await loadRaw()),
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

  // finaliza o serviço da OS vinculada (em andamento -> a faturar). Só faz
  // sentido enquanto a OS está "em andamento".
  async function handleFinishOrder() {
    const orderId = idOf(linkedOrder)
    if (!orderId) return
    const confirmed = await confirm({
      title: "Finalizar atendimento?",
      message: "A OS vinculada vai para 'a faturar' e os itens não poderão mais ser editados.",
      confirmText: "Finalizar",
    })
    if (!confirmed) return
    try {
      await OrderService.finishService(orderId)
      form.reset(toAppointmentForm(await loadRaw()))
      queryClient.invalidateQueries()
      toast.success("Atendimento finalizado. OS pronta para faturar.")
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao finalizar o atendimento").message)
    }
  }

  return { form, onSubmit, loading, handleDelete, handleFinishOrder, linkedOrder }
}
