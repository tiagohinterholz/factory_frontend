import { describe, it, expect } from "vitest"
import { renderWithProviders } from "./render"

describe("harness", () => {
  it("roda o Vitest", () => {
    expect(1 + 1).toBe(2)
  })

  it("tem jsdom", () => {
    expect(typeof window).toBe("object")
    expect(typeof document.querySelector).toBe("function")
  })

  it("renderWithProviders monta a árvore de providers", () => {
    const { container } = renderWithProviders(<div>ok</div>)
    expect(container).toHaveTextContent("ok")
  })
})
