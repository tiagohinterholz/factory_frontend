import { describe, it, expect } from "vitest"
import { screen, fireEvent } from "@testing-library/react"
import { Routes, Route, useLocation } from "react-router-dom"
import { renderWithProviders } from "@/test/render"
import AppointmentCard from "./AppointmentCard"

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

  it("mistura vínculo existente com atalho de criação", () => {
    renderWithProviders(<AppointmentCard item={{ ...base, order: 10 }} />)
    expect(screen.getByRole("link", { name: /os #10/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /criar orçamento/i })).toBeInTheDocument()
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
    expect(screen.getByTestId("state")).toHaveTextContent('{"clientId":5,"vehicleId":3}')
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
