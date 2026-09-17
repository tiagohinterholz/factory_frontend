import { describe, it, expect, beforeEach } from "vitest"
import { screen, fireEvent, waitFor, within } from "@testing-library/react"
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
  )
}

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/usuarios/:id" element={<UserDetail />} />
    </Routes>,
    { route: "/usuarios/1" },
  )

describe("<UserDetail> — dados cadastrais", () => {
  beforeEach(() => {
    // admin editando outra pessoa (user_id 9, editando o usuário 1)
    localStorage.setItem(
      "user",
      JSON.stringify({ user_id: 9, email: "admin@a.com", business_id: 3, role: "admin" }),
    )
  })

  it("carrega os dados do usuário no formulário", async () => {
    mockUser()
    renderPage()

    expect(await screen.findByDisplayValue("Maria Souza")).toBeInTheDocument()
    expect(screen.getByDisplayValue("maria@oficina.com")).toBeInTheDocument()
  })

  it("campo de e-mail não convida o autofill a preencher a credencial salva do admin", async () => {
    mockUser()
    renderPage()

    await screen.findByDisplayValue("Maria Souza")
    expect(screen.getByDisplayValue("maria@oficina.com")).toHaveAttribute("autocomplete", "off")
  })

  it("PATCH de dados cadastrais não manda password nenhum (o back rejeita)", async () => {
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
    expect(body).not.toHaveProperty("password")
    expect(body).not.toHaveProperty("confirmPassword")
  })

  it("admin editando outra pessoa não vê o card de Alterar Senha", async () => {
    mockUser()
    renderPage()

    await screen.findByDisplayValue("Maria Souza")
    expect(screen.queryByText("Alterar Senha")).not.toBeInTheDocument()
  })

  it("admin editando outra pessoa vê o botão Excluir Usuário", async () => {
    mockUser()
    renderPage()

    await screen.findByDisplayValue("Maria Souza")
    expect(screen.getByRole("button", { name: /excluir usuário/i })).toBeInTheDocument()
  })

  it("usuário editado com perfil admin aparece selecionado e travado (viewer não é superuser)", async () => {
    server.use(
      http.get(`${API}/usuarios/1/`, () =>
        HttpResponse.json({
          id: 1,
          name: "Carlos Admin",
          email: "carlos@oficina.com",
          role: "admin",
          business: { id: 3, corporate_name: "Oficina do João" },
        }),
      ),
    )
    renderPage()

    await screen.findByDisplayValue("Carlos Admin")
    const roleSelect = screen.getByRole("combobox")
    expect(within(roleSelect).getByRole("option", { name: "Administrador", selected: true }))
    expect(roleSelect).toBeDisabled()
  })

  it("superusuário não vê o formulário — não gerencia usuários por aqui", async () => {
    localStorage.setItem("user", JSON.stringify({ user_id: 9, email: "super@a.com" }))
    mockUser()
    renderPage()

    expect(
      await screen.findByText(/superusuário não gerencia usuários por aqui/i),
    ).toBeInTheDocument()
    expect(screen.queryByDisplayValue("Maria Souza")).not.toBeInTheDocument()
  })
})

describe("<UserDetail> — Alterar Senha (só a própria conta)", () => {
  beforeEach(() => {
    // editando a própria conta: user_id bate com o :id da rota (1)
    localStorage.setItem(
      "user",
      JSON.stringify({
        user_id: 1,
        email: "maria@oficina.com",
        business_id: 3,
        role: "colaborador",
      }),
    )
  })

  it("aparece o card de Alterar Senha quando o usuário edita a si mesmo", async () => {
    mockUser()
    renderPage()

    expect(await screen.findByRole("heading", { name: "Alterar Senha" })).toBeInTheDocument()
  })

  it("não vê o botão Excluir Usuário quando edita a si mesmo", async () => {
    mockUser()
    renderPage()

    await screen.findByDisplayValue("Maria Souza")
    expect(screen.queryByRole("button", { name: /excluir usuário/i })).not.toBeInTheDocument()
  })

  it("envia current_password e new_password pro endpoint dedicado", async () => {
    let body
    mockUser()
    server.use(
      http.post(`${API}/usuarios/change-password/`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ detail: "Senha alterada com sucesso" })
      }),
    )
    renderPage()

    await screen.findByRole("heading", { name: "Alterar Senha" })
    fireEvent.change(screen.getByPlaceholderText("Digite o(a) senha atual"), {
      target: { value: "SenhaAtual1!" },
    })
    fireEvent.change(screen.getByPlaceholderText("Mínimo 8 caracteres"), {
      target: { value: "NovaSenha1!" },
    })
    fireEvent.change(screen.getByPlaceholderText("Repita a senha"), {
      target: { value: "NovaSenha1!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /^alterar senha$/i }))

    await waitFor(() =>
      expect(body).toEqual({ current_password: "SenhaAtual1!", new_password: "NovaSenha1!" }),
    )
  })

  it("mostra a mensagem quando a senha atual está incorreta ({error}, não {detail})", async () => {
    mockUser()
    server.use(
      http.post(`${API}/usuarios/change-password/`, () =>
        HttpResponse.json({ error: "Senha atual incorreta" }, { status: 400 }),
      ),
    )
    renderPage()

    await screen.findByRole("heading", { name: "Alterar Senha" })
    fireEvent.change(screen.getByPlaceholderText("Digite o(a) senha atual"), {
      target: { value: "SenhaErrada1!" },
    })
    fireEvent.change(screen.getByPlaceholderText("Mínimo 8 caracteres"), {
      target: { value: "NovaSenha1!" },
    })
    fireEvent.change(screen.getByPlaceholderText("Repita a senha"), {
      target: { value: "NovaSenha1!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /^alterar senha$/i }))

    expect(await screen.findByText("Senha atual incorreta")).toBeInTheDocument()
  })
})
