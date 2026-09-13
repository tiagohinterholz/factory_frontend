import { describe, it, expect } from "vitest"
import { whatsappLink } from "./whatsapp"

describe("whatsappLink", () => {
  it("telefone BR formatado (DDD + 9 dígitos) ganha o 55 na frente", () => {
    expect(whatsappLink("(41) 91266-2552")).toBe("https://wa.me/5541912662552")
  })

  it("telefone BR com 8 dígitos (fixo) também ganha o 55", () => {
    expect(whatsappLink("(41) 3222-1234")).toBe("https://wa.me/554132221234")
  })

  it("número já com o 55/código do país não duplica", () => {
    expect(whatsappLink("5541912662552")).toBe("https://wa.me/5541912662552")
  })

  it("sem telefone, ou vazio, vira null", () => {
    expect(whatsappLink(null)).toBeNull()
    expect(whatsappLink(undefined)).toBeNull()
    expect(whatsappLink("")).toBeNull()
  })
})
