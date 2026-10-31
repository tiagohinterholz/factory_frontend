import { useState } from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import ProductSubcategoryLiveSelect from "./ProductSubcategoryLiveSelect"

beforeEach(() => {
  server.use(
    http.get(`${API}/categorias-produto/`, () =>
      HttpResponse.json({ results: [{ id: 1, name: "Pneus" }], count: 1 }),
    ),
  )
})

function mockSubcategories(categoryId, results = []) {
  server.use(
    http.get(`${API}/categorias-produto/${categoryId}/subcategorias/`, () =>
      HttpResponse.json({ results, count: results.length }),
    ),
  )
}

describe("<ProductSubcategoryLiveSelect>", () => {
  it("sem categoryId, fica desabilitado com disabledHint e sem atalho de criar", async () => {
    renderWithProviders(<ProductSubcategoryLiveSelect label="Subcategoria" value="" onChange={vi.fn()} />)

    const input = await screen.findByRole("combobox")
    expect(input).toBeDisabled()
    expect(input).toHaveAttribute("placeholder", "Selecione a categoria primeiro")
  })

  it("com categoryId, filtra as opções pela subcategoria da categoria e por nome", async () => {
    mockSubcategories(1, [
      { id: 1, name: "Pneu de Carro" },
      { id: 2, name: "Pneu de Moto" },
    ])
    const user = userEvent.setup()
    renderWithProviders(
      <ProductSubcategoryLiveSelect
        label="Subcategoria"
        value=""
        onChange={vi.fn()}
        categoryId={1}
      />,
    )

    const input = await screen.findByRole("combobox")
    expect(input).not.toBeDisabled()
    await user.click(input)
    await screen.findByRole("option", { name: "Pneu de Carro" })
    await user.type(input, "moto")

    expect(await screen.findByRole("option", { name: "Pneu de Moto" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Pneu de Carro" })).not.toBeInTheDocument()
  })

  it("as opções são refeitas quando categoryId muda (não mistura subcategorias de outra categoria)", async () => {
    mockSubcategories(1, [{ id: 1, name: "Pneu de Carro" }])
    mockSubcategories(2, [{ id: 2, name: "Óleo de Motor" }])

    function Harness() {
      const [categoryId, setCategoryId] = useState(1)
      return (
        <>
          <button type="button" onClick={() => setCategoryId(2)}>
            trocar categoria
          </button>
          <ProductSubcategoryLiveSelect
            label="Subcategoria"
            value=""
            onChange={vi.fn()}
            categoryId={categoryId}
          />
        </>
      )
    }

    const user = userEvent.setup()
    renderWithProviders(<Harness />)

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await screen.findByRole("option", { name: "Pneu de Carro" })
    await user.keyboard("{Escape}")

    await user.click(screen.getByRole("button", { name: "trocar categoria" }))

    await user.click(input)
    expect(await screen.findByRole("option", { name: "Óleo de Motor" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Pneu de Carro" })).not.toBeInTheDocument()
  })

  it("com categoryId e sem match, 'Cadastrar nova subcategoria' abre o modal com a categoria certa", async () => {
    mockSubcategories(1, [{ id: 1, name: "Pneu de Carro" }])
    const user = userEvent.setup()
    renderWithProviders(
      <ProductSubcategoryLiveSelect
        label="Subcategoria"
        value=""
        onChange={vi.fn()}
        categoryId={1}
      />,
    )

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await screen.findByRole("option", { name: "Pneu de Carro" })
    await user.type(input, "nenhuma-subcategoria-bate")

    await user.click(await screen.findByRole("option", { name: "Cadastrar nova subcategoria" }))
    const dialog = await screen.findByRole("dialog")
    await waitFor(() =>
      expect(
        within(dialog).getByText("Categoria").closest("div").querySelector("input"),
      ).toHaveValue("Pneus"),
    )
  })

  it("modal criado com sucesso seleciona a subcategoria nova automaticamente e fecha", async () => {
    mockSubcategories(1, [])
    server.use(
      http.post(`${API}/subcategorias-produto/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 42, name: "Pneu de Carro", ...body }, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(
      <ProductSubcategoryLiveSelect
        label="Subcategoria"
        value=""
        onChange={onChange}
        categoryId={1}
      />,
    )

    const input = await screen.findByRole("combobox")
    await user.click(input)
    await user.click(await screen.findByRole("option", { name: "Cadastrar nova subcategoria" }))

    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByPlaceholderText("Ex: Filtro de óleo"), "Pneu de Carro")
    await user.click(within(dialog).getByRole("button", { name: "Salvar Subcategoria" }))

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("42"))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("repassa a mensagem de erro recebida via prop error", async () => {
    mockSubcategories(1, [])
    renderWithProviders(
      <ProductSubcategoryLiveSelect
        label="Subcategoria"
        value=""
        onChange={vi.fn()}
        categoryId={1}
        error="Selecione a subcategoria"
      />,
    )

    expect(await screen.findByText("Selecione a subcategoria")).toBeInTheDocument()
  })
})
