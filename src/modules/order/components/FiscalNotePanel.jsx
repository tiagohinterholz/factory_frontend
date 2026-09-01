import { FileText, Loader2, ExternalLink, AlertTriangle } from "lucide-react"
import { useFiscalNote } from "@/modules/order/hooks/useFiscalNote"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"

const STATUS_LABEL = {
  pending: "Na fila",
  processing: "Emitindo…",
  issued: "Emitida",
  failed: "Falhou",
  cancelled: "Cancelada",
}

const STATUS_TONE = {
  pending: "bg-warn-subtle text-warn",
  processing: "bg-warn-subtle text-warn",
  issued: "bg-ok-subtle text-ok",
  failed: "bg-danger-subtle text-danger",
  cancelled: "bg-slate-100 text-slate-600",
}

// Painel de NF-e da ordem. Só renderiza quando a OS está faturada.
export default function FiscalNotePanel({ orderId }) {
  const { isAdmin } = usePermissions()
  const { note, loading, emit, emitting } = useFiscalNote(orderId)

  const working = note && (note.status === "pending" || note.status === "processing")

  return (
    <div className="card-premium">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
          <FileText className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-ink">Nota Fiscal (NF-e)</h3>
        {note && (
          <span
            className={`ml-auto text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
              STATUS_TONE[note.status] || "bg-slate-100 text-slate-600"
            }`}
          >
            {STATUS_LABEL[note.status] || note.status}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando…
        </div>
      ) : !note ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">Nenhuma NF-e solicitada para esta ordem.</p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => emit()}
              disabled={emitting}
              className="btn-primary !py-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              {emitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              Emitir NF-e
            </button>
          )}
        </div>
      ) : working ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="w-4 h-4 animate-spin" /> Emissão em andamento — atualiza sozinho.
        </div>
      ) : note.status === "issued" ? (
        <div className="space-y-2 text-sm">
          {note.number && (
            <p className="text-muted">
              Número <span className="text-ink font-medium tabular-nums">{note.number}</span>
            </p>
          )}
          {note.access_key && (
            <p className="text-muted break-all">
              Chave <span className="text-ink font-medium tabular-nums">{note.access_key}</span>
            </p>
          )}
          <div className="flex gap-2 pt-1">
            {note.danfe_url && (
              <a
                href={note.danfe_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[13px] font-medium text-muted hover:bg-ground hover:text-ink transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> DANFE
              </a>
            )}
            {note.xml_url && (
              <a
                href={note.xml_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[13px] font-medium text-muted hover:bg-ground hover:text-ink transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> XML
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-sm text-danger">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{note.error_message || "A emissão falhou."}</span>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => emit()}
              disabled={emitting}
              className="btn-primary !py-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              {emitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              Tentar de novo
            </button>
          )}
        </div>
      )}
    </div>
  )
}
