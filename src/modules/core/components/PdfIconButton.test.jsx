import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { renderWithProviders } from "@/test/render"
import PdfIconButton from "./PdfIconButton"
import { openPdfBlob } from "@/api/open-pdf"

vi.mock("@/api/open-pdf", () => ({ openPdfBlob: vi.fn() }))

describe("<PdfIconButton>", () => {
  it("chama o request e abre o blob devolvido", async () => {
    const blob = new Blob(["pdf"], { type: "application/pdf" })
    const request = vi.fn().mockResolvedValue(blob)
    renderWithProviders(<PdfIconButton request={request} title="Baixar PDF do produto" />)

    fireEvent.click(screen.getByRole("button", { name: /baixar pdf do produto/i }))

    await waitFor(() => expect(request).toHaveBeenCalled())
    expect(openPdfBlob).toHaveBeenCalledWith(blob)
  })

  it("mostra erro no toast quando o request falha", async () => {
    const request = vi.fn().mockRejectedValue(new Error("boom"))
    renderWithProviders(<PdfIconButton request={request} />)

    fireEvent.click(screen.getByRole("button", { name: /baixar pdf/i }))

    expect(await screen.findByText(/não foi possível gerar o pdf/i)).toBeInTheDocument()
  })
})
