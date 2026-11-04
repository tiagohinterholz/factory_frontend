import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { renderWithProviders } from "@/test/render"
import ServiceFiscalNoteDocuments from "./ServiceFiscalNoteDocuments"
import { OrderService } from "@/modules/order/services/order"
import { openPdfBlob } from "@/api/open-pdf"
import { downloadBlob } from "@/api/download-blob"

vi.mock("@/api/open-pdf", () => ({ openPdfBlob: vi.fn() }))
vi.mock("@/api/download-blob", () => ({ downloadBlob: vi.fn() }))
vi.mock("@/modules/order/services/order", () => ({
  OrderService: {
    getServiceFiscalNoteDanfse: vi.fn(),
    getServiceFiscalNoteXml: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe("<ServiceFiscalNoteDocuments>", () => {
  it("abre o DANFSe gerado pela rota autenticada da ordem", async () => {
    const blob = new Blob(["pdf"], { type: "application/pdf" })
    OrderService.getServiceFiscalNoteDanfse.mockResolvedValue(blob)
    renderWithProviders(<ServiceFiscalNoteDocuments orderId={42} number="7" />)

    fireEvent.click(screen.getByRole("button", { name: /danfse/i }))

    await waitFor(() => expect(openPdfBlob).toHaveBeenCalledWith(blob))
    expect(OrderService.getServiceFiscalNoteDanfse).toHaveBeenCalledWith(42)
  })

  it("baixa o XML autorizado com o número da nota no nome do arquivo", async () => {
    const blob = new Blob(["<NFSe/>"], { type: "application/xml" })
    OrderService.getServiceFiscalNoteXml.mockResolvedValue(blob)
    renderWithProviders(<ServiceFiscalNoteDocuments orderId={42} number="7" />)

    fireEvent.click(screen.getByRole("button", { name: /xml/i }))

    await waitFor(() => expect(downloadBlob).toHaveBeenCalledWith(blob, "nfse_7.xml"))
    expect(OrderService.getServiceFiscalNoteXml).toHaveBeenCalledWith(42)
  })

  it("mostra erro no toast quando o DANFSe não pode ser gerado", async () => {
    OrderService.getServiceFiscalNoteDanfse.mockRejectedValue(new Error("boom"))
    renderWithProviders(<ServiceFiscalNoteDocuments orderId={42} number="7" />)

    fireEvent.click(screen.getByRole("button", { name: /danfse/i }))

    expect(await screen.findByText(/não foi possível gerar o danfse/i)).toBeInTheDocument()
    expect(openPdfBlob).not.toHaveBeenCalled()
  })

  it("variante de ícone expõe rótulos acessíveis para as duas ações", () => {
    renderWithProviders(<ServiceFiscalNoteDocuments orderId={42} number="7" variant="icon" />)

    expect(screen.getByRole("button", { name: "Abrir DANFSe" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Baixar XML da NFS-e" })).toBeInTheDocument()
  })
})
