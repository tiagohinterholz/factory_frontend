import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import LicenseList from "./LicenseList"

function mockLicenses(results) {
  server.use(
    http.get(`${API}/empreendimentos/licencas/`, () =>
      HttpResponse.json(
        results ?? [
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
      ),
    ),
  )
}

describe("<LicenseList>", () => {
  it("renderiza a tabela com os dados da API", async () => {
    mockLicenses()
    renderWithProviders(<LicenseList />)

    expect(await screen.findByText("Ativo")).toBeInTheDocument()
    expect(screen.getByText("120 dias")).toBeInTheDocument()
  })

  it("razão social da linha linka pro cadastro do empreendimento", async () => {
    mockLicenses()
    renderWithProviders(<LicenseList />)

    expect(await screen.findByRole("link", { name: "Oficina Central" })).toHaveAttribute(
      "href",
      "/empreendimentos/8",
    )
  })
})
