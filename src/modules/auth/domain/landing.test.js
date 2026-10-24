import { describe, it, expect } from "vitest"
import { landingPathFor } from "./landing"

describe("landingPathFor", () => {
  it("admin e superusuário caem no dashboard", () => {
    expect(landingPathFor({ business_id: 3, role: "admin", permissions: [] })).toBe("/dashboard")
    expect(landingPathFor({ role: "superuser" })).toBe("/dashboard")
  })

  it("papel operacional com acesso a OS cai no dashboard", () => {
    expect(
      landingPathFor({ business_id: 3, role: "atendente", permissions: ["orders.view_order"] }),
    ).toBe("/dashboard")
  })

  it("contador cai direto no financeiro, não no dashboard (RAD-P3-01)", () => {
    expect(
      landingPathFor({
        business_id: 3,
        role: "contador",
        permissions: [
          "orders.view_fiscalnote",
          "orders.view_servicefiscalnote",
          "financial.view_financialentry",
          "core.can_export_reports",
        ],
      }),
    ).toBe("/financeiro")
  })

  it("quem só vê notas fiscais cai em notas fiscais", () => {
    expect(
      landingPathFor({ business_id: 3, role: "x", permissions: ["orders.view_servicefiscalnote"] }),
    ).toBe("/notas-fiscais")
  })
})
