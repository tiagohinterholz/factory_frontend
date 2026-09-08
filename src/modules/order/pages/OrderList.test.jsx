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
      HttpResponse.json({ results: [{ id: 5, first_name: "Ana", last_name: "Lima" }], count: 1 }),
    ),
  )
}

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
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
    fireEvent.click(await screen.findByRole("button", { name: "Faturar" }))

    await waitFor(() => expect(invoice).toHaveBeenCalledWith(1))
    invoice.mockRestore()
  })
})
