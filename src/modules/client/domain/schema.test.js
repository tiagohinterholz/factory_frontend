import { describe, it, expect } from "vitest"
import { toClientPayload } from "./schema"

const base = {
  business_id: "3",
  first_name: "Ana",
  last_name: "Lima",
  cpf: "123.456.789-09",
  state_id: "5",
  city_id: "9",
  address: "Rua X",
  number: "10",
  complement: "",
  phone: "(51) 99999-9999",
  email: "",
}

describe("toClientPayload", () => {
  it("email vazio é omitido (o serializer roda validate_email em '' e rejeita)", () => {
    expect(toClientPayload(base)).not.toHaveProperty("email")
  })

  it("email preenchido é mantido", () => {
    expect(toClientPayload({ ...base, email: "ana@a.com" }).email).toBe("ana@a.com")
  })

  it("cpf e telefone vão COM máscara (é o que o back valida)", () => {
    const payload = toClientPayload({ ...base, email: "ana@a.com" })
    expect(payload.cpf).toBe("123.456.789-09")
    expect(payload.phone).toBe("(51) 99999-9999")
  })

  it("não muta o objeto recebido", () => {
    const values = { ...base }
    toClientPayload(values)
    expect(values).toHaveProperty("email")
  })
})
