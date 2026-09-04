import { describe, it, expect, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { Routes, Route } from "react-router-dom"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import UserDetail from "./UserDetail"

function mockUser() {
  server.use(
    http.get(`${API}/usuarios/1/`, () =>
      HttpResponse.json({
        id: 1,
        name: "Maria Souza",
        email: "maria@oficina.com",
        role: "colaborador",
        business: { id: 3, corporate_name: "Oficina do João" },
      }),
    ),
    http.get(`${API}/empreendimentos/`, () =>
      HttpResponse.json({ results: [{ id: 3, corporate_name: "Oficina do João" }], count: 1 }),
    ),
  )
}

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/usuarios/:id" element={<UserDetail />} />
    </Routes>,
    { route: "/usuarios/1" },
  )

describe("<UserDetail>", () => {
  beforeEach(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({ email: "admin@a.com", business_id: 3, role: "admin" }),
    )
  })

  it("carrega os dados do usuário no formulário", async () => {
    mockUser()
    renderPage()

    expect(await screen.findByDisplayValue("Maria Souza")).toBeInTheDocument()
    expect(screen.getByDisplayValue("maria@oficina.com")).toBeInTheDocument()
  })

  it("campo de e-mail e senha não convidam o autofill a preencher a credencial salva do admin", async () => {
    mockUser()
    renderPage()

    await screen.findByDisplayValue("Maria Souza")
    expect(screen.getByDisplayValue("maria@oficina.com")).toHaveAttribute("autocomplete", "off")
    expect(screen.getByPlaceholderText("Mínimo 8 caracteres")).toHaveAttribute(
      "autocomplete",
      "new-password",
    )
  })

  it("salva sem enviar senha quando os campos de senha ficam em branco", async () => {
    let body
    mockUser()
    server.use(
      http.patch(`${API}/usuarios/1/`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ id: 1 })
      }),
    )
    renderPage()

    await screen.findByDisplayValue("Maria Souza")
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }))

    await waitFor(() => expect(body).not.toBeUndefined())
    expect(body.password).toBeUndefined()
    expect(body.confirmPassword).toBeUndefined()
  })

  it("digitar uma senha nova exige que ela atenda a política, e manda no PATCH", async () => {
    let body
    mockUser()
    server.use(
      http.patch(`${API}/usuarios/1/`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ id: 1 })
      }),
    )
    renderPage()

    await screen.findByDisplayValue("Maria Souza")
    fireEvent.change(screen.getByPlaceholderText("Mínimo 8 caracteres"), {
      target: { value: "NovaSenha1!" },
    })
    fireEvent.change(screen.getByPlaceholderText("Repita a senha"), {
      target: { value: "NovaSenha1!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }))

    await waitFor(() => expect(body?.password).toBe("NovaSenha1!"))
    expect(body.confirmPassword).toBeUndefined()
  })
})
