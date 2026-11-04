import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { renderWithProviders } from "@/test/render"
import CertificatePanel from "./CertificatePanel"
import { BusinessService } from "@/modules/business/services/business"

vi.mock("@/modules/business/services/business", () => ({
  BusinessService: {
    getCertificate: vi.fn(),
    uploadCertificate: vi.fn(),
  },
}))

const installed = {
  installed: true,
  holder_name: "OFICINA DO JOAO LTDA",
  cnpj: "07181156000165",
  valid_from: "2026-03-10T12:00:00Z",
  valid_until: "2027-03-10T12:00:00Z",
  fingerprint_sha256: "ab".repeat(32),
  uploaded_at: "2026-10-01T12:00:00Z",
  uploaded_by_name: "Maria Gerente",
  status: "valid",
  days_until_expiry: 126,
}

function pickFile(name = "certificado.pfx") {
  const file = new File(["pfx"], name, { type: "application/x-pkcs12" })
  fireEvent.change(screen.getByLabelText(/arquivo do certificado/i), {
    target: { files: [file] },
  })
  return file
}

function typePassword(value) {
  fireEvent.change(screen.getByLabelText(/senha do certificado/i), { target: { value } })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("<CertificatePanel> estados", () => {
  it("sem certificado mostra que nenhum está instalado", async () => {
    BusinessService.getCertificate.mockResolvedValue({ installed: false })
    renderWithProviders(<CertificatePanel canManage={false} />)

    expect(await screen.findByText("Nenhum certificado instalado")).toBeInTheDocument()
    expect(screen.queryByText("Válido")).not.toBeInTheDocument()
  })

  it("certificado válido mostra titular, CNPJ, validade e quem enviou", async () => {
    BusinessService.getCertificate.mockResolvedValue(installed)
    renderWithProviders(<CertificatePanel canManage={false} />)

    expect(await screen.findByText("Válido")).toBeInTheDocument()
    expect(screen.getByText("OFICINA DO JOAO LTDA")).toBeInTheDocument()
    expect(screen.getByText("07.181.156/0001-65")).toBeInTheDocument()
    expect(screen.getByText("10/03/2026 a 10/03/2027")).toBeInTheDocument()
    expect(screen.getByText("Maria Gerente em 01/10/2026")).toBeInTheDocument()
    expect(screen.queryByText("Nenhum certificado instalado")).not.toBeInTheDocument()
  })

  it("certificado perto de vencer mostra em quantos dias vence", async () => {
    BusinessService.getCertificate.mockResolvedValue({
      ...installed,
      status: "expiring",
      days_until_expiry: 12,
    })
    renderWithProviders(<CertificatePanel canManage={false} />)

    expect(await screen.findByText("Vence em 12 dias")).toBeInTheDocument()
    expect(screen.getByText("10/03/2026 a 10/03/2027")).toBeInTheDocument()
  })

  it("certificado vencido avisa que a emissão está bloqueada", async () => {
    BusinessService.getCertificate.mockResolvedValue({
      ...installed,
      status: "expired",
      days_until_expiry: -3,
    })
    renderWithProviders(<CertificatePanel canManage={false} />)

    expect(await screen.findByText("Vencido — emissão bloqueada")).toBeInTheDocument()
    expect(screen.getByText("OFICINA DO JOAO LTDA")).toBeInTheDocument()
  })
})

describe("<CertificatePanel> envio", () => {
  it("quem não gerencia o negócio não vê o formulário de envio", async () => {
    BusinessService.getCertificate.mockResolvedValue(installed)
    renderWithProviders(<CertificatePanel canManage={false} />)

    await screen.findByText("OFICINA DO JOAO LTDA")
    expect(screen.queryByLabelText(/arquivo do certificado/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/senha do certificado/i)).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /certificado/i })).not.toBeInTheDocument()
  })

  it("gerente sem certificado vê o formulário com Enviar certificado", async () => {
    BusinessService.getCertificate.mockResolvedValue({ installed: false })
    renderWithProviders(<CertificatePanel canManage />)

    await screen.findByText("Nenhum certificado instalado")
    const fileInput = screen.getByLabelText(/arquivo do certificado/i)
    expect(fileInput).toHaveAttribute("type", "file")
    expect(fileInput).toHaveAttribute("accept", ".pfx,.p12")
    expect(screen.getByLabelText(/senha do certificado/i)).toHaveAttribute("type", "password")
    expect(screen.getByRole("button", { name: "Enviar certificado" })).toBeInTheDocument()
  })

  it("gerente com certificado instalado vê Substituir certificado", async () => {
    BusinessService.getCertificate.mockResolvedValue(installed)
    renderWithProviders(<CertificatePanel canManage />)

    expect(
      await screen.findByRole("button", { name: "Substituir certificado" }),
    ).toBeInTheDocument()
  })

  it("envia arquivo e senha, atualiza os metadados e limpa a senha", async () => {
    BusinessService.getCertificate.mockResolvedValueOnce({ installed: false })
    BusinessService.getCertificate.mockResolvedValue(installed)
    BusinessService.uploadCertificate.mockResolvedValue(installed)
    renderWithProviders(<CertificatePanel canManage />)

    await screen.findByText("Nenhum certificado instalado")
    const file = pickFile()
    typePassword("segredo")
    fireEvent.click(screen.getByRole("button", { name: "Enviar certificado" }))

    await waitFor(() =>
      expect(BusinessService.uploadCertificate).toHaveBeenCalledWith(file, "segredo"),
    )
    expect(await screen.findByText("OFICINA DO JOAO LTDA")).toBeInTheDocument()
    expect(BusinessService.getCertificate).toHaveBeenCalledTimes(2)
    expect(screen.getByLabelText(/senha do certificado/i)).toHaveValue("")
    expect(screen.queryByText("Nenhum certificado instalado")).not.toBeInTheDocument()
  })

  it("mostra a mensagem do backend quando o envio é recusado e limpa a senha", async () => {
    const detail = "Senha incorreta ou arquivo não é um certificado A1 válido."
    BusinessService.getCertificate.mockResolvedValue(installed)
    BusinessService.uploadCertificate.mockRejectedValue({
      response: { status: 400, data: { detail } },
    })
    renderWithProviders(<CertificatePanel canManage />)

    await screen.findByText("OFICINA DO JOAO LTDA")
    pickFile()
    typePassword("errada")
    fireEvent.click(screen.getByRole("button", { name: "Substituir certificado" }))

    expect(await screen.findByText(detail)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha do certificado/i)).toHaveValue("")
    expect(screen.getByText("OFICINA DO JOAO LTDA")).toBeInTheDocument()
    expect(BusinessService.getCertificate).toHaveBeenCalledTimes(1)
  })
})
