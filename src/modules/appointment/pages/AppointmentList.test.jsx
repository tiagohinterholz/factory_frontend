import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
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
  vehicle: { id: 9, model: "Gol", plate: "ABC1D23" },
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

describe("<AppointmentList>", () => {
  it("mostra cliente, horário certo (sem segundos), placa, telefone e a OS — sem status nem Finalizar", async () => {
    mockAppointments()
    renderWithProviders(<AppointmentList />)

    expect(await screen.findByText("Ana")).toBeInTheDocument()
    // "<dia da semana abreviado>, 09:00" — sem os segundos que a API manda
    expect(screen.getByText(/,\s09:00$/)).toBeInTheDocument()
    expect(screen.getByText("ABC1D23")).toBeInTheDocument()
    expect(screen.getByText("(41) 99999-0000")).toBeInTheDocument()
    expect(screen.getByText("OS #77")).toBeInTheDocument()

    expect(screen.queryByText(/em andamento/i)).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /finalizar/i })).not.toBeInTheDocument()

    expect(screen.getByRole("link", { name: /ana/i })).toHaveAttribute("href", "/agendamentos/42")
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

    expect(await screen.findByText("Ana")).toBeInTheDocument()
    expect(screen.getByText("Beto")).toBeInTheDocument()
    // empilhados no fluxo normal, não sobrepostos via position: absolute
    expect(screen.getByRole("link", { name: /ana/i }).className).not.toMatch(/\babsolute\b/)
    expect(screen.getByRole("link", { name: /beto/i }).className).not.toMatch(/\babsolute\b/)
  })
})
