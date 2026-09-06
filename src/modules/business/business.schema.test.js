import { describe, it, expect } from "vitest"
import { toBusinessPayload } from "./business.schema"

const base = {
  corporate_name: "ACME LTDA",
  trade_name: "",
  cnpj: "12.345.678/0001-90",
  state_registration: "",
  municipal_registration: "",
  tax_regime: "simples_nacional",
  state_id: "5",
  city_id: "9",
  address: "Rua X",
  number: "10",
  complement: "",
  phone: "(11) 99999-9999",
  email: "a@a.com",
}

describe("toBusinessPayload", () => {
  it("sem arquivo novo, devolve objeto JSON sem o campo logo", () => {
    const payload = toBusinessPayload({ ...base, logo: "" })
    expect(payload).not.toBeInstanceOf(FormData)
    expect(payload).not.toHaveProperty("logo")
    expect(payload.corporate_name).toBe("ACME LTDA")
  })

  it("logo como string (URL existente) não é reenviado", () => {
    const payload = toBusinessPayload({ ...base, logo: "https://cdn/logo.png" })
    expect(payload).not.toHaveProperty("logo")
  })

  it("com File novo, vira FormData com o logo e os campos não-vazios", () => {
    const file = new File(["x"], "logo.png", { type: "image/png" })
    const payload = toBusinessPayload({ ...base, logo: file })

    expect(payload).toBeInstanceOf(FormData)
    expect(payload.get("logo")).toBe(file)
    expect(payload.get("corporate_name")).toBe("ACME LTDA")
    expect(payload.get("state_id")).toBe("5")
    // campos vazios são omitidos do multipart
    expect(payload.get("trade_name")).toBeNull()
    expect(payload.get("complement")).toBeNull()
  })
})
