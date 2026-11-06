import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import CertificateSettings from "./CertificateSettings"

function loginAs(role, permissions) {
  localStorage.setItem("user", JSON.stringify({ business_id: 1, role, permissions }))
}

beforeEach(() => {
  server.use(
    http.get(`${API}/configuracoes/certificado/`, () => HttpResponse.json({ installed: false })),
  )
})

afterEach(() => {
  localStorage.clear()
})

describe("<CertificateSettings>", () => {
  it("gerente vê o certificado digital com o envio liberado", async () => {
    loginAs("gerente", ["businesses.view_business", "businesses.change_business"])
    renderWithProviders(<CertificateSettings />)

    expect(
      screen.getByRole("heading", { level: 1, name: "Certificado digital" }),
    ).toBeInTheDocument()
    expect(await screen.findByText("Nenhum certificado instalado")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Enviar certificado" })).toBeInTheDocument()
  })

  it("atendente vê o certificado digital sem o formulário de envio", async () => {
    loginAs("atendente", ["businesses.view_business"])
    renderWithProviders(<CertificateSettings />)

    expect(await screen.findByText("Nenhum certificado instalado")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Enviar certificado" })).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/senha do certificado/i)).not.toBeInTheDocument()
  })
})
