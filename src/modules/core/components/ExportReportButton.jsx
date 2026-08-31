import { FileDown, Loader2 } from "lucide-react"
import { useReportExport } from "@/modules/core/hooks/useReportExport"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"

// Botão de exportar relatório (PDF). Só aparece pra quem pode exportar
// (superusuário ou admin do empreendimento). `type`: "orders" | "budgets" | "stock".
export default function ExportReportButton({ type, label = "Exportar PDF" }) {
  const { canExportReports } = usePermissions()
  const { exportReport, isExporting } = useReportExport()

  if (!canExportReports) return null

  const busy = isExporting(type)

  return (
    <button
      type="button"
      onClick={() => exportReport(type)}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-ground hover:text-ink disabled:pointer-events-none disabled:opacity-60"
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      {busy ? "Gerando…" : label}
    </button>
  )
}
