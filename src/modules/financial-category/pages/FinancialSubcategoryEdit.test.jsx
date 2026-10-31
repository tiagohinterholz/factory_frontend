import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import FinancialSubcategoryEdit from "./FinancialSubcategoryEdit"

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useParams: () => ({ id: "5" }), useNavigate: () => navigateSpy }
})

function mockApi() {
  server.use(
    http.get(`${API}/subcategorias-financeiro/5/`, () =>
      HttpResponse.json({ id: 5, name: "Marketing digital", category: { id: 1, name: "Marketing" } }),
    ),
    http.get(`${API}/categorias-financeiro/`, () =>
      HttpResponse.json({
        results: [
          { id: 1, name: "Marketing" },
          { id: 2, name: "Frota" },
        ],
        count: 2,
      }),
    ),
  )
}

beforeEach(() => {
  navigateSpy.mockClear()
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

describe("<FinancialSubcategoryEdit>", () => {
  it("pré-preenche nome e categoria existentes", async () => {
    mockApi()
    renderWithProviders(<FinancialSubcategoryEdit />)

    expect(await screen.findByDisplayValue("Marketing digital")).toBeInTheDocument()
    const input = await screen.findByRole("combobox")
    await waitFor(() => expect(input).toHaveValue("Marketing"))
  })

  it("renomeia e salva via PUT", async () => {
    mockApi()
    let receivedBody
    server.use(
      http.put(`${API}/subcategorias-financeiro/5/`, async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json({ id: 5, ...receivedBody })
      }),
    )
    const user = userEvent.setup()
    renderWithProviders(<FinancialSubcategoryEdit />)

    const nameInput = await screen.findByDisplayValue("Marketing digital")
    await user.clear(nameInput)
    await user.type(nameInput, "Marketing online")
    await user.click(screen.getByRole("button", { name: "Salvar Alterações" }))

    await waitFor(() => expect(receivedBody?.name).toBe("Marketing online"))
  })

  it("troca a categoria vinculada e salva via PUT", async () => {
    mockApi()
    let receivedBody
    server.use(
      http.put(`${API}/subcategorias-financeiro/5/`, async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json({ id: 5, ...receivedBody })
      }),
    )
    const user = userEvent.setup()
    renderWithProviders(<FinancialSubcategoryEdit />)

    const input = await screen.findByRole("combobox")
    await waitFor(() => expect(input).toHaveValue("Marketing"))
    await user.click(input)
    await user.click(await screen.findByRole("option", { name: "Frota" }))
    await user.click(screen.getByRole("button", { name: "Salvar Alterações" }))

    await waitFor(() => expect(receivedBody?.category_id).toBe("2"))
  })

  it("recusa salvar sem nome", async () => {
    mockApi()
    let posted = false
    server.use(
      http.put(`${API}/subcategorias-financeiro/5/`, () => {
        posted = true
        return HttpResponse.json({ id: 5 })
      }),
    )
    const user = userEvent.setup()
    renderWithProviders(<FinancialSubcategoryEdit />)

    const nameInput = await screen.findByDisplayValue("Marketing digital")
    await user.clear(nameInput)
    await user.click(screen.getByRole("button", { name: "Salvar Alterações" }))

    expect(await screen.findByText(/informe o nome/i)).toBeInTheDocument()
    expect(posted).toBe(false)
  })
})
