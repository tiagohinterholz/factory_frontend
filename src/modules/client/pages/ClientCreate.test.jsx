import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ClientCreate from "./ClientCreate"

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateSpy }
})

function mockApi() {
  server.use(
    http.get(`${API}/estados/`, () =>
      HttpResponse.json({ results: [{ id: 1, name: "Paraná", abbreviation: "PR" }], count: 1 }),
    ),
    http.get(`${API}/estados/1/cidades/`, () =>
      HttpResponse.json({ results: [{ id: 1, name: "Curitiba" }], count: 1 }),
    ),
  )
}

beforeEach(() => {
  navigateSpy.mockClear()
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

async function fillMinimumValidPf(user) {
  await user.type(await screen.findByPlaceholderText("Ex: João"), "Ana")
  await user.type(screen.getByPlaceholderText("Ex: Silva"), "Silva")
  await user.type(screen.getByPlaceholderText("000.000.000-00"), "12345678901")
  const [stateSelect] = screen.getAllByRole("combobox")
  await user.selectOptions(stateSelect, "1")
  await screen.findByText("Curitiba")
  const [, citySelect] = screen.getAllByRole("combobox")
  await user.selectOptions(citySelect, "1")
  await user.type(screen.getByPlaceholderText("(00) 00000-0000"), "41912345678")
}

describe("<ClientCreate>", () => {
  it("marca os campos obrigatórios com *", async () => {
    mockApi()
    renderWithProviders(<ClientCreate />)

    expect(await screen.findByText("Nome *")).toBeInTheDocument()
    expect(screen.getByText("Sobrenome *")).toBeInTheDocument()
    expect(screen.getByText("CPF *")).toBeInTheDocument()
    expect(screen.getByText("Telefone *")).toBeInTheDocument()
    expect(screen.getByText("Estado *")).toBeInTheDocument()
    expect(screen.getByText("Cidade *")).toBeInTheDocument()
    expect(screen.getByText("Endereço")).toBeInTheDocument()
    expect(screen.getByText("Bairro")).toBeInTheDocument()
  })

  it("capitaliza a primeira letra de Nome/Sobrenome ao digitar", async () => {
    mockApi()
    renderWithProviders(<ClientCreate />)

    const firstName = await screen.findByPlaceholderText("Ex: João")
    fireEvent.change(firstName, { target: { value: "ana" } })
    expect(firstName.value).toBe("Ana")

    const lastName = screen.getByPlaceholderText("Ex: Silva")
    fireEvent.change(lastName, { target: { value: "silva" } })
    expect(lastName.value).toBe("Silva")
  })

  it("capitaliza a primeira letra de Endereço/Bairro ao digitar", async () => {
    mockApi()
    renderWithProviders(<ClientCreate />)

    const address = await screen.findByPlaceholderText("Rua, Avenida, etc.")
    fireEvent.change(address, { target: { value: "rua das flores" } })
    expect(address.value).toBe("Rua das flores")

    const neighborhood = screen.getByPlaceholderText(/digite o\(a\) bairro/i)
    fireEvent.change(neighborhood, { target: { value: "centro" } })
    expect(neighborhood.value).toBe("Centro")
  })

  it("ao criar com sucesso, redireciona pra edição do cliente recém-criado (não pra /clientes)", async () => {
    mockApi()
    server.use(http.post(`${API}/clientes/`, () => HttpResponse.json({ id: 42 }, { status: 201 })))
    renderWithProviders(<ClientCreate />)

    const user = userEvent.setup()
    await fillMinimumValidPf(user)
    fireEvent.click(screen.getByRole("button", { name: /salvar cliente/i }))

    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith("/clientes/42"))
  })
})
