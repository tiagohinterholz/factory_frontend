import { useState } from "react"
import { Clock, Loader2, Save } from "lucide-react"
import { useToast } from "@/modules/core/feedback/toast-context"

// HH:MM:SS (vindo da API) -> HH:MM (o que o <input type="time"> aceita).
function toTimeInputValue(value) {
  return value ? value.slice(0, 5) : ""
}

// A linha usa `hour` só como valor inicial; o pai monta com uma `key` que
// inclui esses campos, então quando o servidor muda o horário (esta mesma
// linha salvando, ou um refetch trazendo um valor novo) o React remonta o
// componente do zero em vez de precisar de um efeito pra ressincronizar.
function HourRow({ hour, canEdit, saving, onSave }) {
  const toast = useToast()
  const [opensAt, setOpensAt] = useState(toTimeInputValue(hour.opens_at))
  const [closesAt, setClosesAt] = useState(toTimeInputValue(hour.closes_at))
  const [isClosed, setIsClosed] = useState(hour.is_closed)
  const [dirty, setDirty] = useState(false)

  async function handleSave() {
    if (!isClosed && (!opensAt || !closesAt)) {
      toast.error("Informe abertura e fechamento, ou marque como fechado.")
      return
    }

    const payload = isClosed
      ? { is_closed: true }
      : { is_closed: false, opens_at: `${opensAt}:00`, closes_at: `${closesAt}:00` }

    await onSave(hour.weekday, payload)
    setDirty(false)
  }

  if (!canEdit) {
    return (
      <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
        <span className="text-sm font-medium text-ink">{hour.weekday_display}</span>
        {hour.is_closed ? (
          <span className="text-xs font-bold uppercase tracking-wide text-muted">Fechado</span>
        ) : (
          <span className="text-sm text-muted tabular-nums">
            {toTimeInputValue(hour.opens_at)} às {toTimeInputValue(hour.closes_at)}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="py-3 border-b border-slate-50 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink">{hour.weekday_display}</span>

        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-line text-brand focus:ring-brand"
              checked={isClosed}
              onChange={(event) => {
                setIsClosed(event.target.checked)
                setDirty(true)
              }}
            />
            Fechado
          </label>

          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="p-1.5 text-brand hover:bg-brand-subtle rounded transition-colors disabled:opacity-40 disabled:pointer-events-none"
            title="Salvar horário"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          </button>
        </div>
      </div>

      {!isClosed && (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="time"
            className="input-premium !py-1.5 flex-1 min-w-0"
            value={opensAt}
            onChange={(event) => {
              setOpensAt(event.target.value)
              setDirty(true)
            }}
          />
          <span className="text-xs text-muted shrink-0">às</span>
          <input
            type="time"
            className="input-premium !py-1.5 flex-1 min-w-0"
            value={closesAt}
            onChange={(event) => {
              setClosesAt(event.target.value)
              setDirty(true)
            }}
          />
        </div>
      )}
    </div>
  )
}

// Painel de horário de funcionamento do empreendimento: 7 dias, um por linha.
// Colaborador só visualiza; superuser/admin edita (`canEdit`).
export default function BusinessHoursPanel({ hours, loading, canEdit, savingWeekday, onSave }) {
  return (
    <div className="card-premium">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-50">
        <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 tracking-tight">Horário de Funcionamento</h3>
          {canEdit && (
            <p className="text-xs text-muted mt-0.5">
              Usado para validar o horário dos agendamentos.
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando…
        </div>
      ) : (
        <div>
          {hours.map((hour) => (
            <HourRow
              key={`${hour.weekday}-${hour.opens_at}-${hour.closes_at}-${hour.is_closed}`}
              hour={hour}
              canEdit={canEdit}
              saving={savingWeekday === hour.weekday}
              onSave={onSave}
            />
          ))}
        </div>
      )}
    </div>
  )
}
