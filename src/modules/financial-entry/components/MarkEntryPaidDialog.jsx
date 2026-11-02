import { useEffect, useId, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import Modal from "@/modules/core/components/Modal"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"
import { FinancialEntryService } from "@/modules/financial-entry/services/financial-entry"
import { financialEntryKeys } from "@/modules/financial-entry/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { PAYMENT_METHOD_OPTIONS, MAX_INSTALLMENTS } from "@/modules/order/domain"

const secondaryButton =
  "rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
const primaryButton =
  "rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"

export default function MarkEntryPaidDialog({ entry, onClose, onMarked }) {
  const methodId = useId()
  const installmentsId = useId()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [method, setMethod] = useState("")
  const [installments, setInstallments] = useState("1")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setMethod("")
    setInstallments("1")
    setError("")
  }, [entry?.id])

  if (!entry) return null

  const isCard = method === "cartao"
  const installmentsNumber = Number(installments)
  const installmentsValid =
    !isCard ||
    (Number.isInteger(installmentsNumber) &&
      installmentsNumber >= 1 &&
      installmentsNumber <= MAX_INSTALLMENTS)
  const canConfirm = Boolean(method) && installmentsValid && !submitting

  async function handleConfirm() {
    setSubmitting(true)
    setError("")
    try {
      const result = await FinancialEntryService.markFinancialEntryPaid(entry.id, {
        paymentMethod: method,
        ...(isCard ? { installments: installmentsNumber } : {}),
      })
      queryClient.invalidateQueries({ queryKey: financialEntryKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      toast.success(`Lançamento #${entry.id} marcado como pago.`)
      onMarked?.(result)
      onClose()
    } catch (apiError) {
      setError(parseApiError(apiError, "Erro ao marcar o lançamento como pago.").message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Marcar lançamento #${entry.id} como pago`}
      maxWidth="max-w-sm"
      footer={
        <>
          <button type="button" onClick={onClose} className={secondaryButton}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={primaryButton}
          >
            Confirmar pagamento
          </button>
        </>
      }
    >
      <label htmlFor={methodId} className="label-premium">
        Forma de pagamento *
      </label>
      <select
        id={methodId}
        className="input-premium"
        value={method}
        onChange={(event) => setMethod(event.target.value)}
      >
        <option value="">Selecione</option>
        {PAYMENT_METHOD_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {isCard && (
        <div className="mt-4">
          <label htmlFor={installmentsId} className="label-premium">
            Parcelas *
          </label>
          <input
            id={installmentsId}
            type="number"
            min="1"
            max={MAX_INSTALLMENTS}
            className="input-premium"
            value={installments}
            onChange={(event) => setInstallments(event.target.value)}
          />
          {!installmentsValid && (
            <p className="mt-1 text-xs text-danger">Informe de 1 a {MAX_INSTALLMENTS} parcelas.</p>
          )}
        </div>
      )}
      {error && <p className="mt-3 text-xs text-danger">{error}</p>}
    </Modal>
  )
}
