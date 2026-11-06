import { describe, it, expect, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import DashboardLayout from "./DashboardLayout"

describe("<DashboardLayout>", () => {
  beforeEach(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        business_id: 1,
        role: "gerente",
        permissions: ["businesses.view_business", "businesses.change_business"],
      }),
    )
    server.use(
      http.get(`${API}/configuracoes/licenca/`, () => HttpResponse.json(null)),
      http.get(`${API}/configuracoes/certificado/`, () =>
        HttpResponse.json({
          installed: true,
          holder_name: "OFICINA DO JOAO LTDA",
          cnpj: "07181156000165",
          valid_from: "2025-11-20T12:00:00Z",
          valid_until: "2026-11-20T12:00:00Z",
          fingerprint_sha256: "ab".repeat(32),
          uploaded_at: "2025-11-21T12:00:00Z",
          uploaded_by_name: "Maria Gerente",
          status: "expiring",
          days_until_expiry: 16,
        }),
      ),
    )
  })

  it("mostra o aviso de vencimento do certificado acima do conteúdo da página", async () => {
    renderWithProviders(
      <DashboardLayout>
        <p>Conteúdo da página</p>
      </DashboardLayout>,
    )

    const banner = await screen.findByText("O certificado digital da empresa vence em 20/11/2026.")
    const content = screen.getByText("Conteúdo da página")
    expect(banner.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByRole("link", { name: "Atualizar certificado" })).toHaveAttribute(
      "href",
      "/configuracoes",
    )
  })
})
