import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/modules/core/feedback/toast-context"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { parseApiError } from "@/api/parse-api-error"

// Ação de recurso: colapsa o padrão repetido
//   confirm -> mutation -> toast de sucesso/erro -> invalida o cache afetado
//
//   mutationFn(arg)   — a chamada de serviço. `arg` é o que `run` recebe (id, item, payload...).
//   confirm           — objeto pro useConfirm(); OU função (arg) => objeto (mensagem dinâmica);
//                       OU omitido = executa direto, sem diálogo.
//   invalidate        — array de query keys a invalidar no sucesso.
//   success           — string OU (arg, result) => string  (toast de sucesso; omitido = sem toast).
//   errorFallback     — mensagem se a API não mandar nada estruturado.
//   onSuccess         — callback extra no sucesso (result, arg) — ex.: navegar, recarregar meta.
//   rethrow           — relança o erro depois do toast (ex.: manter um modal aberto).
//
// Devolve { run, pending }. `run(arg)` resolve com o resultado (ou undefined se
// cancelou no confirm / se deu erro sem rethrow).
export function useResourceAction({
  mutationFn,
  confirm: confirmInput,
  invalidate = [],
  success,
  errorFallback = "Não foi possível concluir a ação.",
  onSuccess,
  rethrow = false,
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const confirm = useConfirm()

  const mutation = useMutation({
    mutationFn,
    onSuccess: (result, arg) => {
      invalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
      onSuccess?.(result, arg)
    },
  })

  async function run(arg) {
    if (confirmInput) {
      const options = typeof confirmInput === "function" ? confirmInput(arg) : confirmInput
      if (!(await confirm(options))) return undefined
    }
    try {
      const result = await mutation.mutateAsync(arg)
      if (success) {
        toast.success(typeof success === "function" ? success(arg, result) : success)
      }
      return result
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, errorFallback).message)
      if (rethrow) throw error
      return undefined
    }
  }

  return { run, pending: mutation.isPending }
}
