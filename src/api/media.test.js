import { describe, it, expect } from "vitest"
import { resolveMediaUrl, base64ImageDataUri } from "./media"

// nos testes VITE_API_URL = http://localhost:8000 (vite.config.js)
describe("resolveMediaUrl", () => {
  it("prefixa caminho relativo do Django com o host da API", () => {
    expect(resolveMediaUrl("/media/logos/x.png")).toBe("http://localhost:8000/media/logos/x.png")
    expect(resolveMediaUrl("media/logos/x.png")).toBe("http://localhost:8000/media/logos/x.png")
  })

  it("deixa URL absoluta, blob: e data: intactas", () => {
    expect(resolveMediaUrl("https://cdn.exemplo.com/x.png")).toBe("https://cdn.exemplo.com/x.png")
    expect(resolveMediaUrl("blob:abc")).toBe("blob:abc")
    expect(resolveMediaUrl("data:image/png;base64,AAA")).toBe("data:image/png;base64,AAA")
  })

  it("valor vazio devolve string vazia", () => {
    expect(resolveMediaUrl("")).toBe("")
    expect(resolveMediaUrl(null)).toBe("")
    expect(resolveMediaUrl(undefined)).toBe("")
  })
})

describe("base64ImageDataUri", () => {
  it("monta data-URI PNG a partir do base64 cru (assinatura iVBOR)", () => {
    expect(base64ImageDataUri("iVBORw0KGgoAAA")).toBe("data:image/png;base64,iVBORw0KGgoAAA")
  })

  it("infere JPEG pela assinatura /9j/", () => {
    expect(base64ImageDataUri("/9j/4AAQSkZJRg")).toBe("data:image/jpeg;base64,/9j/4AAQSkZJRg")
  })

  it("não mexe num data-URI já pronto e trata vazio", () => {
    expect(base64ImageDataUri("data:image/png;base64,AAA")).toBe("data:image/png;base64,AAA")
    expect(base64ImageDataUri("")).toBe("")
    expect(base64ImageDataUri(null)).toBe("")
  })
})
