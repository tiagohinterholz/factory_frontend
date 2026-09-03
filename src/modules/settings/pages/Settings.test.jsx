import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { renderWithProviders } from "@/test/render"
import Settings from "./Settings"

describe("<Settings>", () => {
  it("renderiza o placeholder de configurações", () => {
    renderWithProviders(<Settings />)

    expect(screen.getByRole("heading", { name: "Configurações" })).toBeInTheDocument()
    expect(screen.getByText(/em construção/i)).toBeInTheDocument()
  })
})
