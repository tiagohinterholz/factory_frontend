import { useState } from "react"
import { FileDown, Loader2 } from "lucide-react"
import { useToast } from "@/modules/core/feedback/toast-context"
import { openPdfBlob } from "@/api/open-pdf"

// Ícone compacto de "baixar PDF", pra caber na linha de ações de uma tabela
// (RecordPdfButton é grande demais pra isso). Mesmo comportamento: `request`
// é uma função async que devolve o Blob.
export default function PdfIconButton({ request, title = "Baixar PDF" }) {
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
      title={title}
      onClick={handleClick}
      disabled={busy}
      className="p-1.5 text-brand hover:bg-brand-subtle rounded transition-colors disabled:pointer-events-none disabled:opacity-60"
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
    </button>
  )
}
