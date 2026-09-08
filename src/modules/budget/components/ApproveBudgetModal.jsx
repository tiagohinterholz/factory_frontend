import { useId, useState } from "react"
import Modal from "@/modules/core/components/Modal"
import { fromDateTimeLocalInput } from "@/api/dto"

// Aprovar orçamento com data/hora do serviço opcional. Se o campo ficar em
// branco, a OS nasce sem service_date (fluxo normal); preenchido, entra no
// payload do approve como ISO 8601. Fecha e remonta a cada abertura, então o
// estado do input zera sozinho.
export default function ApproveBudgetModal({ open, onClose, budgetId, onConfirm, submitting }) {
  const inputId = useId()
  const [serviceDate, setServiceDate] = useState("")

  function handleConfirm() {
    onConfirm(fromDateTimeLocalInput(serviceDate))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={budgetId ? `Aprovar orçamento #${budgetId}` : "Aprovar orçamento"}
      maxWidth="max-w-sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            Aprovar
          </button>
        </>
      }
    >
      <p className="mb-4 text-sm text-slate-500">
        A aprovação gera uma Ordem de Serviço. Se já souber quando o serviço será feito, informe a
        data e hora — senão, deixe em branco e defina depois na OS.
      </p>
      <label htmlFor={inputId} className="label-premium">
        Data e hora do serviço (opcional)
      </label>
      <input
        id={inputId}
        type="datetime-local"
        className="input-premium"
        value={serviceDate}
        onChange={(event) => setServiceDate(event.target.value)}
      />
    </Modal>
  )
}
