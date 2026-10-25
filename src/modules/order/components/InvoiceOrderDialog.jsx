import { useEffect, useId, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import Modal from "@/modules/core/components/Modal"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"
import { formatMoney } from "@/modules/core/utils/format"
import { OrderService } from "@/modules/order/services/order"
import { orderKeys, PAYMENT_METHOD_OPTIONS, MAX_INSTALLMENTS } from "@/modules/order/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { financialEntryKeys } from "@/modules/financial-entry/domain"

const secondaryButton =
  "rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
const primaryButton =
  "rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"

export default function InvoiceOrderDialog({ order, onClose, onInvoiced }) {
  const methodId = useId()
  const installmentsId = useId()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [step, setStep] = useState("payment")
  const [method, setMethod] = useState("")
  const [installments, setInstallments] = useState("1")
  const [externalServices, setExternalServices] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setStep("payment")
    setMethod("")
    setInstallments("1")
    setExternalServices([])
    setError("")
  }, [order?.id])

  if (!order) return null

  const isCard = method === "cartao"
  const installmentsNumber = Number(installments)
  const installmentsValid =
    !isCard ||
    (Number.isInteger(installmentsNumber) &&
      installmentsNumber >= 1 &&
      installmentsNumber <= MAX_INSTALLMENTS)
  const canConfirm = Boolean(method) && installmentsValid && !submitting

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: orderKeys.all })
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    queryClient.invalidateQueries({ queryKey: financialEntryKeys.all })
  }

  async function handleInvoice() {
    setSubmitting(true)
    setError("")
    try {
      const result = await OrderService.invoiceOrder(order.id, {
        payment_method: method,
        ...(isCard ? { installments: installmentsNumber } : {}),
      })
      invalidate()
      toast.success(`OS #${order.id} faturada.`)
      onInvoiced?.(result)
      if (result?.has_external_service_suppliers) {
        setExternalServices(result.external_services ?? [])
        setStep("external")
      } else {
        onClose()
      }
    } catch (apiError) {
      setError(parseApiError(apiError, "Erro ao faturar a ordem de serviço.").message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRegisterExternal() {
    setSubmitting(true)
    setError("")
    try {
      await OrderService.registerExternalServicePayable(order.id)
      invalidate()
      toast.success("Saída dos serviços de terceiro registrada no financeiro.")
      onClose()
    } catch (apiError) {
      setError(parseApiError(apiError, "Erro ao registrar a saída financeira.").message)
    } finally {
      setSubmitting(false)
    }
  }

  if (step === "external") {
    const externalTotal = externalServices.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    )
    return (
      <Modal
        open
        onClose={onClose}
        title="Registrar saída de serviço de terceiro?"
        maxWidth="max-w-md"
        footer={
          <>
            <button type="button" onClick={onClose} className={secondaryButton}>
              Agora não
            </button>
            <button
              type="button"
              onClick={handleRegisterExternal}
              disabled={submitting}
              className={primaryButton}
            >
              Registrar saída
            </button>
          </>
        }
      >
        <p className="mb-4 text-sm text-slate-500">
          Esta OS tem serviço feito por fornecedor de fora. Quer lançar o valor como conta a pagar
          no financeiro?
        </p>
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
          {externalServices.map((item) => (
            <li key={item.supplier_id} className="flex items-start justify-between gap-3 p-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">{item.supplier_name}</p>
                <p className="text-xs text-slate-500">{item.services.join(", ")}</p>
              </div>
              <span className="text-sm font-bold tabular-nums text-slate-800">
                {formatMoney(item.amount)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-right text-sm text-slate-600">
          Total: <strong className="tabular-nums">{formatMoney(externalTotal)}</strong>
        </p>
        {error && <p className="mt-3 text-xs text-danger">{error}</p>}
      </Modal>
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Faturar OS #${order.id}`}
      maxWidth="max-w-sm"
      footer={
        <>
          <button type="button" onClick={onClose} className={secondaryButton}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleInvoice}
            disabled={!canConfirm}
            className={primaryButton}
          >
            Faturar
          </button>
        </>
      }
    >
      {order.total != null && (
        <p className="mb-4 text-sm text-slate-500">
          Total da OS: <strong className="text-slate-800">{formatMoney(order.total)}</strong>. O
          lançamento entra no financeiro já como pago.
        </p>
      )}
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
