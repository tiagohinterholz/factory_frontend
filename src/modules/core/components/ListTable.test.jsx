import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import ListTable from "./ListTable"

const columns = [
  { header: "Nome", sortKey: "name", accessor: (item) => item.name },
  { header: "Telefone", accessor: (item) => item.phone },
]
const data = [{ id: 1, name: "Ana", phone: "999" }]

const renderTable = (props) =>
  render(
    <MemoryRouter>
      <ListTable columns={columns} data={data} currentPage={1} totalItems={1} {...props} />
    </MemoryRouter>,
  )

describe("<ListTable> — ordenação", () => {
  it("coluna com sortKey vira botão; sem sortKey fica texto", () => {
    renderTable({ ordering: "", onSort: vi.fn() })
    expect(screen.getByRole("button", { name: /nome/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /telefone/i })).not.toBeInTheDocument()
  })

  it("clicar no cabeçalho chama onSort com o sortKey", () => {
    const onSort = vi.fn()
    renderTable({ ordering: "", onSort })
    fireEvent.click(screen.getByRole("button", { name: /nome/i }))
    expect(onSort).toHaveBeenCalledWith("name")
  })

  it("sem onSort, o cabeçalho não é clicável mesmo com sortKey", () => {
    renderTable({})
    expect(screen.queryByRole("button", { name: /nome/i })).not.toBeInTheDocument()
    expect(screen.getByText("Nome")).toBeInTheDocument()
  })
})
