import { describe, it, expect } from "vitest"
import { screen, fireEvent } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { Routes, Route } from "react-router-dom"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import Login from "./Login"

function renderLoginReturning(user) {
  server.use(
    http.post(`${API}/usuarios/login/`, () => HttpResponse.json({ access: "token", ...user })),
  )
  renderWithProviders(
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<h1>Página Dashboard</h1>} />
      <Route path="/financeiro" element={<h1>Página Financeiro</h1>} />
    </Routes>,
    { route: "/login" },
  )
  fireEvent.change(screen.getByPlaceholderText(/digite seu email/i), {
    target: { value: "x@a.com" },
  })
  fireEvent.change(screen.getByPlaceholderText(/digite sua senha/i), {
    target: { value: "Senha@123" },
  })
  fireEvent.click(screen.getByRole("button", { name: /entrar/i }))
}

describe("<Login>", () => {
  it("renderiza o formulário sem estourar", () => {
    renderWithProviders(<Login />)
    expect(screen.getByRole("heading", { name: /entrar no sistema/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/digite seu email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/digite sua senha/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument()
  })

  it("contador entra direto no financeiro", async () => {
    renderLoginReturning({
      business_id: 3,
      role: "contador",
      permissions: ["financial.view_financialentry", "orders.view_fiscalnote"],
    })

    expect(await screen.findByRole("heading", { name: "Página Financeiro" })).toBeInTheDocument()
  })

  it("atendente entra no dashboard", async () => {
    renderLoginReturning({
      business_id: 3,
      role: "atendente",
      permissions: ["orders.view_order"],
    })

    expect(await screen.findByRole("heading", { name: "Página Dashboard" })).toBeInTheDocument()
  })
})
