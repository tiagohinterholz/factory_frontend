import { describe, it, expect, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { Routes, Route } from "react-router-dom"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import FinancialCategoryList from "./FinancialCategoryList"
import FinancialCategoryEdit from "./FinancialCategoryEdit"
import FinancialTagList from "./FinancialTagList"

const ADMIN = { email: "a@a.com", business_id: 3, role: "admin" }
const CONTADOR = {
  email: "c@a.com",
  business_id: 3,
  role: "contador",
  permissions: [
    "financial.view_financialentry",
    "financial.view_financialentrycategory",
    "financial.view_financialentrysubcategory",
  ],
}

function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user))
}

const CATEGORIES = [
  { id: 1, name: "Aluguel", code: "aluguel", is_active: true, is_system: true },
  { id: 9, name: "Marketing", code: null, is_active: true, is_system: false },
]

describe("<FinancialCategoryList>", () => {
  beforeEach(() => {
    server.use(
      http.get(`${API}/categorias-financeiro/`, () =>
        HttpResponse.json({ results: CATEGORIES, count: 2 }),
      ),
    )
  })

  it("lista categorias e marca as do sistema (OSFIN-P3-03)", async () => {
    setUser(ADMIN)
    renderWithProviders(<FinancialCategoryList />)

    expect(await screen.findByText("Marketing")).toBeInTheDocument()
    expect(screen.getByText("Sistema")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /nova categoria/i })).toHaveAttribute(
      "href",
      "/financeiro/categorias/novo",
    )
  })

  it("contador só visualiza", async () => {
    setUser(CONTADOR)
    renderWithProviders(<FinancialCategoryList />)

    expect(await screen.findByText("Marketing")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /nova categoria/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Excluir" })).not.toBeInTheDocument()
  })
})

describe("<FinancialCategoryEdit>", () => {
  function renderEdit(category) {
    server.use(
      http.get(`${API}/categorias-financeiro/${category.id}/`, () => HttpResponse.json(category)),
    )
    renderWithProviders(
      <Routes>
        <Route path="/financeiro/categorias/:id" element={<FinancialCategoryEdit />} />
      </Routes>,
      { route: `/financeiro/categorias/${category.id}` },
    )
  }

  it("categoria do sistema não pode ser renomeada nem excluída", async () => {
    setUser(ADMIN)
    renderEdit(CATEGORIES[0])

    expect(await screen.findByText(/categoria do sistema/i)).toBeInTheDocument()
    expect(document.querySelector('input[name="name"]')).toBeDisabled()
    expect(screen.queryByRole("button", { name: /excluir$/i })).not.toBeInTheDocument()
  })

  it("mostra um link pra listagem padrão de subcategorias, sem o widget inline antigo", async () => {
    setUser(ADMIN)
    renderEdit(CATEGORIES[1])

    expect(await screen.findByText("Subcategorias")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /ver subcategorias financeiras/i })).toHaveAttribute(
      "href",
      "/subcategorias-financeiro",
    )
    expect(screen.queryByLabelText("Nova subcategoria")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Adicionar subcategoria" })).not.toBeInTheDocument()
  })
})

describe("<FinancialTagList>", () => {
  let created

  beforeEach(() => {
    created = null
    server.use(
      http.get(`${API}/financeiro/tags/`, () =>
        HttpResponse.json({
          results: [{ id: 2, name: "Urgente", entries_count: 4 }],
          count: 1,
        }),
      ),
      http.post(`${API}/financeiro/tags/`, async ({ request }) => {
        created = await request.json()
        return HttpResponse.json({ id: 3, ...created }, { status: 201 })
      }),
    )
  })

  it("lista tags com quantos lançamentos usam e cria uma nova (OSFIN-P3-04)", async () => {
    setUser(ADMIN)
    renderWithProviders(<FinancialTagList />)

    expect(await screen.findByText("Urgente")).toBeInTheDocument()
    expect(screen.getByText("4")).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText("Nova tag"), { target: { value: "Fixo" } })
    fireEvent.click(screen.getByRole("button", { name: "Adicionar tag" }))

    await waitFor(() => expect(created).toEqual({ name: "Fixo" }))
  })

  it("contador não cria, renomeia nem exclui", async () => {
    setUser(CONTADOR)
    renderWithProviders(<FinancialTagList />)

    expect(await screen.findByText("Urgente")).toBeInTheDocument()
    expect(screen.queryByLabelText("Nova tag")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /renomear tag/i })).not.toBeInTheDocument()
  })
})
