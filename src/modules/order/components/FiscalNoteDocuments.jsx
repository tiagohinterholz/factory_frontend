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

const KINDS = {
  product: {
    document: "DANFE",
    note: "NF-e",
    filePrefix: "nfe",
    fetchPdf: (orderId) => OrderService.getFiscalNoteDanfe(orderId),
    fetchXml: (orderId) => OrderService.getFiscalNoteXml(orderId),
  },
  service: {
    document: "DANFSe",
    note: "NFS-e",
    filePrefix: "nfse",
    fetchPdf: (orderId) => OrderService.getServiceFiscalNoteDanfse(orderId),
    fetchXml: (orderId) => OrderService.getServiceFiscalNoteXml(orderId),
  },
}

export default function FiscalNoteDocuments({ kind, orderId, number, variant = "labeled" }) {
  const toast = useToast()
  const [busy, setBusy] = useState(null)
  const config = KINDS[kind]

  async function run(action, task, errorMessage) {
    if (busy) return
    setBusy(action)
    try {
      await task()
    } catch (error) {
      console.error(error)
      toast.error(errorMessage)
    } finally {
      setBusy(null)
    }
  }

  const openPdf = () =>
    run(
      "pdf",
      async () => openPdfBlob(await config.fetchPdf(orderId)),
      `Não foi possível gerar o ${config.document}.`,
    )

  const downloadXml = () =>
    run(
      "xml",
      async () =>
        downloadBlob(await config.fetchXml(orderId), `${config.filePrefix}_${number}.xml`),
      `Não foi possível baixar o XML da ${config.note}.`,
    )

  const icon = (action, Icon, size) =>
    busy === action ? <Loader2 size={size} className="animate-spin" /> : <Icon size={size} />

  if (variant === "icon") {
    return (
      <>
        <button
          type="button"
          onClick={openPdf}
          disabled={Boolean(busy)}
          title={`Abrir ${config.document}`}
          aria-label={`Abrir ${config.document}`}
          className={iconClass}
        >
          {icon("pdf", FileDown, 16)}
        </button>
        <button
          type="button"
          onClick={downloadXml}
          disabled={Boolean(busy)}
          title={`Baixar XML da ${config.note}`}
          aria-label={`Baixar XML da ${config.note}`}
          className={iconClass}
        >
          {icon("xml", FileCode2, 16)}
        </button>
      </>
    )
  }

  return (
    <>
      <button type="button" onClick={openPdf} disabled={Boolean(busy)} className={labeledClass}>
        {icon("pdf", FileDown, 14)} {config.document}
      </button>
      <button type="button" onClick={downloadXml} disabled={Boolean(busy)} className={labeledClass}>
        {icon("xml", FileCode2, 14)} XML
      </button>
    </>
  )
}
