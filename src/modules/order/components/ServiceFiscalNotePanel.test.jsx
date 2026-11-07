import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, fireEvent } from "@testing-library/react"
import { renderWithProviders } from "@/test/render"
import ServiceFiscalNotePanel from "./ServiceFiscalNotePanel"
import { useServiceFiscalNote } from "@/modules/order/hooks/useServiceFiscalNote"

vi.mock("@/modules/order/hooks/useServiceFiscalNote", () => ({
  useServiceFiscalNote: vi.fn(),
}))

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

describe("<ServiceFiscalNotePanel>", () => {
  it("nota falhou: mostra só a tag Falhou, sem o erro cru, com uma ação pra ver o motivo", async () => {
    useServiceFiscalNote.mockReturnValue({
      note: { status: "failed", error_message: "cTribNac inválido" },
      loading: false,
      emit: vi.fn(),
      emitting: false,
    })

    renderWithProviders(<ServiceFiscalNotePanel orderId="1" />)

    expect(screen.getByText("Falhou")).toBeInTheDocument()
    expect(screen.queryByText("cTribNac inválido")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Ver motivo da falha na NFS-e" }))

    expect(await screen.findByText("cTribNac inválido")).toBeInTheDocument()
  })

  it("nota emitida com XML guardado: oferece DANFSe e XML pela rota autenticada", () => {
    useServiceFiscalNote.mockReturnValue({
      note: {
        status: "issued",
        number: "2",
        access_key: "43021052207181156000165000000000000226115702272762",
        has_xml: true,
        danfe_url: null,
        xml_url: null,
      },
      loading: false,
      emit: vi.fn(),
      emitting: false,
    })

    renderWithProviders(<ServiceFiscalNotePanel orderId="1" />)

    expect(screen.getByRole("button", { name: /danfse/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /xml/i })).toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })

  it("nota antiga sem XML guardado: mantém os links externos", () => {
    useServiceFiscalNote.mockReturnValue({
      note: {
        status: "issued",
        number: "9",
        has_xml: false,
        danfe_url: "https://exemplo.test/danfse.pdf",
        xml_url: "https://exemplo.test/nota.xml",
      },
      loading: false,
      emit: vi.fn(),
      emitting: false,
    })

    renderWithProviders(<ServiceFiscalNotePanel orderId="1" />)

    expect(screen.getByRole("link", { name: /danfe/i })).toHaveAttribute(
      "href",
      "https://exemplo.test/danfse.pdf",
    )
    expect(screen.queryByRole("button", { name: /danfse/i })).not.toBeInTheDocument()
  })
})
