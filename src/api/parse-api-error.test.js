import { describe, it, expect } from "vitest"
import { parseApiError } from "./parse-api-error"

const withResponse = (status, data) => ({ response: { status, data } })

describe("parseApiError", () => {
  it("sem response -> mensagem de conexão", () => {
    expect(parseApiError(new Error("Network Error")).message).toMatch(/sem conexão/i)
    expect(parseApiError({}).fields).toEqual({})
  })

  it("status >= 500 -> mensagem de servidor", () => {
    expect(parseApiError(withResponse(500, { detail: "x" })).message).toMatch(/servidor/i)
    expect(parseApiError(withResponse(503, "")).message).toMatch(/servidor/i)
  })

  it("corpo string -> a própria string (trim)", () => {
    expect(parseApiError(withResponse(400, "  Deu ruim  ")).message).toBe("Deu ruim")
  })

  it("DRF: erros por campo -> fields + message = 1º campo", () => {
    const result = parseApiError(withResponse(400, { cpf: ["Já existe."], email: ["Inválido."] }))
    expect(result.fields).toEqual({ cpf: "Já existe.", email: "Inválido." })
    expect(result.message).toBe("Já existe.")
  })

  it("DRF: non_field_errors ganha da mensagem de campo", () => {
    const result = parseApiError(
      withResponse(400, { cpf: ["Erro de campo."], non_field_errors: ["Erro geral."] }),
    )
    expect(result.message).toBe("Erro geral.")
    expect(result.fields).toEqual({ cpf: "Erro de campo." })
  })

  it("{ detail } -> message = detail", () => {
    expect(parseApiError(withResponse(404, { detail: "Não encontrado." })).message).toBe(
      "Não encontrado.",
    )
  })

  it("array com valores não-string é filtrado e juntado", () => {
    const result = parseApiError(withResponse(400, { nome: ["a", 1, "b"] }))
    expect(result.fields.nome).toBe("a b")
  })

  it("objeto vazio -> fallback custom", () => {
    expect(parseApiError(withResponse(400, {}), "Meu fallback").message).toBe("Meu fallback")
  })

  it("data null -> fallback", () => {
    expect(parseApiError(withResponse(400, null), "fb").message).toBe("fb")
  })
})
