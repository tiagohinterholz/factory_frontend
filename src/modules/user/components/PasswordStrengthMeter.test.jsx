import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { renderWithProviders } from "@/test/render"
import PasswordStrengthMeter from "./PasswordStrengthMeter"

describe("<PasswordStrengthMeter>", () => {
  it("sem senha, não mostra rótulo de força", () => {
    renderWithProviders(<PasswordStrengthMeter password="" />)
    expect(screen.queryByText(/muito fraca|fraca|média|forte/i)).not.toBeInTheDocument()
  })

  it("senha fraca mostra o rótulo correspondente e os requisitos que faltam", () => {
    renderWithProviders(<PasswordStrengthMeter password="abc" />)
    expect(screen.getByText(/muito fraca/i)).toBeInTheDocument()
    expect(screen.getByText(/1 número/i)).toBeInTheDocument()
  })

  it("senha que atende tudo mostra 'Muito forte'", () => {
    renderWithProviders(<PasswordStrengthMeter password="Abcdefg1!" />)
    expect(screen.getByText(/muito forte/i)).toBeInTheDocument()
  })
})
