import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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
    http.get(`${API}/clientes/`, () =>
      HttpResponse.json({
        results: [
          { id: 5, first_name: "Ana", last_name: "Lima", display_name: "Ana Lima", business: 2 },
        ],
        count: 1,
      }),
    ),
    http.get(`${API}/veiculos/`, () =>
      HttpResponse.json({
        results: [
          {
            id: 9,
            client: 5,
            manufacturer: { id: 12, name: "VW" },
            model: { id: 55, name: "Gol" },
            plate: "ABC1D23",
          },
        ],
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

  it("cliente/veículo vinculados mas desativados (fora da lista de opções) continuam visíveis e no submit", async () => {
    mockApi({
      orders: [],
      appointmentOverrides: {
        client: { id: 5, first_name: "Ana", last_name: "Lima", display_name: "Ana Lima" },
        vehicle: { id: 9, manufacturer: "WV", model: "Gol" },
      },
    })
    server.use(
      http.get(`${API}/clientes/`, () => HttpResponse.json({ results: [], count: 0 })),
      http.get(`${API}/veiculos/`, () => HttpResponse.json({ results: [], count: 0 })),
    )
    const { AppointmentService } = await import("@/modules/appointment/services/appointment")
    const update = vi.spyOn(AppointmentService, "updateAppointment").mockResolvedValue({})
    renderPage()

    await screen.findByText("Editar Agendamento")
    const [clientInput, vehicleInput] = screen.getAllByRole("combobox")
    await waitFor(() => expect(clientInput).toHaveValue("Ana Lima"))
    await waitFor(() => expect(vehicleInput).toHaveValue("WV Gol"))

    fireEvent.click(screen.getByRole("button", { name: "Salvar Alterações" }))

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({ client_id: "5", vehicle_id: "9" }),
      ),
    )
    update.mockRestore()
  })

  it("trocar o cliente proprietário limpa o veículo e a OS já escolhidos", async () => {
    mockApi({ orders: [{ id: 77, vehicle: 9, plate: "ABC1D23" }] })
    server.use(
      http.get(`${API}/clientes/`, () =>
        HttpResponse.json({
          results: [
            { id: 5, display_name: "Ana Lima", business: 2 },
            { id: 6, display_name: "Bruno Souza", business: 2 },
          ],
          count: 2,
        }),
      ),
    )
    const user = userEvent.setup()
    renderPage()

    await screen.findByText("Editar Agendamento")
    const [clientInput, vehicleInput] = screen.getAllByRole("combobox")
    await waitFor(() => expect(vehicleInput.value).not.toBe(""))

    await user.click(clientInput)
    await user.click(await screen.findByRole("option", { name: "Bruno Souza" }))

    expect(vehicleInput).toHaveValue("")
  })

  it("reselecionar o MESMO cliente não limpa o veículo/OS já escolhidos", async () => {
    mockApi({ orders: [{ id: 77, vehicle: 9, plate: "ABC1D23" }] })
    server.use(
      http.get(`${API}/clientes/`, () =>
        HttpResponse.json({
          results: [
            { id: 5, display_name: "Ana Lima", business: 2 },
            { id: 6, display_name: "Bruno Souza", business: 2 },
          ],
          count: 2,
        }),
      ),
    )
    const user = userEvent.setup()
    renderPage()

    await screen.findByText("Editar Agendamento")
    const [clientInput, vehicleInput] = screen.getAllByRole("combobox")
    await waitFor(() => expect(vehicleInput.value).not.toBe(""))
    const vehicleValueBefore = vehicleInput.value

    await user.click(clientInput)
    await user.click(await screen.findByRole("option", { name: "Ana Lima" }))

    expect(vehicleInput).toHaveValue(vehicleValueBefore)
  })

  it("trocar o cliente proprietário realmente limpa o vehicle_id do form, não só o texto exibido", async () => {
    mockApi({ orders: [{ id: 77, vehicle: 9, plate: "ABC1D23" }] })
    server.use(
      http.get(`${API}/clientes/`, () =>
        HttpResponse.json({
          results: [
            { id: 5, display_name: "Ana Lima", business: 2 },
            { id: 6, display_name: "Bruno Souza", business: 2 },
          ],
          count: 2,
        }),
      ),
    )
    const { AppointmentService } = await import("@/modules/appointment/services/appointment")
    const update = vi.spyOn(AppointmentService, "updateAppointment")
    const user = userEvent.setup()
    renderPage()

    await screen.findByText("Editar Agendamento")
    const [clientInput] = screen.getAllByRole("combobox")
    await waitFor(() => expect(screen.getAllByRole("combobox")[1].value).not.toBe(""))

    await user.click(clientInput)
    await user.click(await screen.findByRole("option", { name: "Bruno Souza" }))

    fireEvent.click(screen.getByRole("button", { name: "Salvar Alterações" }))

    expect(await screen.findByText("Selecione o veículo")).toBeInTheDocument()
    expect(update).not.toHaveBeenCalled()
    update.mockRestore()
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

  it("cards de vínculo linkam pra cliente, veículo, OS e orçamento", async () => {
    mockApi({
      appointmentOverrides: {
        client: {
          id: 5,
          first_name: "Ana",
          last_name: "Lima",
          display_name: "Ana Lima",
          phone: "(41) 91234-5678",
        },
        vehicle: { id: 9, manufacturer: "VW", model: "Gol", plate: "ABC1D23" },
        order: { id: 77, status: "em andamento" },
        budget: { id: 33, status: "aprovado" },
      },
    })
    renderPage()

    await screen.findByText("Editar Agendamento")

    expect(screen.getByRole("link", { name: /ana lima/i })).toHaveAttribute("href", "/clientes/5")
    expect(screen.getByText("(41) 91234-5678")).toBeInTheDocument()

    expect(screen.getByRole("link", { name: /vw gol/i })).toHaveAttribute("href", "/veiculos/9")
    expect(screen.getByText("ABC1D23")).toBeInTheDocument()

    expect(screen.getByRole("link", { name: /os #77/i })).toHaveAttribute("href", "/ordens/77")
    expect(screen.getByRole("link", { name: /orçamento #33/i })).toHaveAttribute(
      "href",
      "/orcamentos/33",
    )

    expect(screen.getByRole("link", { name: /whatsapp/i })).toHaveAttribute(
      "href",
      "https://wa.me/5541912345678",
    )
  })

  it("cliente sem telefone: sem botão de WhatsApp", async () => {
    mockApi({
      appointmentOverrides: {
        client: {
          id: 5,
          first_name: "Ana",
          last_name: "Lima",
          display_name: "Ana Lima",
          phone: null,
        },
      },
    })
    renderPage()

    await screen.findByText("Editar Agendamento")
    expect(screen.queryByRole("link", { name: /whatsapp/i })).not.toBeInTheDocument()
  })

  it("sem OS nem orçamento vinculados, os cards mostram o estado vazio (sem link)", async () => {
    mockApi({ appointmentOverrides: { order: null, budget: null } })
    renderPage()

    await screen.findByText("Editar Agendamento")

    expect(screen.getByText("Sem OS vinculada")).toBeInTheDocument()
    expect(screen.getByText("Sem orçamento vinculado")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /os #/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /orçamento #/i })).not.toBeInTheDocument()
  })
})
