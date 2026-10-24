import { describe, it, expect } from "vitest"
import { screen, fireEvent, within } from "@testing-library/react"
import { Routes, Route, useLocation } from "react-router-dom"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import AppointmentList from "./AppointmentList"

// "hoje" real (não congela o relógio: o calendário usa react-query + MSW, e
// fake timers travam o polling assíncrono do findBy). O calendário sempre
// mostra a semana atual, então basta usar a data de hoje pra cair na coluna
// certa; a hora fixa (9h) garante a linha certa (faixa exibida é 7h-20h).
// data local (não toISOString, que é UTC e pode cair no dia errado conforme o fuso)
function todayLocalIso() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}
const todayIso = todayLocalIso()

const appointment = {
  id: 42,
  business: { id: 2 },
  client: { id: 5, first_name: "Ana", last_name: "Lima", phone: "(41) 99999-0000" },
  vehicle: { id: 9, manufacturer: "VW", model: "Gol", plate: "ABC1D23" },
  order: { id: 77, status: "em andamento" },
  date: todayIso,
  time: "09:00:00",
  observation: "",
}

function mockAppointments(results) {
  server.use(
    http.get(`${API}/agendamentos/`, () =>
      HttpResponse.json({ results: results ?? [appointment], count: (results ?? [1]).length }),
    ),
  )
}

function StateProbe({ title }) {
  const location = useLocation()
  return (
    <div>
      <h1>{title}</h1>
      <pre data-testid="state">{JSON.stringify(location.state)}</pre>
    </div>
  )
}

