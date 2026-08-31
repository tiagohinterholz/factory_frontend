import { useState } from "react"
import { ReportService } from "@/modules/core/services/report"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"

const POLL_INTERVAL = 1500
const MAX_TRIES = 40 // ~60s de espera

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

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
// abrindo o CSV numa nova aba. `exportingType` guarda o tipo em andamento
// pra desabilitar só aquele botão.
export function useReportExport() {
  const toast = useToast()
  const [exportingType, setExportingType] = useState(null)

  async function exportReport(type) {
    if (exportingType) return
    setExportingType(type)
    toast.info("Gerando relatório…")
    try {
      const created = await ReportService.requestExport(type)
      const done = await waitForFile(created.id)
      if (done.file_url) {
        window.open(done.file_url, "_blank", "noopener")
        toast.success("Relatório pronto.")
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
