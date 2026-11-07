import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { ToastContext } from "@/modules/core/feedback/toast-context"
import { ReportService } from "@/modules/core/services/report"
import { downloadBlob } from "@/api/download-blob"
import { useReportExport } from "./useReportExport"

vi.mock("@/modules/core/services/report", () => ({
  ReportService: { requestExport: vi.fn(), getStatus: vi.fn(), download: vi.fn() },
}))
vi.mock("@/api/download-blob", () => ({ downloadBlob: vi.fn() }))

const toast = { success: vi.fn(), error: vi.fn(), info: vi.fn() }

function setup() {
  const wrapper = ({ children }) => (
    <ToastContext.Provider value={toast}>{children}</ToastContext.Provider>
  )
  return renderHook(() => useReportExport(), { wrapper }).result
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("useReportExport", () => {
  it("baixa o PDF pela rota autenticada quando o relatório fica pronto", async () => {
    const pdf = new Blob(["%PDF"], { type: "application/pdf" })
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)
    ReportService.requestExport.mockResolvedValue({ id: 7, status: "pending" })
    ReportService.getStatus.mockResolvedValue({
      id: 7,
      status: "done",
      file_url: "http://api/relatorios/7/arquivo/",
    })
    ReportService.download.mockResolvedValue(pdf)
    const result = setup()

    await act(async () => {
      await result.current.exportReport("stock", {})
    })

    expect(ReportService.requestExport).toHaveBeenCalledWith("stock", {})
    expect(ReportService.download).toHaveBeenCalledWith(7)
    expect(downloadBlob).toHaveBeenCalledWith(
      pdf,
      expect.stringMatching(/^relatorio_estoque_\d{4}-\d{2}-\d{2}_7\.pdf$/),
    )
    expect(openSpy).not.toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalled()
    openSpy.mockRestore()
  })

  it("avisa o erro do backend quando a geração falha e não baixa nada", async () => {
    ReportService.requestExport.mockResolvedValue({ id: 8, status: "pending" })
    ReportService.getStatus.mockResolvedValue({
      id: 8,
      status: "failed",
      error_message: "Erro ao gerar PDF",
    })
    const result = setup()

    await act(async () => {
      await result.current.exportReport("orders", { status: "aberta" })
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao gerar PDF")
    expect(ReportService.download).not.toHaveBeenCalled()
    expect(downloadBlob).not.toHaveBeenCalled()
  })

  it("avisa quando o relatório termina sem arquivo", async () => {
    ReportService.requestExport.mockResolvedValue({ id: 9, status: "pending" })
    ReportService.getStatus.mockResolvedValue({ id: 9, status: "done", file_url: null })
    const result = setup()

    await act(async () => {
      await result.current.exportReport("budgets", {})
    })

    expect(toast.error).toHaveBeenCalledWith("Relatório concluído, mas sem arquivo.")
    expect(downloadBlob).not.toHaveBeenCalled()
  })
})
