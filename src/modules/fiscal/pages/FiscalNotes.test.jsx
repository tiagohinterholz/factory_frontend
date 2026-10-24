import { describe, it, expect, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import FiscalNotes from "./FiscalNotes"

const NOTES = [
  {
    id: "servico-4",
    note_id: 4,
    kind: "servico",
    kind_display: "NFS-e",
    order_id: 31,
    client_id: 5,
    client_name: "Ana Lima",
    status: "issued",
    status_display: "Emitida",
    number: "9",
    xml_url: "https://focus/nfse.xml",
    pdf_url: "https://focus/danfse.pdf",
    error_message: null,
    created_at: "2026-10-20T10:00:00-03:00",
  },
  {
    id: "produto-2",
    note_id: 2,
    kind: "produto",
    kind_display: "NF-e",
    order_id: 30,
    client_id: 6,
    client_name: "Bruno Souza",
    status: "failed",
    status_display: "Falhou",
    number: null,
    xml_url: null,
    pdf_url: null,
    error_message: "Rejeição 539: duplicidade",
    created_at: "2026-10-19T10:00:00-03:00",
  },
]

let lastUrl

function mockApi(results = NOTES) {
  server.use(
    http.get(`${API}/notas-fiscais/`, ({ request }) => {
      lastUrl = new URL(request.url)
      return HttpResponse.json({ results, count: results.length })
    }),
    http.get(`${API}/clientes/`, () =>
      HttpResponse.json({
        results: [{ id: 5, first_name: "Ana", last_name: "Lima", display_name: "Ana Lima" }],
        count: 1,
      }),
    ),
  )
}

describe("<FiscalNotes>", () => {
  beforeEach(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }),
    )
  })

  it("lista notas de produto e serviço com links pra OS e cliente (OSFIN-P3-02)", async () => {
    mockApi()
    renderWithProviders(<FiscalNotes />)

    expect(await screen.findByText("NFS-e")).toBeInTheDocument()
    expect(screen.getByText("NF-e")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "OS #31" })).toHaveAttribute("href", "/ordens/31")
    expect(screen.getByRole("link", { name: "Ana Lima" })).toHaveAttribute("href", "/clientes/5")
    expect(screen.getByText("Emitida")).toBeInTheDocument()
    expect(screen.getByText("Rejeição 539: duplicidade")).toBeInTheDocument()
    expect(screen.queryByText(/em construção/i)).not.toBeInTheDocument()
  })

  it("oferece baixar PDF e XML só quando a nota tem os arquivos", async () => {
    mockApi()
    renderWithProviders(<FiscalNotes />)

    expect(await screen.findByRole("link", { name: "Baixar PDF da NFS-e" })).toHaveAttribute(
      "href",
      "https://focus/danfse.pdf",
    )
    expect(screen.getByRole("link", { name: "Baixar XML da NFS-e" })).toHaveAttribute(
      "href",
      "https://focus/nfse.xml",
    )
    expect(screen.queryByRole("link", { name: "Baixar PDF da NF-e" })).not.toBeInTheDocument()
  })

  it("sem nenhuma nota mostra lista vazia, sem erro", async () => {
    mockApi([])
    renderWithProviders(<FiscalNotes />)

    expect(await screen.findByText("Nenhum registro encontrado.")).toBeInTheDocument()
  })

  it("filtra por tipo e status", async () => {
    mockApi()
    renderWithProviders(<FiscalNotes />)
    await screen.findByText("NFS-e")

    fireEvent.click(screen.getByRole("button", { name: /filtros/i }))
    fireEvent.click(await screen.findByRole("button", { name: /selecione o\(a\) tipo/i }))
    fireEvent.click(await screen.findByRole("option", { name: "NFS-e (serviço)" }))
    fireEvent.click(screen.getByRole("button", { name: /selecione o\(a\) status/i }))
    fireEvent.click(await screen.findByRole("option", { name: "Emitida" }))
    fireEvent.click(screen.getByRole("button", { name: "Filtrar" }))

    await waitFor(() => expect(lastUrl.searchParams.get("kind")).toBe("servico"))
    expect(lastUrl.searchParams.get("status")).toBe("issued")
  })
})
