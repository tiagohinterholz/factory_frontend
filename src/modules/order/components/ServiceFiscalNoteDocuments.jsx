import { useState } from "react"
import { FileCode2, FileDown, Loader2 } from "lucide-react"
import { useToast } from "@/modules/core/feedback/toast-context"
import { openPdfBlob } from "@/api/open-pdf"
import { downloadBlob } from "@/api/download-blob"
import { OrderService } from "@/modules/order/services/order"

const labeledClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[13px] font-medium text-muted hover:bg-ground hover:text-ink transition-colors disabled:pointer-events-none disabled:opacity-60"
const iconClass =
  "p-1.5 text-brand hover:bg-brand-subtle rounded transition-colors disabled:pointer-events-none disabled:opacity-60"

export default function ServiceFiscalNoteDocuments({ orderId, number, variant = "labeled" }) {
  const toast = useToast()
  const [busy, setBusy] = useState(null)

  async function run(kind, action, errorMessage) {
    if (busy) return
    setBusy(kind)
    try {
      await action()
    } catch (error) {
      console.error(error)
      toast.error(errorMessage)
    } finally {
      setBusy(null)
    }
  }

  const openDanfse = () =>
    run(
      "danfse",
      async () => openPdfBlob(await OrderService.getServiceFiscalNoteDanfse(orderId)),
      "Não foi possível gerar o DANFSe.",
    )

  const downloadXml = () =>
    run(
      "xml",
      async () =>
        downloadBlob(await OrderService.getServiceFiscalNoteXml(orderId), `nfse_${number}.xml`),
      "Não foi possível baixar o XML da NFS-e.",
    )

  const icon = (kind, Icon, size) =>
    busy === kind ? <Loader2 size={size} className="animate-spin" /> : <Icon size={size} />

  if (variant === "icon") {
    return (
      <>
        <button
          type="button"
          onClick={openDanfse}
          disabled={Boolean(busy)}
          title="Abrir DANFSe"
          aria-label="Abrir DANFSe"
          className={iconClass}
        >
          {icon("danfse", FileDown, 16)}
        </button>
        <button
          type="button"
          onClick={downloadXml}
          disabled={Boolean(busy)}
          title="Baixar XML da NFS-e"
          aria-label="Baixar XML da NFS-e"
          className={iconClass}
        >
          {icon("xml", FileCode2, 16)}
        </button>
      </>
    )
  }

  return (
    <>
      <button type="button" onClick={openDanfse} disabled={Boolean(busy)} className={labeledClass}>
        {icon("danfse", FileDown, 14)} DANFSe
      </button>
      <button type="button" onClick={downloadXml} disabled={Boolean(busy)} className={labeledClass}>
        {icon("xml", FileCode2, 14)} XML
      </button>
    </>
  )
}
