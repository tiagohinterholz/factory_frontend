import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import WhatsAppButton from "./WhatsAppButton"

describe("<WhatsAppButton>", () => {
  it("linka pro WhatsApp Web do número, numa aba nova", () => {
    render(<WhatsAppButton phone="(41) 91266-2552" />)

    const link = screen.getByRole("link", { name: /abrir conversa no whatsapp/i })
    expect(link).toHaveAttribute("href", "https://wa.me/5541912662552")
    expect(link).toHaveAttribute("target", "_blank")
  })

  it("sem telefone, não renderiza nada", () => {
    const { container } = render(<WhatsAppButton phone={null} />)
    expect(container).toBeEmptyDOMElement()
  })
})
