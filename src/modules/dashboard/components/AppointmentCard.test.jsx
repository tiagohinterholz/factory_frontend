import { describe, it, expect, vi, afterEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { Routes, Route, useLocation } from "react-router-dom"
import { renderWithProviders } from "@/test/render"
import AppointmentCard from "./AppointmentCard"
import { OrderService } from "@/modules/order/services/order"

const base = {
  id: 1,
  client_id: 5,
  client_name: "João Silva",
  contact: "(51) 99999-9999",
  vehicle_id: 3,
  vehicle: "ABC1234 - Onix",
  date: "2026-09-07",
  time: "14:00:00",
  order: null,
  budget: null,
}

describe("<AppointmentCard>", () => {
  afterEach(() => vi.useRealTimers())

  it("badge: sem OS e data futura → Aguardando Execução", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-07T10:00:00"))
    renderWithProviders(
      <AppointmentCard item={{ ...base, date: "2026-09-07", time: "14:00:00" }} />,
    )
    expect(screen.getByText("Aguardando Execução")).toBeInTheDocument()
  })

  it("badge: data no passado → Em Andamento", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-08T10:00:00"))
    renderWithProviders(<AppointmentCard item={base} />)
    expect(screen.getByText("Em Andamento")).toBeInTheDocument()
  })

  it("badge: OS fora de 'em andamento' → mostra o status da OS", () => {
    renderWithProviders(
      <AppointmentCard item={{ ...base, order: { id: 10, status: "faturado" } }} />,
    )
    expect(screen.getByText("faturado")).toBeInTheDocument()
  })

  it("'Finalizar' aparece com OS em andamento e dispara finishService", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-08T10:00:00"))
    const finish = vi
      .spyOn(OrderService, "finishService")
      .mockResolvedValue({ status: "a faturar" })

    renderWithProviders(<AppointmentCard item={{ ...base, order: 10 }} />)
    vi.useRealTimers()

    fireEvent.click(screen.getByRole("button", { name: "Finalizar" }))
    // diálogo de confirmação também tem um botão "Finalizar" — pega o último
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: "Finalizar" }).length).toBeGreaterThan(1),
    )
    const buttons = screen.getAllByRole("button", { name: "Finalizar" })
    fireEvent.click(buttons[buttons.length - 1])

    await waitFor(() => expect(finish).toHaveBeenCalledWith(10))
    finish.mockRestore()
  })

  it("'Finalizar' não aparece sem OS vinculada", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-08T10:00:00"))
    renderWithProviders(<AppointmentCard item={base} />)
    expect(screen.queryByRole("button", { name: "Finalizar" })).not.toBeInTheDocument()
  })

  it("mostra cliente, veículo e contato clicável", () => {
    renderWithProviders(<AppointmentCard item={base} />)
    expect(screen.getByText("João Silva")).toBeInTheDocument()
    expect(screen.getByText("ABC1234 - Onix")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "(51) 99999-9999" })).toHaveAttribute(
      "href",
      "tel:51999999999",
    )
  })

  it("omite contato quando o cliente não tem telefone", () => {
    renderWithProviders(<AppointmentCard item={{ ...base, contact: null }} />)
    expect(screen.queryByRole("link", { name: /^\(/ })).not.toBeInTheDocument()
  })

  it("linka para a OS quando o agendamento tem ordem vinculada", () => {
    renderWithProviders(<AppointmentCard item={{ ...base, order: 10 }} />)
    expect(screen.getByRole("link", { name: /os #10/i })).toHaveAttribute("href", "/ordens/10")
    expect(screen.queryByRole("link", { name: /criar os/i })).not.toBeInTheDocument()
  })

  it("aceita order/budget como objeto aninhado", () => {
    renderWithProviders(<AppointmentCard item={{ ...base, order: { id: 7 }, budget: { id: 9 } }} />)
    expect(screen.getByRole("link", { name: /os #7/i })).toHaveAttribute("href", "/ordens/7")
    expect(screen.getByRole("link", { name: /orçamento #9/i })).toHaveAttribute(
      "href",
      "/orcamentos/9",
    )
  })

  it("linka para o orçamento quando há budget vinculado", () => {
    renderWithProviders(<AppointmentCard item={{ ...base, budget: 42 }} />)
    expect(screen.getByRole("link", { name: /orçamento #42/i })).toHaveAttribute(
      "href",
      "/orcamentos/42",
    )
    expect(screen.queryByRole("link", { name: /criar orçamento/i })).not.toBeInTheDocument()
  })

  it("oferece 'Criar OS' e 'Criar Orçamento' quando não há vínculo", () => {
    renderWithProviders(<AppointmentCard item={base} />)
    expect(screen.getByRole("link", { name: /criar os/i })).toHaveAttribute("href", "/ordens/novo")
    expect(screen.getByRole("link", { name: /criar orçamento/i })).toHaveAttribute(
      "href",
      "/orcamentos/novo",
    )
  })

  it("com OS vinculada não oferece 'Criar Orçamento'", () => {
    renderWithProviders(<AppointmentCard item={{ ...base, order: 10 }} />)
    expect(screen.getByRole("link", { name: /os #10/i })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /criar orçamento/i })).not.toBeInTheDocument()
  })

  it("com orçamento vinculado ainda oferece 'Criar OS'", () => {
    renderWithProviders(<AppointmentCard item={{ ...base, budget: 42 }} />)
    expect(screen.getByRole("link", { name: /orçamento #42/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /criar os/i })).toHaveAttribute("href", "/ordens/novo")
  })

  it("OS + orçamento vinculados: mostra os dois links, nenhum atalho de criação", () => {
    renderWithProviders(<AppointmentCard item={{ ...base, order: 10, budget: 42 }} />)
    expect(screen.getByRole("link", { name: /os #10/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /orçamento #42/i })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /criar/i })).not.toBeInTheDocument()
  })

  it("leva cliente e veículo pré-preenchidos ao criar OS/orçamento", () => {
    function Probe() {
      const location = useLocation()
      return <pre data-testid="state">{JSON.stringify(location.state)}</pre>
    }

    renderWithProviders(
      <Routes>
        <Route path="/" element={<AppointmentCard item={base} />} />
        <Route path="/ordens/novo" element={<Probe />} />
      </Routes>,
    )

    fireEvent.click(screen.getByRole("link", { name: /criar os/i }))
    expect(screen.getByTestId("state")).toHaveTextContent(
      '{"clientId":5,"vehicleId":3,"appointmentId":1}',
    )
  })

  it("clicar no card abre a edição do agendamento", () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<AppointmentCard item={base} />} />
        <Route path="/agendamentos/:id" element={<p>edição do agendamento</p>} />
      </Routes>,
    )

    fireEvent.click(screen.getByRole("button", { name: /editar agendamento de joão silva/i }))
    expect(screen.getByText("edição do agendamento")).toBeInTheDocument()
  })

  it("clicar num link interno não dispara a navegação do card", () => {
    function Probe() {
      const location = useLocation()
      return <pre data-testid="path">{location.pathname}</pre>
    }

    renderWithProviders(
      <Routes>
        <Route path="/" element={<AppointmentCard item={{ ...base, order: 10 }} />} />
        <Route path="/ordens/:id" element={<Probe />} />
        <Route path="/agendamentos/:id" element={<p>NÃO deveria abrir</p>} />
      </Routes>,
    )

    fireEvent.click(screen.getByRole("link", { name: /os #10/i }))
    expect(screen.getByTestId("path")).toHaveTextContent("/ordens/10")
  })
})
