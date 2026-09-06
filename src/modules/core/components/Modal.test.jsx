import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import Modal from "./Modal"

describe("<Modal>", () => {
  it("não renderiza nada quando open é false", () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Título">
        conteúdo
      </Modal>,
    )
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("renderiza título, conteúdo e footer quando aberto", () => {
    render(
      <Modal open onClose={vi.fn()} title="Veículos" footer={<button>Fechar</button>}>
        <p>lista aqui</p>
      </Modal>,
    )
    expect(screen.getByRole("dialog", { name: "Veículos" })).toBeInTheDocument()
    expect(screen.getByText("lista aqui")).toBeInTheDocument()
    // rodapé (texto) + X do header (aria-label) — os dois se chamam "Fechar"
    expect(screen.getAllByRole("button", { name: "Fechar" })).toHaveLength(2)
  })

  it("fecha pelo X, pelo clique fora e pelo Escape", () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="T">
        c
      </Modal>,
    )

    fireEvent.click(screen.getByRole("button", { name: "Fechar" })) // o X tem aria-label "Fechar"
    fireEvent.keyDown(window, { key: "Escape" })
    fireEvent.click(screen.getByRole("dialog").parentElement) // overlay

    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it("clicar dentro do dialog não fecha", () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="T">
        <p>dentro</p>
      </Modal>,
    )
    fireEvent.click(screen.getByText("dentro"))
    expect(onClose).not.toHaveBeenCalled()
  })
})
