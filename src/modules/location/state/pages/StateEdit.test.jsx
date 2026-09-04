import { describe, it, expect } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { Routes, Route } from "react-router-dom"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import StateEdit from "./StateEdit"

function mockState(overrides = {}) {
  server.use(
    http.get(`${API}/estados/1/`, () =>
      HttpResponse.json({
        id: 1,
        name: "São Paulo",
        abbreviation: "SP",
        is_active: true,
        ...overrides,
      }),
    ),
    http.get(`${API}/estados/1/cidades/`, () => HttpResponse.json({ results: [], count: 0 })),
  )
}

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/estados/:id" element={<StateEdit />} />
    </Routes>,
    { route: "/estados/1" },
  )

describe("<StateEdit>", () => {
  it("nome e sigla vêm somente-leitura, sem botão de excluir", async () => {
    mockState()
    renderPage()

    const name = await screen.findByDisplayValue("São Paulo")
    expect(name).toHaveAttribute("readonly")
    expect(screen.getByDisplayValue("SP")).toHaveAttribute("readonly")
    expect(screen.queryByText(/excluir estado/i)).not.toBeInTheDocument()
  })

  it("salva só is_active via PATCH", async () => {
    let body
    mockState()
    server.use(
      http.patch(`${API}/estados/1/`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ id: 1, name: "São Paulo", abbreviation: "SP", is_active: false })
      }),
    )
    renderPage()

    const toggle = await screen.findByRole("checkbox", { name: /estado ativo/i })
    fireEvent.click(toggle)
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }))

    await waitFor(() => expect(body).toEqual({ is_active: false }))
  })
})
