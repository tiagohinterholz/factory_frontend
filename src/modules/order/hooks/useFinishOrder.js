import { OrderService } from "@/modules/order/services/order"
import { orderKeys } from "@/modules/order/domain"
import { appointmentKeys } from "@/modules/appointment/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

// Finaliza o serviço de uma OS (em andamento -> a faturar) de qualquer tela que
// só tenha o id da OS na mão (ex.: card do board). Telas que precisam recarregar
// o próprio detalhe têm o fluxo próprio (useOrderEditForm / useAppointmentEditForm).
export function useFinishOrder() {
  const action = useResourceAction({
    mutationFn: (orderId) => OrderService.finishService(orderId),
    confirm: {
      title: "Finalizar atendimento?",
      message: "A OS vinculada vai para 'a faturar' e os itens não poderão mais ser editados.",
      confirmText: "Finalizar",
    },
    invalidate: [orderKeys.all, appointmentKeys.all, dashboardKeys.all],
    success: "Atendimento finalizado. OS pronta para faturar.",
    errorFallback: "Erro ao finalizar o atendimento",
  })

  return { finishOrder: action.run, finishing: action.pending }
}
