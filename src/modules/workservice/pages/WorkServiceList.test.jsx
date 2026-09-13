import { describe, it, expect } from "vitest"
import { screen, fireEvent, within } from "@testing-library/react"
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
    fireEvent.click(await screen.findByRole("button", { name: /selecione o\(a\) fornecedor/i }))
    fireEvent.click(await screen.findByRole("option", { name: "Bosch Ltda" }))
    fireEvent.click(screen.getByRole("button", { name: "Filtrar" }))

    expect(await screen.findByText("Alinhamento Bosch")).toBeInTheDocument()
    expect(screen.queryByText("Troca de óleo")).not.toBeInTheDocument()
  })

  it("mostra o fornecedor na coluna, ou '-' quando o serviço não tem um", async () => {
    server.use(
      http.get(`${API}/fornecedores/`, () => HttpResponse.json({ results: [], count: 0 })),
      http.get(`${API}/servicos/`, () =>
        HttpResponse.json({
          results: [
            {
              id: 1,
              name: "Alinhamento Bosch",
              supplier: { id: 9, corporate_name: "Bosch Ltda" },
            },
            { id: 2, name: "Serviço avulso", supplier: null },
          ],
          count: 2,
        }),
      ),
    )
    renderWithProviders(<WorkServiceList />)

    await screen.findByText("Alinhamento Bosch")
    const [comBosch, semFornecedor] = screen.getAllByRole("row").slice(1)
    // colunas: Nome, Fornecedor, Preço, Descrição
    expect(within(comBosch).getAllByRole("cell")[1]).toHaveTextContent("Bosch Ltda")
    expect(within(semFornecedor).getAllByRole("cell")[1]).toHaveTextContent("-")
    expect(within(comBosch).getByRole("link", { name: "Bosch Ltda" })).toHaveAttribute(
      "href",
      "/fornecedores/9",
    )
  })
})
