import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import OrderList from "./OrderList"
import { OrderService } from "../services/order"

vi.mock("@/api/open-pdf", () => ({ openPdfBlob: vi.fn() }))

function mockOrders(results) {
  server.use(
    http.get(`${API}/ordens/`, () =>
      HttpResponse.json({
        results: results ?? [
          {
            id: 10,
            first_name: "Ana",
            vehicle_name: "Gol ABC1D23",
            status: "a faturar",
            total: "150.00",
          },
        ],
        count: (results ?? [1]).length,
      }),
    ),
    http.get(`${API}/clientes/`, () =>
      HttpResponse.json({
        results: [{ id: 5, first_name: "Ana", last_name: "Lima", display_name: "Ana Lima" }],
        count: 1,
      }),
    ),
  )
}

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

describe("<OrderList> — links de cliente e veículo", () => {
  it("cliente e veículo aninhados na linha viram link pro cadastro deles", async () => {
    mockOrders([
      {
        id: 20,
        client: { id: 6, first_name: "Beto", last_name: "Souza", display_name: "Beto Souza" },
        vehicle: { id: 12, model: "Onix", plate: "XYZ9K88" },
        status: "em andamento",
        total: "0",
      },
    ])
    renderWithProviders(<OrderList />)

    await screen.findByText("#20")
    expect(screen.getByRole("link", { name: /beto souza/i })).toHaveAttribute("href", "/clientes/6")
    expect(screen.getByRole("link", { name: "Onix" })).toHaveAttribute("href", "/veiculos/12")
    expect(screen.getByRole("cell", { name: "XYZ9K88" })).toBeInTheDocument()
  })
})

describe("<OrderList> — ações da linha", () => {
  it("mostra o botão de PDF em toda linha", async () => {
    mockOrders()
    renderWithProviders(<OrderList />)
    await screen.findByText("#10")

    expect(screen.getByRole("button", { name: /gerar pdf da os/i })).toBeInTheDocument()
  })

  it("'Faturar OS' só aparece na OS 'a faturar' e dispara o faturamento", async () => {
    mockOrders([
      { id: 1, status: "a faturar", total: "0" },
      { id: 2, status: "faturado", total: "0" },
    ])
    const invoice = vi.spyOn(OrderService, "invoiceOrder").mockResolvedValue({})

    renderWithProviders(<OrderList />)
    await screen.findByText("#1")

    expect(screen.getAllByRole("button", { name: "Faturar OS" })).toHaveLength(1)

    fireEvent.click(screen.getByRole("button", { name: "Faturar OS" }))
    fireEvent.change(await screen.findByLabelText(/forma de pagamento/i), {
      target: { value: "pix" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Faturar" }))

    await waitFor(() => expect(invoice).toHaveBeenCalledWith(1, { payment_method: "pix" }))
    invoice.mockRestore()
  })

  it("'Finalizar serviço' só aparece na OS 'em andamento' e dispara", async () => {
    mockOrders([
      { id: 3, status: "em andamento", total: "0" },
      { id: 4, status: "a faturar", total: "0" },
    ])
    const finish = vi
      .spyOn(OrderService, "finishService")
      .mockResolvedValue({ status: "a faturar" })

    renderWithProviders(<OrderList />)
    await screen.findByText("#3")

    expect(screen.getAllByRole("button", { name: "Finalizar serviço" })).toHaveLength(1)

    fireEvent.click(screen.getByRole("button", { name: "Finalizar serviço" }))
    fireEvent.click(await screen.findByRole("button", { name: "Finalizar" }))

    await waitFor(() => expect(finish).toHaveBeenCalledWith(3))
    finish.mockRestore()
  })
})

describe("<OrderList> — filtros", () => {
  it("filtro de placa manda ?plate= na requisição", async () => {
    mockOrders()
    let lastOrdersUrl
    server.use(
      http.get(`${API}/ordens/`, ({ request }) => {
        lastOrdersUrl = new URL(request.url)
        return HttpResponse.json({ results: [], count: 0 })
      }),
    )
    renderWithProviders(<OrderList />)

    fireEvent.click(await screen.findByRole("button", { name: /filtros/i }))
    fireEvent.change(await screen.findByPlaceholderText("Digite o(a) placa"), {
      target: { value: "ABC1D23" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Filtrar" }))

    await waitFor(() => expect(lastOrdersUrl.searchParams.get("plate")).toBe("ABC1D23"))
  })

  describe("<OrderList> — ícones conforme o status", () => {
    it.each([
      ["faturado", "Ver OS"],
      ["cancelado", "Ver OS"],
      ["em andamento", "Editar OS"],
      ["a faturar", "Editar OS"],
    ])("OS %s mostra '%s'", async (status, label) => {
      mockOrders([{ id: 10, first_name: "Ana", vehicle_name: "Gol", status, total: "1.00" }])
      renderWithProviders(<OrderList />)

      expect(await screen.findByRole("link", { name: label })).toHaveAttribute("href", "/ordens/10")
      expect(screen.getByRole("button", { name: "Excluir OS" })).toBeInTheDocument()
    })

    it("botão em massa se chama Gerar Relatórios (OSFIN-P1-04)", async () => {
      mockOrders()
      renderWithProviders(<OrderList />)

      expect(await screen.findByRole("button", { name: /gerar relatórios/i })).toBeInTheDocument()
      expect(screen.queryByRole("button", { name: /exportar pdf/i })).not.toBeInTheDocument()
    })
  })
})

describe("<OrderList> — nota fiscal e pagamento na linha", () => {
  it("mostra o status de NF-e/NFS-e e 'Não gerada' quando não há nota (OSFIN-P2-07)", async () => {
    mockOrders([
      {
        id: 1,
        status: "faturado",
        total: "0",
        fiscal_note_status: "issued",
        service_fiscal_note_status: "failed",
      },
      { id: 2, status: "faturado", total: "0" },
    ])
    renderWithProviders(<OrderList />)

    expect(await screen.findByText("NF-e: Emitida")).toBeInTheDocument()
    expect(screen.getByText("NFS-e: Falhou")).toBeInTheDocument()
    expect(screen.getByText("Não gerada")).toBeInTheDocument()
  })

  it("OS faturada mostra como foi paga (OSFIN-P2-06)", async () => {
    mockOrders([
      {
        id: 1,
        status: "faturado",
        total: "0",
        payment: { payment_method: "cartao", payment_method_display: "Cartão", installments: 3 },
      },
    ])
    renderWithProviders(<OrderList />)

    expect(await screen.findByText("Cartão 3x")).toBeInTheDocument()
  })
})
