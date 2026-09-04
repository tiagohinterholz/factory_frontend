import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { renderWithProviders } from "@/test/render"
import RecordPdfButton from "./RecordPdfButton"
import { openPdfBlob } from "@/api/open-pdf"

vi.mock("@/api/open-pdf", () => ({ openPdfBlob: vi.fn() }))

describe("<RecordPdfButton>", () => {
  it("usa o label passado e abre o blob que o request devolver", async () => {
    const blob = new Blob(["pdf"], { type: "application/pdf" })
    const request = vi.fn().mockResolvedValue(blob)
    renderWithProviders(<RecordPdfButton request={request} label="Relatório de produtos" />)

    fireEvent.click(screen.getByRole("button", { name: /relatório de produtos/i }))

    await waitFor(() => expect(request).toHaveBeenCalled())
    expect(openPdfBlob).toHaveBeenCalledWith(blob)
  })

  it("mostra erro no toast quando o request falha", async () => {
    const request = vi.fn().mockRejectedValue(new Error("boom"))
    renderWithProviders(<RecordPdfButton request={request} />)

    fireEvent.click(screen.getByRole("button", { name: /exportar pdf/i }))

    expect(await screen.findByText(/não foi possível gerar o pdf/i)).toBeInTheDocument()
  })
})
