import { useState } from "react"
import { ReportService } from "@/modules/core/services/report"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"
import { downloadBlob } from "@/api/download-blob"

const POLL_INTERVAL = 1500
const MAX_TRIES = 40 // ~60s de espera

const REPORT_FILE_LABELS = {
  orders: "ordens_de_servico",
  budgets: "orcamentos",
  stock: "estoque",
  cashflow: "fluxo_de_caixa",
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function reportFileName(type, report) {
  const now = new Date()
  const day = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-")
  return `relatorio_${REPORT_FILE_LABELS[type] ?? type}_${day}_${report.id}.pdf`
}

async function waitForFile(id) {
  for (let attempt = 0; attempt < MAX_TRIES; attempt += 1) {
    const report = await ReportService.getStatus(id)
    if (report.status === "done") return report
    if (report.status === "failed") {
      throw new Error(report.error_message || "A geração do relatório falhou.")
    }
    await sleep(POLL_INTERVAL)
  }
  throw new Error("O relatório está demorando mais que o esperado. Tente de novo em instantes.")
}

// Dispara a exportação de um tipo e acompanha até o arquivo ficar pronto,
// baixando o PDF pela rota autenticada. `exportingType` guarda o tipo em
// andamento pra desabilitar só aquele botão.
export function useReportExport() {
  const toast = useToast()
  const [exportingType, setExportingType] = useState(null)

  async function exportReport(type, filters) {
    if (exportingType) return
    setExportingType(type)
    toast.info("Gerando relatório…")
    try {
      const created = await ReportService.requestExport(type, filters)
      const done = await waitForFile(created.id)
      if (done.file_url) {
        downloadBlob(await ReportService.download(done.id), reportFileName(type, done))
        toast.success("Relatório pronto — download iniciado.")
      } else {
        toast.error("Relatório concluído, mas sem arquivo.")
      }
    } catch (error) {
      console.error(error)
      const message = error?.response
        ? parseApiError(error, "Não foi possível gerar o relatório.").message
        : error.message
      toast.error(message)
    } finally {
      setExportingType(null)
    }
  }

  return {
    exportReport,
    exportingType,
    isExporting: (type) => exportingType === type,
  }
}
