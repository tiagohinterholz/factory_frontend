import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { renderWithProviders } from "@/test/render"
import FiscalNoteDocuments from "./FiscalNoteDocuments"
import { OrderService } from "@/modules/order/services/order"
import { openPdfBlob } from "@/api/open-pdf"
import { downloadBlob } from "@/api/download-blob"

vi.mock("@/api/open-pdf", () => ({ openPdfBlob: vi.fn() }))
vi.mock("@/api/download-blob", () => ({ downloadBlob: vi.fn() }))
vi.mock("@/modules/order/services/order", () => ({
  OrderService: {
    getFiscalNoteDanfe: vi.fn(),
    getFiscalNoteXml: vi.fn(),
    getServiceFiscalNoteDanfse: vi.fn(),
    getServiceFiscalNoteXml: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe("<FiscalNoteDocuments kind='service'>", () => {
  it("abre o DANFSe gerado pela rota autenticada da ordem", async () => {
    const blob = new Blob(["pdf"], { type: "application/pdf" })
    OrderService.getServiceFiscalNoteDanfse.mockResolvedValue(blob)
    renderWithProviders(<FiscalNoteDocuments kind="service" orderId={42} number="7" />)

    fireEvent.click(screen.getByRole("button", { name: /danfse/i }))

    await waitFor(() => expect(openPdfBlob).toHaveBeenCalledWith(blob))
    expect(OrderService.getServiceFiscalNoteDanfse).toHaveBeenCalledWith(42)
    expect(OrderService.getFiscalNoteDanfe).not.toHaveBeenCalled()
  })

  it("baixa o XML autorizado com o número da nota no nome do arquivo", async () => {
    const blob = new Blob(["<NFSe/>"], { type: "application/xml" })
    OrderService.getServiceFiscalNoteXml.mockResolvedValue(blob)
    renderWithProviders(<FiscalNoteDocuments kind="service" orderId={42} number="7" />)

    fireEvent.click(screen.getByRole("button", { name: /xml/i }))

    await waitFor(() => expect(downloadBlob).toHaveBeenCalledWith(blob, "nfse_7.xml"))
    expect(OrderService.getServiceFiscalNoteXml).toHaveBeenCalledWith(42)
  })

  it("mostra erro no toast quando o DANFSe não pode ser gerado", async () => {
    OrderService.getServiceFiscalNoteDanfse.mockRejectedValue(new Error("boom"))
    renderWithProviders(<FiscalNoteDocuments kind="service" orderId={42} number="7" />)

    fireEvent.click(screen.getByRole("button", { name: /danfse/i }))

    expect(await screen.findByText(/não foi possível gerar o danfse/i)).toBeInTheDocument()
    expect(openPdfBlob).not.toHaveBeenCalled()
  })

  it("variante de ícone expõe rótulos acessíveis para as duas ações", () => {
    renderWithProviders(
      <FiscalNoteDocuments kind="service" orderId={42} number="7" variant="icon" />,
    )

    expect(screen.getByRole("button", { name: "Abrir DANFSe" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Baixar XML da NFS-e" })).toBeInTheDocument()
  })
})

describe("<FiscalNoteDocuments kind='product'>", () => {
  it("abre o DANFE da NF-e pela rota autenticada da ordem", async () => {
    const blob = new Blob(["pdf"], { type: "application/pdf" })
    OrderService.getFiscalNoteDanfe.mockResolvedValue(blob)
    renderWithProviders(<FiscalNoteDocuments kind="product" orderId={30} number="15" />)

    fireEvent.click(screen.getByRole("button", { name: "DANFE" }))

    await waitFor(() => expect(openPdfBlob).toHaveBeenCalledWith(blob))
    expect(OrderService.getFiscalNoteDanfe).toHaveBeenCalledWith(30)
    expect(OrderService.getServiceFiscalNoteDanfse).not.toHaveBeenCalled()
  })

  it("baixa o XML da NF-e como nfe_<número>.xml", async () => {
    const blob = new Blob(["<nfeProc/>"], { type: "application/xml" })
    OrderService.getFiscalNoteXml.mockResolvedValue(blob)
    renderWithProviders(<FiscalNoteDocuments kind="product" orderId={30} number="15" />)

    fireEvent.click(screen.getByRole("button", { name: /xml/i }))

    await waitFor(() => expect(downloadBlob).toHaveBeenCalledWith(blob, "nfe_15.xml"))
    expect(OrderService.getFiscalNoteXml).toHaveBeenCalledWith(30)
    expect(OrderService.getServiceFiscalNoteXml).not.toHaveBeenCalled()
  })

  it("mostra erro no toast quando o XML da NF-e não pode ser baixado", async () => {
    OrderService.getFiscalNoteXml.mockRejectedValue(new Error("boom"))
    renderWithProviders(<FiscalNoteDocuments kind="product" orderId={30} number="15" />)

    fireEvent.click(screen.getByRole("button", { name: /xml/i }))

    expect(await screen.findByText("Não foi possível baixar o XML da NF-e.")).toBeInTheDocument()
    expect(downloadBlob).not.toHaveBeenCalled()
  })

  it("variante de ícone usa os rótulos da NF-e", () => {
    renderWithProviders(
      <FiscalNoteDocuments kind="product" orderId={30} number="15" variant="icon" />,
    )

    expect(screen.getByRole("button", { name: "Abrir DANFE" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Baixar XML da NF-e" })).toBeInTheDocument()
  })
})
