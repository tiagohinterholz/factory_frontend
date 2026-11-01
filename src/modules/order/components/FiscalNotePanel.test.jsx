import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, fireEvent } from "@testing-library/react"
import { renderWithProviders } from "@/test/render"
import FiscalNotePanel from "./FiscalNotePanel"
import { useFiscalNote } from "@/modules/order/hooks/useFiscalNote"

vi.mock("@/modules/order/hooks/useFiscalNote", () => ({ useFiscalNote: vi.fn() }))

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

describe("<FiscalNotePanel>", () => {
  it("nota falhou: mostra só a tag Falhou, sem o erro cru, com uma ação pra ver o motivo", async () => {
    useFiscalNote.mockReturnValue({
      note: { status: "failed", error_message: "Rejeição 539: duplicidade" },
      loading: false,
      emit: vi.fn(),
      emitting: false,
    })

    renderWithProviders(<FiscalNotePanel orderId="1" />)

    expect(screen.getByText("Falhou")).toBeInTheDocument()
    expect(screen.queryByText("Rejeição 539: duplicidade")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Ver motivo da falha na NF-e" }))

    expect(await screen.findByText("Rejeição 539: duplicidade")).toBeInTheDocument()
  })

  it("nota emitida não mostra ação de ver erro", async () => {
    useFiscalNote.mockReturnValue({
      note: { status: "issued", number: "123" },
      loading: false,
      emit: vi.fn(),
      emitting: false,
    })

    renderWithProviders(<FiscalNotePanel orderId="1" />)

    expect(await screen.findByText("Emitida")).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Ver motivo da falha na NF-e" }),
    ).not.toBeInTheDocument()
  })
})
