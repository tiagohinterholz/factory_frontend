import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import LiveSelect from "./LiveSelect"

const options = [
  { id: "1", name: "Ana Silva", document: "11144477735" },
  { id: "2", name: "Bruno Souza", document: "22255588846" },
]

describe("<LiveSelect>", () => {
  it("abre a lista de opções ao clicar/focar no campo", async () => {
    const user = userEvent.setup()
    render(<LiveSelect label="Cliente" options={options} value="" onChange={vi.fn()} />)

    await user.click(screen.getByRole("combobox"))

    expect(await screen.findByRole("option", { name: "Ana Silva" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Bruno Souza" })).toBeInTheDocument()
  })

  it("filtra conforme digita, case-insensitive, substring, usando option.name por padrão", async () => {
    const user = userEvent.setup()
    render(<LiveSelect label="Cliente" options={options} value="" onChange={vi.fn()} />)

    const input = screen.getByRole("combobox")
    await user.click(input)
    await screen.findByRole("option", { name: "Ana Silva" })
    await user.type(input, "ANA")

    expect(await screen.findByRole("option", { name: "Ana Silva" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Bruno Souza" })).not.toBeInTheDocument()
  })

  it("usa getSearchText customizado (ex.: nome + documento) quando fornecido", async () => {
    const user = userEvent.setup()
    render(
      <LiveSelect
        label="Cliente"
        options={options}
        value=""
        onChange={vi.fn()}
        getSearchText={(option) => `${option.name} ${option.document}`}
      />,
    )

    const input = screen.getByRole("combobox")
    await user.click(input)
    await screen.findByRole("option", { name: "Ana Silva" })
    await user.type(input, "222555")

    expect(await screen.findByRole("option", { name: "Bruno Souza" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Ana Silva" })).not.toBeInTheDocument()
  })

  it("mostra o atalho de criação sempre que onCreateNew está definido, com ou sem match (primeira opção da lista)", async () => {
    const user = userEvent.setup()
    const onCreateNew = vi.fn()
    render(
      <LiveSelect
        label="Cliente"
        options={options}
        value=""
        onChange={vi.fn()}
        createLabel="Cadastrar novo cliente"
        onCreateNew={onCreateNew}
      />,
    )

    const input = screen.getByRole("combobox")
    await user.click(input)
    const optionsBeforeFilter = await screen.findAllByRole("option")
    expect(optionsBeforeFilter[0]).toHaveTextContent("Cadastrar novo cliente")
    expect(screen.getByRole("option", { name: "Ana Silva" })).toBeInTheDocument()

    await user.type(input, "nenhum-cliente-bate")
    expect(
      await screen.findByRole("option", { name: "Cadastrar novo cliente" }),
    ).toBeInTheDocument()

    await user.clear(input)
    await user.type(input, "Ana")
    expect(await screen.findByRole("option", { name: "Ana Silva" })).toBeInTheDocument()
    expect(
      await screen.findByRole("option", { name: "Cadastrar novo cliente" }),
    ).toBeInTheDocument()
  })

  it("sem onCreateNew, nunca mostra o atalho, mesmo quando nada bate", async () => {
    const user = userEvent.setup()
    render(
      <LiveSelect
        label="Cliente"
        options={options}
        value=""
        onChange={vi.fn()}
        createLabel="Cadastrar novo cliente"
      />,
    )

    const input = screen.getByRole("combobox")
    await user.click(input)
    await screen.findByRole("option", { name: "Ana Silva" })
    await user.type(input, "nenhum-cliente-bate")

    expect(screen.queryByRole("option", { name: "Cadastrar novo cliente" })).not.toBeInTheDocument()
    expect(screen.queryByRole("option")).not.toBeInTheDocument()
  })

  it("extraOption: mantém visível o registro selecionado mesmo ausente da lista de opções (ex.: cliente/veículo desativado)", async () => {
    render(
      <LiveSelect
        label="Cliente"
        options={options}
        value="99"
        onChange={vi.fn()}
        extraOption={{ id: "99", name: "Cliente Desativado" }}
      />,
    )

    expect(screen.getByRole("combobox")).toHaveValue("Cliente Desativado")
  })

  it("extraOption: não duplica quando o id selecionado já está na lista de opções", async () => {
    const user = userEvent.setup()
    render(
      <LiveSelect
        label="Cliente"
        options={options}
        value="1"
        onChange={vi.fn()}
        extraOption={{ id: "1", name: "Ana Silva (fallback)" }}
      />,
    )

    expect(screen.getByRole("combobox")).toHaveValue("Ana Silva")
    await user.click(screen.getByRole("combobox"))
    expect(screen.getAllByRole("option", { name: "Ana Silva" })).toHaveLength(1)
    expect(screen.queryByRole("option", { name: "Ana Silva (fallback)" })).not.toBeInTheDocument()
  })

  it("clicar numa opção chama onChange com o id (string)", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<LiveSelect label="Cliente" options={options} value="" onChange={onChange} />)

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "Bruno Souza" }))

    expect(onChange).toHaveBeenCalledWith("2")
  })

  it("clicar no atalho de criação chama onCreateNew e NÃO chama onChange", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onCreateNew = vi.fn()
    render(
      <LiveSelect
        label="Cliente"
        options={options}
        value=""
        onChange={onChange}
        createLabel="Cadastrar novo cliente"
        onCreateNew={onCreateNew}
      />,
    )

    const input = screen.getByRole("combobox")
    await user.click(input)
    await screen.findByRole("option", { name: "Ana Silva" })
    await user.type(input, "nenhum-cliente-bate")
    await user.click(await screen.findByRole("option", { name: "Cadastrar novo cliente" }))

    expect(onCreateNew).toHaveBeenCalledTimes(1)
    expect(onChange).not.toHaveBeenCalled()
  })
})
