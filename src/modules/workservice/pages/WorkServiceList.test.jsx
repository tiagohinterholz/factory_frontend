import { describe, it, expect } from "vitest"
import { screen, fireEvent } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import WorkServiceList from "./WorkServiceList"

function mockWorkServices() {
  server.use(
    http.get(`${API}/fornecedores/`, () =>
      HttpResponse.json({ results: [{ id: 9, corporate_name: "Bosch Ltda" }], count: 1 }),
    ),
    http.get(`${API}/servicos/`, ({ request }) => {
      const supplierId = new URL(request.url).searchParams.get("supplier_id")
      return supplierId === "9"
        ? HttpResponse.json({ results: [{ id: 1, name: "Alinhamento Bosch" }], count: 1 })
        : HttpResponse.json({ results: [{ id: 2, name: "Troca de óleo" }], count: 1 })
    }),
  )
}

describe("<WorkServiceList>", () => {
  it("filtra por fornecedor pelo painel de Filtros", async () => {
    mockWorkServices()
    renderWithProviders(<WorkServiceList />)

    expect(await screen.findByText("Troca de óleo")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /filtros/i }))
    const supplierSelect = (await screen.findByRole("option", { name: "Bosch Ltda" })).closest(
      "select",
    )
    fireEvent.change(supplierSelect, { target: { value: "9" } })
    fireEvent.click(screen.getByRole("button", { name: "Filtrar" }))

    expect(await screen.findByText("Alinhamento Bosch")).toBeInTheDocument()
    expect(screen.queryByText("Troca de óleo")).not.toBeInTheDocument()
  })
})
