import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, fireEvent } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import VehicleList from "./VehicleList"

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateSpy }
})

beforeEach(() => {
  navigateSpy.mockClear()
  server.use(
    http.get(`${API}/veiculos/`, () =>
      HttpResponse.json({
        results: [
          {
            id: 7,
            plate: "ABC1D23",
            model: "Gol",
            color: "Prata",
            client: { id: 3, first_name: "Ana", last_name: "Lima" },
          },
        ],
        count: 1,
      }),
    ),
  )
})

describe("<VehicleList>", () => {
  it("Abrir OS leva ao form de OS com veículo e cliente pré-preenchidos", async () => {
    renderWithProviders(<VehicleList />)

    fireEvent.click(await screen.findByRole("button", { name: /abrir os para este veículo/i }))
    expect(navigateSpy).toHaveBeenCalledWith("/ordens/novo", {
      state: { vehicleId: 7, clientId: 3 },
    })
  })

  it("Fazer orçamento leva ao form de orçamento pré-preenchido", async () => {
    renderWithProviders(<VehicleList />)

    fireEvent.click(
      await screen.findByRole("button", { name: /fazer orçamento para este veículo/i }),
    )
    expect(navigateSpy).toHaveBeenCalledWith("/orcamentos/novo", {
      state: { vehicleId: 7, clientId: 3 },
    })
  })
})
