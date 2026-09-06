import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, fireEvent } from "@testing-library/react"
import { renderWithProviders } from "@/test/render"
import LogoUploadField from "./LogoUploadField"

beforeEach(() => {
  // jsdom não implementa; o componente usa pra montar o preview do File
  URL.createObjectURL = vi.fn(() => "blob:fake")
  URL.revokeObjectURL = vi.fn()
})

describe("<LogoUploadField>", () => {
  it("sem valor, mostra 'Selecionar imagem' e nenhum preview", () => {
    renderWithProviders(<LogoUploadField label="Logo" value="" onChange={vi.fn()} />)
    expect(screen.getByRole("button", { name: /selecionar imagem/i })).toBeInTheDocument()
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("com URL atual, mostra o preview e o botão vira 'Trocar imagem'", () => {
    renderWithProviders(
      <LogoUploadField label="Logo" value="https://cdn/logo.png" onChange={vi.fn()} />,
    )
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://cdn/logo.png")
    expect(screen.getByRole("button", { name: /trocar imagem/i })).toBeInTheDocument()
  })

  it("cai pra currentUrl quando value está vazio", () => {
    renderWithProviders(
      <LogoUploadField
        label="Logo"
        value=""
        currentUrl="https://cdn/atual.png"
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://cdn/atual.png")
  })

  it("resolve caminho relativo do Django contra o host da API", () => {
    renderWithProviders(
      <LogoUploadField label="Logo" value="/media/logos/x.png" onChange={vi.fn()} />,
    )
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "http://localhost:8000/media/logos/x.png",
    )
  })

  it("escolher um arquivo chama onChange com o File", () => {
    const onChange = vi.fn()
    renderWithProviders(<LogoUploadField label="Logo" value="" onChange={onChange} />)

    const file = new File(["x"], "logo.png", { type: "image/png" })
    fireEvent.change(screen.getByLabelText("Logo"), { target: { files: [file] } })

    expect(onChange).toHaveBeenCalledWith(file)
  })

  it("com um File selecionado, 'Remover seleção' chama onChange('')", () => {
    const onChange = vi.fn()
    const file = new File(["x"], "logo.png", { type: "image/png" })
    renderWithProviders(<LogoUploadField label="Logo" value={file} onChange={onChange} />)

    fireEvent.click(screen.getByRole("button", { name: /remover seleção/i }))
    expect(onChange).toHaveBeenCalledWith("")
  })
})
