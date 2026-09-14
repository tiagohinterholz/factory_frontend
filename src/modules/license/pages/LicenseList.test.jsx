import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import LicenseList from "./LicenseList"

function mockLicenses(results) {
  server.use(
    http.get(`${API}/licencas/`, () =>
      HttpResponse.json({
        results: results ?? [
          {
            id: 1,
            business: { id: 8, corporate_name: "Oficina Central" },
            status: "ACTIVE",
            activation_date: "2026-01-01",
            expiration_date: "2027-01-01",
            remaining_days: 120,
            current_users: 3,
            max_users: 10,
          },
        ],
        count: 1,
      }),
    ),
  )
}

describe("<LicenseList>", () => {
  it("renderiza a tabela com os dados da API", async () => {
    mockLicenses()
    renderWithProviders(<LicenseList />)

    expect(await screen.findByText("Ativo")).toBeInTheDocument()
    expect(screen.getByText("Oficina Central")).toBeInTheDocument()
    expect(screen.getByText("120 dias")).toBeInTheDocument()
  })

  it("não tem mais ação de renovar por ID (saiu do contrato)", async () => {
    mockLicenses()
    renderWithProviders(<LicenseList />)

    await screen.findByText("Oficina Central")
    expect(screen.queryByText(/configurar\s*\/\s*renovar/i)).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /nova configuração/i })).not.toBeInTheDocument()
  })
})
