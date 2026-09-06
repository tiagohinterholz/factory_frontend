import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ClientList from "./ClientList"
import { ClientService } from "../services/client"
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
    const blob = new Blob(["%PDF-1.4"], { type: "application/pdf" })
    const getPdf = vi.spyOn(ClientService, "getClientPdf").mockResolvedValue(blob)

    renderWithProviders(<ClientList />)
    await screen.findByText("Ana Lima")

    fireEvent.click(screen.getByRole("button", { name: /baixar pdf do cliente/i }))

    await waitFor(() => expect(getPdf).toHaveBeenCalledWith(1))
    await waitFor(() => expect(openPdfBlob).toHaveBeenCalledWith(blob))

    getPdf.mockRestore()
  })

  it("abre o modal com os veículos do cliente e fecha", async () => {
    mockClients()
    server.use(
      http.get(`${API}/clientes/1/veiculos/`, () =>
        HttpResponse.json({
          results: [
            {
              id: 7,
              plate: "ABC-1D23",
              manufacturer: "VW",
              model: "Gol",
              year: 2020,
              year_model: 2021,
              color: "Prata",
              fuel: "flex",
            },
          ],
          count: 1,
        }),
      ),
    )

    renderWithProviders(<ClientList />)
    await screen.findByText("Ana Lima")

    fireEvent.click(screen.getByRole("button", { name: /ver veículos do cliente/i }))

    expect(await screen.findByRole("dialog", { name: /veículos de ana lima/i })).toBeInTheDocument()
    expect(await screen.findByText("VW Gol")).toBeInTheDocument()
    expect(screen.getByText(/ABC-1D23 · 2020\/2021 · Flex · Prata/)).toBeInTheDocument()

    // X do header + botão no rodapé compartilham o nome "Fechar"; o rodapé é o último
    const fechar = screen.getAllByRole("button", { name: "Fechar" })
    fireEvent.click(fechar[fechar.length - 1])
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })
})
