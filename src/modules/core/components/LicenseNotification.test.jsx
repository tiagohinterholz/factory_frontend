import { describe, it, expect, beforeEach } from "vitest"
import { screen, fireEvent } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import LicenseNotification from "./LicenseNotification"

// 1 jun -> 30 ago = 90 dias; com 34 restantes -> 56 usados.
const ACTIVATION = "2026-06-01T00:00:00Z"
const EXPIRATION = "2026-08-30T00:00:00Z"

function mockLicense(overrides = {}) {
  server.use(
    http.get(`${API}/empreendimentos/licencas/`, () =>
      HttpResponse.json([
        {
          id: 1,
          status: "ACTIVE",
          period: "TRIMESTRAL",
          activation_date: ACTIVATION,
          expiration_date: EXPIRATION,
          remaining_days: 34,
          max_users: 5,
          current_users: 3,
          ...overrides,
        },
      ]),
    ),
  )
}

const openBell = () => fireEvent.click(screen.getByRole("button", { name: /notificações/i }))

describe("<LicenseNotification>", () => {
  beforeEach(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }),
    )
  })

  it("fica fechado até clicar no sino", async () => {
    mockLicense()
    renderWithProviders(<LicenseNotification />)

    expect(screen.queryByText(/dias restantes/i)).not.toBeInTheDocument()
    openBell()
    expect(await screen.findByText(/dias restantes/i)).toBeInTheDocument()
  })

  it("mostra a barra com total, usado e restante", async () => {
    mockLicense()
    renderWithProviders(<LicenseNotification />)
    openBell()

    expect(await screen.findByText("56 de 90 dias usados")).toBeInTheDocument()
    expect(screen.getByText("34 dias restantes")).toBeInTheDocument()
    expect(screen.getByText("3 de 5 usuários")).toBeInTheDocument()
    expect(screen.getByText("Ativa")).toBeInTheDocument()
  })

  it("admin vê o link de renovar", async () => {
    mockLicense()
    renderWithProviders(<LicenseNotification />)
    openBell()

    expect(await screen.findByRole("link", { name: /renovar licença/i })).toHaveAttribute(
      "href",
      "/empreendimentos/licencas",
    )
  })

  it("não-admin não vê o link de renovar", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "u@u.com", business_id: 3 }))
    mockLicense()
    renderWithProviders(<LicenseNotification />)
    openBell()

    await screen.findByText(/dias restantes/i)
    expect(screen.queryByRole("link", { name: /renovar licença/i })).not.toBeInTheDocument()
  })

  it("marca o sino quando faltam poucos dias", async () => {
    mockLicense({ remaining_days: 5 })
    renderWithProviders(<LicenseNotification />)

    expect(await screen.findByTitle(/licença perto de expirar/i)).toBeInTheDocument()
  })

  it("não marca o sino quando a licença está tranquila", async () => {
    mockLicense({ remaining_days: 60 })
    renderWithProviders(<LicenseNotification />)
    openBell()

    await screen.findByText(/dias restantes/i)
    expect(screen.queryByTitle(/expirar/i)).not.toBeInTheDocument()
  })

  it("superusuário não tem licença própria", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "s@s.com" }))
    mockLicense()
    renderWithProviders(<LicenseNotification />)
    openBell()

    expect(await screen.findByText(/nenhuma licença associada/i)).toBeInTheDocument()
  })
})
