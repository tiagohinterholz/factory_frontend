import { FileText } from "lucide-react"

export default function FiscalNotes() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-ink tracking-tight">Notas Fiscais</h1>
      <p className="text-sm text-muted mt-1">Emissão e histórico de NF-e</p>

      <div className="mt-8 max-w-lg rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
        <div className="mx-auto w-12 h-12 rounded-xl bg-brand-subtle text-brand grid place-items-center">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="mt-4 font-semibold text-ink">Em construção</h2>
        <p className="mt-2 text-sm text-muted">
          A listagem geral de notas fiscais ainda está sendo desenvolvida. Por enquanto, a NF-e é
          emitida dentro de cada Ordem de Serviço faturada.
        </p>
      </div>
    </div>
  )
}
