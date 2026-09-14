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
function DayTile({ hour, canEdit, saving, onSave }) {
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
      <div className="rounded-xl border border-line bg-ground px-3 py-3 text-center">
        <p className="text-[13px] font-medium text-ink">{hour.weekday_display}</p>
        {hour.is_closed ? (
          <span className="mt-1.5 inline-block text-[11px] font-bold uppercase tracking-wide text-muted">
            Fechado
          </span>
        ) : (
          <p className="mt-1.5 text-[13px] text-muted tabular-nums">
            {toTimeInputValue(hour.opens_at)} às {toTimeInputValue(hour.closes_at)}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-ink">{hour.weekday_display}</span>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="p-1 text-brand hover:bg-brand-subtle rounded transition-colors disabled:opacity-40 disabled:pointer-events-none shrink-0"
          title="Salvar horário"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        </button>
      </div>

      <label className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-muted">
        <input
          type="checkbox"
          className="w-3.5 h-3.5 rounded border-line text-brand focus:ring-brand"
          checked={isClosed}
          onChange={(event) => {
            setIsClosed(event.target.checked)
            setDirty(true)
          }}
        />
        Fechado
      </label>

      {!isClosed && (
        <div className="flex flex-col gap-1.5 mt-2">
          <input
            type="time"
            className="input-premium !py-1 !px-2 text-[12px]"
            value={opensAt}
            onChange={(event) => {
              setOpensAt(event.target.value)
              setDirty(true)
            }}
          />
          <input
            type="time"
            className="input-premium !py-1 !px-2 text-[12px]"
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

// Faixa horizontal com os 7 dias da semana lado a lado (quebra em grade
// menor conforme o espaço encolhe). Colaborador só visualiza; admin edita
// (`canEdit`) — cada dia grava seu PATCH próprio, independente dos demais e
// do form de dados organizacionais acima.
export default function BusinessHoursPanel({ hours, loading, canEdit, savingWeekday, onSave }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 tracking-tight">Horário de Funcionamento</h3>
          <p className="text-xs text-muted mt-0.5">
            Usado para validar o horário dos agendamentos.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando…
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {hours.map((hour) => (
            <DayTile
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
