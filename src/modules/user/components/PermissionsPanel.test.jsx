import { describe, it, expect } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import PermissionsPanel from "./PermissionsPanel"

function mockAssignable(overrides = []) {
  server.use(
    http.get(`${API}/usuarios/7/permissoes/`, () =>
      HttpResponse.json({
        role: "atendente",
        assignable: [
          {
            codename: "budgets.can_approve_budget",
            module: "Orçamento",
            label: "Pode aprovar orçamento",
            granted: false,
          },
          {
            codename: "orders.can_invoice_order",
            module: "Ordem de Serviço",
            label: "Pode faturar ordem de serviço",
            granted: false,
          },
          ...overrides,
        ],
      }),
    ),
  )
}

describe("<PermissionsPanel>", () => {
  it("mostra as permissões concedíveis agrupadas por módulo", async () => {
    mockAssignable()
    renderWithProviders(<PermissionsPanel userId="7" />)

    expect(await screen.findByText("Pode aprovar orçamento")).toBeInTheDocument()
    expect(screen.getByText("Pode faturar ordem de serviço")).toBeInTheDocument()
    expect(screen.getByText("Orçamento")).toBeInTheDocument()
    expect(screen.getByText("Ordem de Serviço")).toBeInTheDocument()
  })

  it("já vem marcado o que o usuário já tem", async () => {
    mockAssignable()
    server.use(
      http.get(`${API}/usuarios/7/permissoes/`, () =>
        HttpResponse.json({
          role: "atendente",
          assignable: [
            {
              codename: "budgets.can_approve_budget",
              module: "Orçamento",
              label: "Pode aprovar orçamento",
              granted: true,
            },
          ],
        }),
      ),
    )
    renderWithProviders(<PermissionsPanel userId="7" />)

    expect(await screen.findByRole("checkbox", { name: "Pode aprovar orçamento" })).toBeChecked()
  })

  it("Salvar começa desabilitado e libera só depois de marcar algo", async () => {
    mockAssignable()
    renderWithProviders(<PermissionsPanel userId="7" />)

    await screen.findByText("Pode aprovar orçamento")
    expect(screen.getByRole("button", { name: /salvar/i })).toBeDisabled()

    fireEvent.click(screen.getByRole("checkbox", { name: "Pode aprovar orçamento" }))
    expect(screen.getByRole("button", { name: /salvar/i })).not.toBeDisabled()
  })

  it("salva exatamente o conjunto marcado", async () => {
    mockAssignable()
    let body
    server.use(
      http.patch(`${API}/usuarios/7/permissoes/`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ assignable: [] })
      }),
    )
    renderWithProviders(<PermissionsPanel userId="7" />)

    fireEvent.click(await screen.findByRole("checkbox", { name: "Pode aprovar orçamento" }))
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }))

    await waitFor(() => expect(body).toEqual({ permissions: ["budgets.can_approve_budget"] }))
  })
})
