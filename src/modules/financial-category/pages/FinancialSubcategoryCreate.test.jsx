import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import FinancialSubcategoryCreate from "./FinancialSubcategoryCreate"

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateSpy }
})

function mockApi() {
  server.use(
    http.get(`${API}/categorias-financeiro/`, () =>
      HttpResponse.json({ results: [{ id: 9, name: "Marketing" }], count: 1 }),
    ),
  )
}

beforeEach(() => {
  navigateSpy.mockClear()
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

describe("<FinancialSubcategoryCreate>", () => {
  it("renderiza o campo Categoria (LiveSelect) e Nome", async () => {
    mockApi()
    renderWithProviders(<FinancialSubcategoryCreate />)

    expect(await screen.findByRole("combobox")).toBeInTheDocument()
    expect(screen.getByText("Nome da Subcategoria")).toBeInTheDocument()
  })

  it("submete e navega pra listagem", async () => {
    mockApi()
    server.use(
      http.post(`${API}/subcategorias-financeiro/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 50, ...body }, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    renderWithProviders(<FinancialSubcategoryCreate />)

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await user.click(await screen.findByRole("option", { name: "Marketing" }))
    await waitFor(() => expect(input).toHaveValue("Marketing"))
    await user.type(screen.getByPlaceholderText("Ex: Marketing digital"), "Marketing digital")
    await user.click(screen.getByRole("button", { name: "Salvar Subcategoria" }))

    await waitFor(() =>
      expect(navigateSpy).toHaveBeenCalledWith("/subcategorias-financeiro", { replace: true }),
    )
  })

  it("recusa submeter sem categoria escolhida", async () => {
    mockApi()
    let posted = false
    server.use(
      http.post(`${API}/subcategorias-financeiro/`, () => {
        posted = true
        return HttpResponse.json({ id: 50 }, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    renderWithProviders(<FinancialSubcategoryCreate />)

    await user.type(screen.getByPlaceholderText("Ex: Marketing digital"), "Sem categoria")
    await user.click(screen.getByRole("button", { name: "Salvar Subcategoria" }))

    expect(await screen.findByText(/selecione a categoria/i)).toBeInTheDocument()
    expect(posted).toBe(false)
  })
})
