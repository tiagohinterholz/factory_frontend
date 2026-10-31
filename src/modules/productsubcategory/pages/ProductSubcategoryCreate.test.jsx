import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ProductSubcategoryCreate from "./ProductSubcategoryCreate"

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateSpy, useLocation: () => ({ state: null }) }
})

function mockApi() {
  server.use(
    http.get(`${API}/categorias-produto/`, () =>
      HttpResponse.json({ results: [{ id: 1, name: "Pneus" }], count: 1 }),
    ),
  )
}

beforeEach(() => {
  navigateSpy.mockClear()
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

describe("<ProductSubcategoryCreate>", () => {
  it("usa ProductCategoryLiveSelect (combobox) no campo Categoria", async () => {
    mockApi()
    renderWithProviders(<ProductSubcategoryCreate />)

    await screen.findByText("Categoria")
    expect(await screen.findByRole("combobox")).toBeInTheDocument()
  })

  it("cadastra uma nova categoria direto pelo modal, sem navegar pra fora da página", async () => {
    const categories = [{ id: 1, name: "Pneus" }]
    server.use(
      http.get(`${API}/categorias-produto/`, () =>
        HttpResponse.json({ results: categories, count: categories.length }),
      ),
      http.post(`${API}/categorias-produto/`, async ({ request }) => {
        const body = await request.json()
        const created = { id: 9, name: "Baterias", ...body }
        categories.push(created)
        return HttpResponse.json(created, { status: 201 })
      }),
    )
    renderWithProviders(<ProductSubcategoryCreate />)
    const user = userEvent.setup()

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await user.click(await screen.findByRole("option", { name: "Cadastrar nova categoria" }))

    const dialog = await screen.findByRole("dialog")
    await user.type(screen.getByPlaceholderText("Ex: Pneus"), "Baterias")
    await user.click(screen.getByRole("button", { name: "Salvar Categoria" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(dialog).not.toBeInTheDocument()
    await waitFor(() => expect(input).toHaveValue("Baterias"))
    expect(navigateSpy).not.toHaveBeenCalled()
  })
})
