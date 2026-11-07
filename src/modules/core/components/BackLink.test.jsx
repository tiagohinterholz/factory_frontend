import { describe, it, expect } from "vitest"
import { screen, fireEvent } from "@testing-library/react"
import { Routes, Route, Link } from "react-router-dom"
import { renderWithProviders } from "@/test/render"
import BackLink from "./BackLink"

function App() {
  return (
    <Routes>
      <Route
        path="/agendamentos/1"
        element={
          <>
            <h1>Agendamento</h1>
            <Link to="/clientes/5">Abrir cliente</Link>
          </>
        }
      />
      <Route
        path="/clientes/5"
        element={
          <>
            <h1>Cliente</h1>
            <BackLink to="/clientes" />
          </>
        }
      />
      <Route path="/clientes" element={<h1>Lista de clientes</h1>} />
    </Routes>
  )
}

describe("<BackLink>", () => {
  it("volta pra tela de onde a pessoa veio, não pra lista", async () => {
    renderWithProviders(<App />, { route: "/agendamentos/1" })

    fireEvent.click(screen.getByRole("link", { name: "Abrir cliente" }))
    expect(await screen.findByRole("heading", { name: "Cliente" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /voltar/i }))

    expect(await screen.findByRole("heading", { name: "Agendamento" })).toBeInTheDocument()
  })

  it("aberta direto pela URL, cai no destino padrão", async () => {
    renderWithProviders(<App />, { route: "/clientes/5" })

    fireEvent.click(screen.getByRole("button", { name: /voltar/i }))

    expect(await screen.findByRole("heading", { name: "Lista de clientes" })).toBeInTheDocument()
  })
})
