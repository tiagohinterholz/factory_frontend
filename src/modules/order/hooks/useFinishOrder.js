import { useMutation, useQueryClient } from "@tanstack/react-query"
import { OrderService } from "@/modules/order/services/order"
import { orderKeys } from "@/modules/order/domain"
import { appointmentKeys } from "@/modules/appointment/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useToast } from "@/modules/core/feedback/toast-context"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { parseApiError } from "@/api/parse-api-error"

// Finaliza o serviço de uma OS (em andamento -> a faturar) de qualquer tela
// que só tenha o id da OS na mão (ex.: card do board). Confirm + toast + refaz
// as listas. Telas que precisam recarregar o próprio detalhe fazem o fluxo
// próprio (useOrderEditForm / useAppointmentEditForm).
export function useFinishOrder() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const confirm = useConfirm()

  const mutation = useMutation({
    mutationFn: (orderId) => OrderService.finishService(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })

  async function finishOrder(orderId) {
    if (!orderId) return
    const confirmed = await confirm({
      title: "Finalizar atendimento?",
      message: "A OS vinculada vai para 'a faturar' e os itens não poderão mais ser editados.",
      confirmText: "Finalizar",
    })
    if (!confirmed) return
    try {
      await mutation.mutateAsync(orderId)
      toast.success("Atendimento finalizado. OS pronta para faturar.")
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao finalizar o atendimento").message)
    }
  }

  return { finishOrder, finishing: mutation.isPending }
}
