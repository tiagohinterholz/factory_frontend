import { describe, it, expect, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import { Routes, Route } from "react-router-dom"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import VehicleDetail from "./VehicleDetail"

function mockVehicle() {
  server.use(
    http.get(`${API}/veiculos/1/`, () =>
      HttpResponse.json({
        id: 1,
        business: 3,
        client: 5,
        manufacturer: 1,
        model: 2,
        year: 2020,
        year_model: 2020,
        plate: "ABC-1234",
        color: "Prata",
        fuel: "flex",
        mileage: 1000,
      }),
    ),
    http.get(`${API}/clientes/`, () =>
      HttpResponse.json({ results: [{ id: 5, display_name: "Ana Lima" }], count: 1 }),
    ),
    http.get(`${API}/marcas/`, () =>
      HttpResponse.json({ results: [{ id: 1, name: "VW" }], count: 1 }),
    ),
    http.get(`${API}/marcas/1/modelos/`, () =>
      HttpResponse.json({ results: [{ id: 2, name: "Gol" }], count: 1 }),
    ),
    http.get(`${API}/estados/`, () => HttpResponse.json({ results: [], count: 0 })),
    http.get(`${API}/ordens/veiculo/1/`, () => HttpResponse.json([])),
    http.get(`${API}/orcamentos/veiculo/1/`, () => HttpResponse.json([])),
  )
}

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/veiculos/:id" element={<VehicleDetail />} />
    </Routes>,
    { route: "/veiculos/1" },
  )

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3, role: "admin" }))
})

describe("<VehicleDetail>", () => {
  it("usa LiveSelect (combobox com busca) pra Cliente/Marca/Modelo, não mais botão +/olho", async () => {
    mockVehicle()
    renderPage()

    await screen.findByText("Cliente Proprietário *")
    expect(
      screen.queryByRole("button", { name: /ver \/ editar cliente vinculado/i }),
    ).not.toBeInTheDocument()
    const comboboxes = screen
      .getAllByRole("combobox")
      .filter((el) => el.id?.startsWith("headlessui-combobox-input"))
    expect(comboboxes).toHaveLength(3)
  })

  it("marca os campos obrigatórios com *", async () => {
    mockVehicle()
    renderPage()

    expect(await screen.findByText("Cliente Proprietário *")).toBeInTheDocument()
    expect(screen.getByText("Marca *")).toBeInTheDocument()
    expect(screen.getByText("Modelo *")).toBeInTheDocument()
    expect(screen.getByText("Placa *")).toBeInTheDocument()
    expect(screen.getByText("Combustível *")).toBeInTheDocument()
    expect(screen.getByText("Cor")).toBeInTheDocument()
  })
})
