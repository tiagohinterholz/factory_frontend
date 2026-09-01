import { useState } from "react"
import { FileDown, Loader2 } from "lucide-react"
import { useToast } from "@/modules/core/feedback/toast-context"
import { openPdfBlob } from "@/api/open-pdf"

// Botão de "exportar este registro em PDF". `request` é uma função async que
// devolve o Blob (ex.: () => OrderService.getOrderPdf(id)).
export default function RecordPdfButton({ request, label = "Exportar PDF" }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    if (busy) return
    setBusy(true)
    try {
      const blob = await request()
      openPdfBlob(blob)
    } catch (error) {
      console.error(error)
      toast.error("Não foi possível gerar o PDF.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-bold text-muted transition-colors hover:bg-ground hover:text-ink disabled:pointer-events-none disabled:opacity-60"
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      {busy ? "Gerando…" : label}
    </button>
  )
}
