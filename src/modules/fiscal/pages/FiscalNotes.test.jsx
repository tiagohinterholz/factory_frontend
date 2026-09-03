import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { renderWithProviders } from "@/test/render"
import FiscalNotes from "./FiscalNotes"

describe("<FiscalNotes>", () => {
  it("renderiza o placeholder de notas fiscais", () => {
    renderWithProviders(<FiscalNotes />)

    expect(screen.getByRole("heading", { name: "Notas Fiscais" })).toBeInTheDocument()
    expect(screen.getByText(/em construção/i)).toBeInTheDocument()
  })
})
