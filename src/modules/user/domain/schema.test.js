import { describe, it, expect } from "vitest"
import { toUserPayload, toUserEditPayload, toChangePasswordPayload } from "./schema"

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
  // PATCH /usuarios/<id>/ rejeita "password" no payload (400) — não existe
  // mais campo de senha nesse form, então não tem o que remover/manter aqui.
  const editBase = { name: "Ana", email: "ana@a.com", business_id: "3", role: "colaborador" }

  it("business_id vazio é omitido; preenchido é mantido", () => {
    expect(toUserEditPayload({ ...editBase, business_id: "" })).not.toHaveProperty("business_id")
    expect(toUserEditPayload(editBase).business_id).toBe("3")
  })

  it("não inclui password nem confirmPassword", () => {
    const payload = toUserEditPayload(editBase)
    expect(payload).not.toHaveProperty("password")
    expect(payload).not.toHaveProperty("confirmPassword")
  })
})

describe("toChangePasswordPayload", () => {
  it("manda current_password e renomeia password -> new_password", () => {
    const payload = toChangePasswordPayload({
      current_password: "Atual@123",
      password: "Nova@123",
      confirmPassword: "Nova@123",
    })
    expect(payload).toEqual({ current_password: "Atual@123", new_password: "Nova@123" })
  })
})
