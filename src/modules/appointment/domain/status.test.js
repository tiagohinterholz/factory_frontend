import { describe, it, expect, vi, afterEach } from "vitest"
import { appointmentStatusLabel } from "./status"

afterEach(() => vi.useRealTimers())

function freeze(iso) {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(iso))
}

describe("appointmentStatusLabel", () => {
  it("OS que já saiu de 'em andamento' → mostra o status da OS", () => {
    freeze("2026-09-10T12:00:00")
    expect(
      appointmentStatusLabel({
        date: "2026-09-01",
        time: "08:00:00",
        order: { status: "a faturar" },
      }),
    ).toBe("a faturar")
    expect(
      appointmentStatusLabel({
        date: "2026-09-01",
        time: "08:00:00",
        order: { status: "faturado" },
      }),
    ).toBe("faturado")
  })

  it("OS 'em andamento' cai na regra de data como se não tivesse OS", () => {
    freeze("2026-09-10T12:00:00")
    expect(
      appointmentStatusLabel({
        date: "2026-09-20",
        time: "08:00:00",
        order: { status: "em andamento" },
      }),
    ).toBe("Aguardando Execução")
  })

  it("sem OS, data/hora futura → Aguardando Execução", () => {
    freeze("2026-09-10T12:00:00")
    expect(appointmentStatusLabel({ date: "2026-09-10", time: "18:00:00", order: null })).toBe(
      "Aguardando Execução",
    )
  })

  it("sem OS, data/hora no passado ou agora → Em Andamento", () => {
    freeze("2026-09-10T12:00:00")
    expect(appointmentStatusLabel({ date: "2026-09-10", time: "09:00:00" })).toBe("Em Andamento")
  })

  it("aceita order como id cru (sem status) → cai na regra de data", () => {
    freeze("2026-09-10T12:00:00")
    expect(appointmentStatusLabel({ date: "2026-09-01", time: "08:00:00", order: 42 })).toBe(
      "Em Andamento",
    )
  })
})
