import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ClientList from "./ClientList"
import { openPdfBlob } from "@/api/open-pdf"

vi.mock("@/api/open-pdf", () => ({ openPdfBlob: vi.fn() }))

function mockClients() {
  server.use(
    http.get(`${API}/clientes/`, () =>
      HttpResponse.json({
        results: [{ id: 1, first_name: "Ana", last_name: "Lima", cpf: "111", phone: "999" }],
        count: 1,
      }),
    ),
  )
}

describe("<ClientList>", () => {
  it("renderiza a tabela com os dados da API", async () => {
    mockClients()
    renderWithProviders(<ClientList />)

    expect(screen.getByRole("heading", { name: /clientes/i })).toBeInTheDocument()
    expect(await screen.findByText("Ana Lima")).toBeInTheDocument()
  })

  it("mostra o estado de erro quando a API falha", async () => {
    server.use(http.get(`${API}/clientes/`, () => new HttpResponse(null, { status: 500 })))

    renderWithProviders(<ClientList />)

    expect(await screen.findByText(/não foi possível carregar/i)).toBeInTheDocument()
  })

  it("baixa o PDF do cliente pela linha da tabela", async () => {
    mockClients()
    let pdfRequested = false
    server.use(
      http.get(`${API}/clientes/1/pdf/`, () => {
        pdfRequested = true
        return HttpResponse.text("%PDF-1.4", {
          headers: { "Content-Type": "application/pdf" },
        })
      }),
    )

    renderWithProviders(<ClientList />)
    await screen.findByText("Ana Lima")

    fireEvent.click(screen.getByRole("button", { name: /baixar pdf do cliente/i }))

    await waitFor(() => expect(pdfRequested).toBe(true))
    await waitFor(() => expect(openPdfBlob).toHaveBeenCalled())
  })
})
