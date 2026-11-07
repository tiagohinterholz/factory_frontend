import { describe, it, expect, vi } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ProductCategoryLiveSelect from "./ProductCategoryLiveSelect"

function mockCategories(results = []) {
  server.use(
    http.get(`${API}/categorias-produto/`, () =>
      HttpResponse.json({ results, count: results.length }),
    ),
  )
}

describe("<ProductCategoryLiveSelect>", () => {
  it("filtra por nome, case-insensitive", async () => {
    mockCategories([
      { id: 1, name: "Pneus" },
      { id: 2, name: "Lubrificantes" },
    ])
    const user = userEvent.setup()
    renderWithProviders(<ProductCategoryLiveSelect label="Categoria" value="" onChange={vi.fn()} />)

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await screen.findByRole("option", { name: "Pneus" })
    await user.type(input, "lubri")

    expect(await screen.findByRole("option", { name: "Lubrificantes" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Pneus" })).not.toBeInTheDocument()
  })

  it("sem match, mostra 'Cadastrar nova categoria' que abre o modal", async () => {
    mockCategories([{ id: 1, name: "Pneus" }])
    const user = userEvent.setup()
    renderWithProviders(<ProductCategoryLiveSelect label="Categoria" value="" onChange={vi.fn()} />)

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await screen.findByRole("option", { name: "Pneus" })
    await user.type(input, "nenhuma-categoria-bate")

    await user.click(await screen.findByRole("option", { name: "Cadastrar nova categoria" }))
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
  })

  it("lista vazia mostra direto o atalho de criar, sem 'nenhum resultado'", async () => {
    mockCategories([])
    const user = userEvent.setup()
    renderWithProviders(<ProductCategoryLiveSelect label="Categoria" value="" onChange={vi.fn()} />)

    const input = await screen.findByRole("combobox")
    await user.click(input)

    expect(
      await screen.findByRole("option", { name: "Cadastrar nova categoria" }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/nenhum resultado/i)).not.toBeInTheDocument()
  })

  it("modal criado com sucesso seleciona a categoria nova automaticamente e fecha", async () => {
    mockCategories([])
    server.use(
      http.post(`${API}/categorias-produto/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 9, name: "Pneus", ...body }, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(
      <ProductCategoryLiveSelect label="Categoria" value="" onChange={onChange} />,
    )

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await user.click(await screen.findByRole("option", { name: "Cadastrar nova categoria" }))

    const dialog = await screen.findByRole("dialog")
    await user.type(screen.getByPlaceholderText("Ex: Pneus"), "Pneus")
    await user.click(screen.getByRole("button", { name: "Salvar Categoria" }))

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("9"))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(dialog).not.toBeInTheDocument()
  })
})
