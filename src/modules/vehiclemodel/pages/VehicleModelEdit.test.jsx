import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import VehicleModelEdit from "./VehicleModelEdit"

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useParams: () => ({ id: "5" }), useNavigate: () => vi.fn() }
})

function mockApi() {
  server.use(
    http.get(`${API}/modelos-veiculo/5/`, () =>
      HttpResponse.json({ id: 5, name: "Corolla", manufacturer: { id: 1, name: "Toyota" } }),
    ),
    http.get(`${API}/marcas/`, () =>
      HttpResponse.json({
        results: [
          { id: 1, name: "Toyota" },
          { id: 2, name: "Honda" },
        ],
        count: 2,
      }),
    ),
  )
}

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

describe("<VehicleModelEdit>", () => {
  it("pré-seleciona a marca existente do modelo no ManufacturerLiveSelect", async () => {
    mockApi()
    renderWithProviders(<VehicleModelEdit />)

    const input = await screen.findByRole("combobox")
    await waitFor(() => expect(input).toHaveValue("Toyota"))
  })
})
