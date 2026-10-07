import { describe, it, expect } from "vitest"
import { clientSchema, toClientPayload } from "./schema"

const base = {
  business_id: "3",
  client_type: "PF",
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

const basePJ = {
  ...base,
  client_type: "PJ",
  first_name: "",
  last_name: "",
  cpf: "",
  cnpj: "11.222.333/0001-44",
  corporate_name: "Frota Veloz Ltda",
  trade_name: "Frota Veloz",
}

describe("clientSchema", () => {
  it("PF válido passa", () => {
    expect(clientSchema.safeParse(base).success).toBe(true)
  })

  it("PF sem cpf falha", () => {
    const result = clientSchema.safeParse({ ...base, cpf: "" })
    expect(result.success).toBe(false)
  })

  it("PF sem sobrenome falha", () => {
    const result = clientSchema.safeParse({ ...base, last_name: "" })
    expect(result.success).toBe(false)
  })

  it("PJ válido passa", () => {
    expect(clientSchema.safeParse(basePJ).success).toBe(true)
  })

  it("PJ sem cnpj falha", () => {
    const result = clientSchema.safeParse({ ...basePJ, cnpj: "" })
    expect(result.success).toBe(false)
  })

  it("PJ sem razão social falha", () => {
    const result = clientSchema.safeParse({ ...basePJ, corporate_name: "" })
    expect(result.success).toBe(false)
  })

  it("PJ não exige cpf/nome (só os campos de PF)", () => {
    const result = clientSchema.safeParse(basePJ)
    expect(result.success).toBe(true)
  })
})

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
