import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
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
  order_id: 10,
}

describe("<AppointmentCard>", () => {
  it("linka direto para a OS do agendamento", () => {
    renderWithProviders(<AppointmentCard item={base} />)
    expect(screen.getByRole("link", { name: /os #10/i })).toHaveAttribute("href", "/ordens/10")
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

  it("fallback quando não há OS vinculada", () => {
    renderWithProviders(<AppointmentCard item={{ ...base, order_id: null }} />)
    expect(screen.getByText(/sem os vinculada/i)).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /os #/i })).not.toBeInTheDocument()
  })
})
