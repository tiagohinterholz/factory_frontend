import { useState } from "react"
import { Check } from "lucide-react"
import Modal from "@/modules/core/components/Modal"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { formatMoney } from "@/modules/core/utils/format"
import { FinancialEntryService } from "@/modules/financial-entry"
import { parseApiError } from "@/api/parse-api-error"

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function ProductFinancialEntryModal({ open, product, onClose, onConfirm }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const quantity = Number(product?.stock_quantity)
  const hasQuantity = Number.isFinite(quantity) && quantity > 0
  const costPrice = Number(product?.cost_price) || 0
  const suggestedAmount = hasQuantity ? costPrice * quantity : costPrice

  function handleDecline() {
    setError("")
    onClose?.()
  }

  async function handleConfirm() {
    setSubmitting(true)
    setError("")
    try {
      const entry = await FinancialEntryService.createFinancialEntry({
        entry_type: "a_pagar",
        category: "outro",
        description: product?.name ? `Compra de ${product.name}` : null,
        amount: suggestedAmount,
        due_date: todayIso(),
      })
      onConfirm?.(entry)
      onClose?.()
    } catch (apiError) {
      setError(parseApiError(apiError, "Erro ao registrar a saída financeira.").message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleDecline} title="Registrar saída financeira?">
      <div className="space-y-6">
        <p className="text-sm text-slate-600">
          Quer registrar também uma saída no financeiro no valor de custo deste produto?
        </p>
        <p className="text-lg font-bold text-slate-800">{formatMoney(suggestedAmount)}</p>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleDecline}
            disabled={submitting}
            className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Não
          </button>
          <PrimaryButton
            type="button"
            icon={Check}
            fullWidth={false}
            disabled={submitting}
            onClick={handleConfirm}
          >
            Sim, registrar
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  )
}
