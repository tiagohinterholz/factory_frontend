import { describe, it, expect } from "vitest"
import { toUserPayload, toUserEditPayload } from "./schema"

const base = {
  name: "Ana",
  email: "ana@a.com",
  business_id: "3",
  role: "colaborador",
  password: "Senha@123",
  confirmPassword: "Senha@123",
}

describe("toUserPayload (criação)", () => {
  it("remove confirmPassword", () => {
    expect(toUserPayload(base)).not.toHaveProperty("confirmPassword")
  })

  it("mantém a senha", () => {
    expect(toUserPayload(base).password).toBe("Senha@123")
  })

  it("business_id vazio é omitido; preenchido é mantido", () => {
    expect(toUserPayload({ ...base, business_id: "" })).not.toHaveProperty("business_id")
    expect(toUserPayload(base).business_id).toBe("3")
  })

  it("não muta o objeto recebido", () => {
    const values = { ...base }
    toUserPayload(values)
    expect(values).toHaveProperty("confirmPassword")
  })
})

describe("toUserEditPayload (edição)", () => {
  it("senha em branco é omitida (mantém a atual)", () => {
    const payload = toUserEditPayload({ ...base, password: "", confirmPassword: "" })
    expect(payload).not.toHaveProperty("password")
  })

  it("senha preenchida vai no payload", () => {
    expect(toUserEditPayload(base).password).toBe("Senha@123")
  })

  it("remove confirmPassword e business_id vazio", () => {
    const payload = toUserEditPayload({ ...base, business_id: "" })
    expect(payload).not.toHaveProperty("confirmPassword")
    expect(payload).not.toHaveProperty("business_id")
  })
})
