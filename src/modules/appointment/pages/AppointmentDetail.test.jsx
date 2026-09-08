import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { Routes, Route } from "react-router-dom"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import AppointmentDetail from "./AppointmentDetail"
import { OrderService } from "@/modules/order/services/order"

// Furo: OS criada agora (ex.: aprovar orçamento com data) ainda não está na
// lista de opções em cache (staleTime 5min). O select de OS tem que mostrar
// mesmo assim a OS já vinculada ao agendamento.
const appointment = {
  id: 1,
  business: 2,
  client: 5,
  vehicle: 9,
  order: { id: 77, plate: "ABC1D23", status: "em andamento" },
  date: "2026-09-10",
  time: "14:00",
  observation: "",
}

function mockApi({ orders = [], appointmentOverrides = {} } = {}) {
  server.use(
    http.get(`${API}/agendamentos/1/`, () =>
      HttpResponse.json({ ...appointment, ...appointmentOverrides }),
    ),
    http.get(`${API}/empreendimentos/`, () =>
      HttpResponse.json({ results: [{ id: 2, corporate_name: "Oficina Teste" }], count: 1 }),
    ),
    http.get(`${API}/clientes/`, () =>
      HttpResponse.json({
        results: [{ id: 5, first_name: "Ana", last_name: "Lima", business: 2 }],
        count: 1,
      }),
    ),
    http.get(`${API}/veiculos/`, () =>
      HttpResponse.json({
        results: [{ id: 9, client: 5, manufacturer: "VW", model: "Gol", plate: "ABC1D23" }],
        count: 1,
      }),
    ),
    http.get(`${API}/ordens/`, () => HttpResponse.json({ results: orders, count: orders.length })),
  )
}

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/agendamentos/:id" element={<AppointmentDetail />} />
    </Routes>,
    { route: "/agendamentos/1" },
  )

describe("<AppointmentDetail>", () => {
  it("mostra a OS vinculada no select mesmo que a lista de opções não a tenha", async () => {
    mockApi({ orders: [] })
    renderPage()

    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: /OS 77 - ABC1D23/, selected: true }),
      ).toBeInTheDocument(),
    )
  })

  it("não duplica a OS vinculada quando ela já está na lista de opções", async () => {
    mockApi({ orders: [{ id: 77, vehicle: 9, plate: "ABC1D23" }] })
    renderPage()

    await waitFor(() => expect(screen.getAllByRole("option", { name: /OS 77/ })).toHaveLength(1))
  })

  it("OS 'em andamento': mostra 'Finalizar atendimento' e chama finishService", async () => {
    mockApi()
    const finish = vi
      .spyOn(OrderService, "finishService")
      .mockResolvedValue({ status: "a faturar" })
    renderPage()

    fireEvent.click(await screen.findByRole("button", { name: /finalizar atendimento/i }))
    fireEvent.click(await screen.findByRole("button", { name: "Finalizar" }))

    await waitFor(() => expect(finish).toHaveBeenCalledWith("77"))
    finish.mockRestore()
  })

  it("OS fora de 'em andamento': sem botão de finalizar", async () => {
    mockApi({ appointmentOverrides: { order: { id: 77, status: "a faturar" } } })
    renderPage()

    await screen.findByText("Editar Agendamento")
    expect(screen.queryByRole("button", { name: /finalizar atendimento/i })).not.toBeInTheDocument()
  })
})
