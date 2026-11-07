import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import VehicleModelCreate from "./VehicleModelCreate"

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateSpy, useLocation: () => ({ state: null }) }
})

beforeEach(() => {
  navigateSpy.mockClear()
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

describe("<VehicleModelCreate>", () => {
  it("usa ManufacturerLiveSelect (combobox) no campo Marca", async () => {
    server.use(
      http.get(`${API}/marcas/`, () =>
        HttpResponse.json({ results: [{ id: 1, name: "Toyota" }], count: 1 }),
      ),
    )
    renderWithProviders(<VehicleModelCreate />)

    await screen.findByText("Marca")
    expect(await screen.findByRole("combobox")).toBeInTheDocument()
  })

  it("cadastra uma nova marca direto pelo modal, sem navegar pra fora da página", async () => {
    const manufacturers = [{ id: 1, name: "Toyota" }]
    server.use(
      http.get(`${API}/marcas/`, () =>
        HttpResponse.json({ results: manufacturers, count: manufacturers.length }),
      ),
      http.post(`${API}/marcas/`, async ({ request }) => {
        const body = await request.json()
        const created = { id: 9, name: "Honda", ...body }
        manufacturers.push(created)
        return HttpResponse.json(created, { status: 201 })
      }),
    )
    renderWithProviders(<VehicleModelCreate />)
    const user = userEvent.setup()

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await user.click(await screen.findByRole("option", { name: "Cadastrar nova marca" }))

    const dialog = await screen.findByRole("dialog")
    await user.type(screen.getByPlaceholderText("Ex: Toyota"), "Honda")
    await user.click(screen.getByRole("button", { name: "Salvar Marca" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(dialog).not.toBeInTheDocument()
    await waitFor(() => expect(input).toHaveValue("Honda"))
    expect(navigateSpy).not.toHaveBeenCalled()
  })
})
