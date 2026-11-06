import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import { QueryClient } from "@tanstack/react-query"
import { renderWithProviders } from "@/test/render"
import { businessKeys } from "@/modules/business/domain/query-keys"
import CertificateExpiryBanner from "./CertificateExpiryBanner"
import { BusinessService } from "@/modules/business/services/business"

vi.mock("@/modules/business/services/business", () => ({
  BusinessService: {
    getCertificate: vi.fn(),
  },
}))

const certificate = {
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
}

function newQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

async function renderSettled() {
  const queryClient = newQueryClient()
  renderWithProviders(<CertificateExpiryBanner />, { queryClient })
  await waitFor(() =>
    expect(["success", "error"]).toContain(
      queryClient.getQueryState(businessKeys.certificate)?.status,
    ),
  )
}

function expectNoBanner() {
  expect(screen.queryByText(/certificado digital da empresa/i)).not.toBeInTheDocument()
  expect(screen.queryByRole("link", { name: "Atualizar certificado" })).not.toBeInTheDocument()
}

function loginAs(user) {
  localStorage.setItem("user", JSON.stringify(user))
}

const manager = {
  business_id: 1,
  role: "gerente",
  permissions: ["businesses.view_business", "businesses.change_business"],
}

beforeEach(() => {
  vi.clearAllMocks()
  loginAs(manager)
})

describe("<CertificateExpiryBanner>", () => {
  it("avisa o gerente com a data de vencimento quando o certificado está perto de vencer", async () => {
    BusinessService.getCertificate.mockResolvedValue(certificate)
    renderWithProviders(<CertificateExpiryBanner />)

    expect(
      await screen.findByText("O certificado digital da empresa vence em 20/11/2026."),
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Atualizar certificado" })).toHaveAttribute(
      "href",
      "/configuracoes",
    )
  })

  it("avisa que a emissão está bloqueada quando o certificado está vencido", async () => {
    BusinessService.getCertificate.mockResolvedValue({
      ...certificate,
      valid_until: "2026-10-30T12:00:00Z",
      status: "expired",
      days_until_expiry: -5,
    })
    renderWithProviders(<CertificateExpiryBanner />)

    expect(
      await screen.findByText(
        "O certificado digital da empresa venceu em 30/10/2026. A emissão de notas fiscais está bloqueada.",
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Atualizar certificado" })).toHaveAttribute(
      "href",
      "/configuracoes",
    )
  })

  it.each([
    ["válido", { ...certificate, status: "valid", days_until_expiry: 200 }],
    ["não instalado", { installed: false }],
  ])("não aparece quando o certificado está %s", async (_label, response) => {
    BusinessService.getCertificate.mockResolvedValue(response)
    await renderSettled()

    expectNoBanner()
  })

  it("não aparece quando a consulta do certificado falha", async () => {
    BusinessService.getCertificate.mockRejectedValue(new Error("boom"))
    await renderSettled()

    expectNoBanner()
  })

  it("não consulta nem mostra nada para quem não gerencia o negócio", async () => {
    loginAs({ business_id: 1, role: "atendente", permissions: ["businesses.view_business"] })
    BusinessService.getCertificate.mockResolvedValue(certificate)
    renderWithProviders(<CertificateExpiryBanner />)

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(BusinessService.getCertificate).not.toHaveBeenCalled()
    expectNoBanner()
  })

  it("não consulta para o superusuário, que não tem empresa vinculada", async () => {
    loginAs({ role: "admin" })
    BusinessService.getCertificate.mockResolvedValue(certificate)
    renderWithProviders(<CertificateExpiryBanner />)

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(BusinessService.getCertificate).not.toHaveBeenCalled()
    expectNoBanner()
  })
})
