import { describe, it, expect, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { Routes, Route } from "react-router-dom"
import { QueryClient } from "@tanstack/react-query"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import FiscalNotes from "./FiscalNotes"

const SERVICO_NOTE = {
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
}

const PRODUTO_NOTE = {
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
}

const NOTES_BY_KIND = { produto: [PRODUTO_NOTE], servico: [SERVICO_NOTE] }

let lastUrl

function mockApi(resultsByKind = NOTES_BY_KIND) {
  server.use(
    http.get(`${API}/notas-fiscais/`, ({ request }) => {
      lastUrl = new URL(request.url)
      const kind = lastUrl.searchParams.get("kind")
      const results = resultsByKind[kind] ?? []
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

const renderPage = (route, queryClient) =>
  renderWithProviders(
    <Routes>
      <Route path="/notas-fiscais/:kind" element={<FiscalNotes />} />
    </Routes>,
    { route, queryClient },
  )

describe("<FiscalNotes>", () => {
  beforeEach(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }),
    )
  })

  it("/notas-fiscais/nfe pede kind=produto e lista só as NF-e, com links pra OS e cliente", async () => {
    mockApi()
    renderPage("/notas-fiscais/nfe")

    expect(await screen.findByText("Notas Fiscais — NF-e")).toBeInTheDocument()
    expect(await screen.findByRole("link", { name: "OS #30" })).toHaveAttribute(
      "href",
      "/ordens/30",
    )
    expect(screen.getByRole("link", { name: "Bruno Souza" })).toHaveAttribute("href", "/clientes/6")
    expect(screen.queryByText("Ana Lima")).not.toBeInTheDocument()
    await waitFor(() => expect(lastUrl.searchParams.get("kind")).toBe("produto"))
  })

  it("/notas-fiscais/nfse pede kind=servico e lista só as NFS-e", async () => {
    mockApi()
    renderPage("/notas-fiscais/nfse")

    expect(await screen.findByText("Notas Fiscais — NFS-e")).toBeInTheDocument()
    expect(await screen.findByText("Emitida")).toBeInTheDocument()
    expect(screen.queryByText("Bruno Souza")).not.toBeInTheDocument()
    await waitFor(() => expect(lastUrl.searchParams.get("kind")).toBe("servico"))
  })

  it("NF-e e NFS-e não compartilham cache: trocar de rota troca os dados, não repete a tela anterior", async () => {
    mockApi()
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    const { unmount } = renderPage("/notas-fiscais/nfe", queryClient)
    expect(await screen.findByRole("link", { name: "Bruno Souza" })).toBeInTheDocument()
    unmount()

    renderPage("/notas-fiscais/nfse", queryClient)
    expect(await screen.findByRole("link", { name: "Ana Lima" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Bruno Souza" })).not.toBeInTheDocument()
  })

  it("não mostra o erro cru na listagem, só atrás de uma ação dedicada", async () => {
    mockApi()
    renderPage("/notas-fiscais/nfe")
    await screen.findByText("Falhou")

    expect(screen.queryByText("Rejeição 539: duplicidade")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Ver motivo da falha na NF-e" }))

    expect(await screen.findByText("Rejeição 539: duplicidade")).toBeInTheDocument()
  })

  it("oferece baixar PDF e XML só quando a nota tem os arquivos", async () => {
    mockApi()
    renderPage("/notas-fiscais/nfse")

    expect(await screen.findByRole("link", { name: "Baixar PDF da NFS-e" })).toHaveAttribute(
      "href",
      "https://focus/danfse.pdf",
    )
    expect(screen.getByRole("link", { name: "Baixar XML da NFS-e" })).toHaveAttribute(
      "href",
      "https://focus/nfse.xml",
    )
  })

  it("sem nenhuma nota mostra lista vazia, sem erro", async () => {
    mockApi({ produto: [], servico: [] })
    renderPage("/notas-fiscais/nfe")

    expect(await screen.findByText("Nenhum registro encontrado.")).toBeInTheDocument()
  })

  it("filtra por status, mantendo o kind fixo da rota", async () => {
    mockApi()
    renderPage("/notas-fiscais/nfse")
    await screen.findByText("Emitida")

    fireEvent.click(screen.getByRole("button", { name: /filtros/i }))
    fireEvent.click(screen.getByRole("button", { name: /selecione o\(a\) status/i }))
    fireEvent.click(await screen.findByRole("option", { name: "Emitida" }))
    fireEvent.click(screen.getByRole("button", { name: "Filtrar" }))

    await waitFor(() => expect(lastUrl.searchParams.get("status")).toBe("issued"))
    expect(lastUrl.searchParams.get("kind")).toBe("servico")
  })

  it("nota só com XML mostra o XML e não mostra link de PDF", async () => {
    mockApi({ produto: [], servico: [{ ...SERVICO_NOTE, pdf_url: null }] })
    renderPage("/notas-fiscais/nfse")

    expect(await screen.findByRole("link", { name: "Baixar XML da NFS-e" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Baixar PDF da NFS-e" })).not.toBeInTheDocument()
  })
})
