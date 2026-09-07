import "@testing-library/jest-dom/vitest"
import { afterAll, afterEach, beforeAll, vi } from "vitest"
import { cleanup } from "@testing-library/react"
import { server } from "./msw/server"

// jsdom não tem esses — Headless UI (floating-ui) usa no posicionamento do dropdown.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}

// Falha o teste se ele bater num endpoint que ninguém mockou.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }))

afterEach(() => {
  server.resetHandlers()
  cleanup()
  localStorage.clear()
})

afterAll(() => server.close())