describe("<AppointmentList>", () => {
  it("mostra nome completo do cliente, horário certo (sem segundos), veículo, telefone e a OS — sem status nem Finalizar", async () => {
    mockAppointments()
    renderWithProviders(<AppointmentList />)

    expect(await screen.findByText("Ana Lima")).toBeInTheDocument()
    // "<dia da semana abreviado>, 09:00" — sem os segundos que a API manda
    expect(screen.getByText(/,\s09:00$/)).toBeInTheDocument()
    expect(screen.getByText("VW Gol · ABC1D23")).toBeInTheDocument()
    expect(screen.getByText("(41) 99999-0000")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "OS #77" })).toHaveAttribute("href", "/ordens/77")
    expect(screen.queryByRole("link", { name: /criar os/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /criar orçamento/i })).not.toBeInTheDocument()

    expect(screen.queryByText(/em andamento/i)).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /finalizar/i })).not.toBeInTheDocument()
  })

  it("clicar no card abre o agendamento", async () => {
    mockAppointments()
    renderWithProviders(
      <Routes>
        <Route path="/agendamentos" element={<AppointmentList />} />
        <Route path="/agendamentos/:id" element={<StateProbe title="Detalhe" />} />
      </Routes>,
      { route: "/agendamentos" },
    )

    fireEvent.click(await screen.findByRole("link", { name: /abrir agendamento de ana lima/i }))

    expect(await screen.findByRole("heading", { name: "Detalhe" })).toBeInTheDocument()
  })

  it("sem OS nem orçamento: card mostra Criar OS e Criar Orçamento com cliente/veículo pré-preenchidos (RAD-P2-01/02)", async () => {
    mockAppointments([{ ...appointment, order: null, budget: null }])
    renderWithProviders(
      <Routes>
        <Route path="/agendamentos" element={<AppointmentList />} />
        <Route path="/agendamentos/:id" element={<StateProbe title="Detalhe" />} />
        <Route path="/ordens/novo" element={<StateProbe title="Nova OS" />} />
      </Routes>,
      { route: "/agendamentos" },
    )

    const card = (
      await screen.findByRole("link", { name: /abrir agendamento de ana lima/i })
    ).closest("[data-appointment-card]")
    expect(within(card).getByRole("link", { name: /criar orçamento/i })).toHaveAttribute(
      "href",
      "/orcamentos/novo",
    )
    fireEvent.click(within(card).getByRole("link", { name: /criar os/i }))

    expect(await screen.findByRole("heading", { name: "Nova OS" })).toBeInTheDocument()
    expect(JSON.parse(screen.getByTestId("state").textContent)).toEqual({
      clientId: 5,
      vehicleId: 9,
      appointmentId: 42,
    })
  })

  it("só com orçamento vinculado: card linka o orçamento e mostra só Criar OS", async () => {
    mockAppointments([{ ...appointment, order: null, budget: { id: 31 } }])
    renderWithProviders(<AppointmentList />)

    expect(await screen.findByRole("link", { name: "Orçamento #31" })).toHaveAttribute(
      "href",
      "/orcamentos/31",
    )
    expect(screen.getByRole("link", { name: /criar os/i })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /criar orçamento/i })).not.toBeInTheDocument()
  })

  it("sem agendamentos: mostra o estado vazio", async () => {
    mockAppointments([])
    renderWithProviders(<AppointmentList />)

    expect(await screen.findByText("Nenhum agendamento encontrado.")).toBeInTheDocument()
  })

  it("duas marcações no mesmo dia e hora aparecem as duas, não uma sobre a outra", async () => {
    mockAppointments([
      appointment,
      {
        ...appointment,
        id: 43,
        client: { id: 6, first_name: "Beto", last_name: "Souza", phone: "(41) 98888-0000" },
        vehicle: { id: 10, model: "Onix", plate: "XYZ9K88" },
        order: null,
      },
    ])
    renderWithProviders(<AppointmentList />)

    expect(await screen.findByText("Ana Lima")).toBeInTheDocument()
    expect(screen.getByText("Beto Souza")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /abrir agendamento de ana/i }).className).not.toMatch(
      /\babsolute\b/,
    )
    expect(screen.getByRole("link", { name: /abrir agendamento de beto/i }).className).not.toMatch(
      /\babsolute\b/,
    )
  })

  it("Criar Orçamento do card leva cliente, veículo e agendamento no state", async () => {
    mockAppointments([{ ...appointment, order: null, budget: null }])
    renderWithProviders(
      <Routes>
        <Route path="/agendamentos" element={<AppointmentList />} />
        <Route path="/orcamentos/novo" element={<StateProbe title="Novo Orçamento" />} />
      </Routes>,
      { route: "/agendamentos" },
    )

    fireEvent.click(await screen.findByRole("link", { name: /criar orçamento/i }))

    expect(await screen.findByRole("heading", { name: "Novo Orçamento" })).toBeInTheDocument()
    expect(JSON.parse(screen.getByTestId("state").textContent)).toEqual({
      clientId: 5,
      vehicleId: 9,
      appointmentId: 42,
    })
  })

  it("com OS e orçamento vinculados mostra os dois links e nenhum botão de criar", async () => {
    mockAppointments([{ ...appointment, budget: { id: 31 } }])
    renderWithProviders(<AppointmentList />)

    expect(await screen.findByRole("link", { name: "OS #77" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Orçamento #31" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /criar os/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /criar orçamento/i })).not.toBeInTheDocument()
  })

  it.each([
    ["cliente", { client: null }, /abrir agendamento de cliente/i],
    ["veículo", { vehicle: null }, /abrir agendamento de ana lima/i],
  ])("sem %s não oferece criar OS/orçamento", async (_, overrides, openName) => {
    mockAppointments([{ ...appointment, ...overrides, order: null, budget: null }])
    renderWithProviders(<AppointmentList />)

    expect(await screen.findByRole("link", { name: openName })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /criar os/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /criar orçamento/i })).not.toBeInTheDocument()
  })

  it("o card não aninha links dentro de outro link", async () => {
    mockAppointments([{ ...appointment, order: null, budget: { id: 31 } }])
    renderWithProviders(<AppointmentList />)

    const open = await screen.findByRole("link", { name: /abrir agendamento de ana lima/i })
    expect(open.querySelector("a")).toBeNull()
  })
})
