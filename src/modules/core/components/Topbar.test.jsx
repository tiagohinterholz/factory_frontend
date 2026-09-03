import { describe, it, expect, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import Topbar from "./Topbar"

describe("<Topbar>", () => {
  beforeEach(() => {
    localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 3 }))
    server.use(http.get(`${API}/empreendimentos/licencas/`, () => HttpResponse.json([])))
  })

  it("tem Configurações no menu do usuário", () => {
    renderWithProviders(<Topbar onOpenMobile={() => {}} />)

    expect(screen.getByRole("link", { name: /configurações/i })).toHaveAttribute(
      "href",
      "/configuracoes",
    )
  })
})
