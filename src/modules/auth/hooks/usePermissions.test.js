import { describe, it, expect } from "vitest"
import { renderHook } from "@testing-library/react"
import { AuthProvider } from "@/modules/auth/context/AuthProvider"
import { usePermissions } from "./usePermissions"

const wrapper = AuthProvider

function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user))
}

describe("usePermissions", () => {
  it("admin (role) tem tudo mesmo sem lista de permissions vinda do back", () => {
    setUser({ email: "a@a.com", business_id: 3, role: "admin" })
    const { result } = renderHook(() => usePermissions(), { wrapper })

    expect(result.current.isAdmin).toBe(true)
    expect(result.current.canManageFinancial).toBe(true)
    expect(result.current.canManagePurchases).toBe(true)
    expect(result.current.canExportReports).toBe(true)
    expect(result.current.canEmitFiscalNote).toBe(true)
    expect(result.current.canEmitServiceFiscalNote).toBe(true)
  })

  it("superusuário (sem business_id) também tem tudo", () => {
    setUser({ email: "root@a.com", role: "admin" })
    const { result } = renderHook(() => usePermissions(), { wrapper })

    expect(result.current.isSuperUser).toBe(true)
    expect(result.current.canManageUsers).toBe(true)
  })

  it("financeiro só tem o que a lista de permissions do back diz", () => {
    setUser({
      email: "fin@a.com",
      business_id: 5,
      role: "financeiro",
      permissions: ["financial.view_financialentry", "core.can_export_reports"],
    })
    const { result } = renderHook(() => usePermissions(), { wrapper })

    expect(result.current.isAdmin).toBe(false)
    expect(result.current.canManageFinancial).toBe(true)
    expect(result.current.canExportReports).toBe(true)
    expect(result.current.canManagePurchases).toBe(false)
    expect(result.current.canEmitFiscalNote).toBe(false)
    expect(result.current.canEmitServiceFiscalNote).toBe(false)
  })

  it("gerente vê financeiro/relatório/NF-e mas não compras", () => {
    setUser({
      email: "ger@a.com",
      business_id: 5,
      role: "gerente",
      permissions: [
        "financial.view_financialentry",
        "core.can_export_reports",
        "orders.can_emit_fiscal_note",
      ],
    })
    const { result } = renderHook(() => usePermissions(), { wrapper })

    expect(result.current.canManageFinancial).toBe(true)
    expect(result.current.canExportReports).toBe(true)
    expect(result.current.canEmitFiscalNote).toBe(true)
    expect(result.current.canEmitServiceFiscalNote).toBe(false)
    expect(result.current.canManagePurchases).toBe(false)
  })

  it("atendente sem permissions extra não vê nada disso", () => {
    setUser({ email: "at@a.com", business_id: 5, role: "atendente", permissions: [] })
    const { result } = renderHook(() => usePermissions(), { wrapper })

    expect(result.current.canManageFinancial).toBe(false)
    expect(result.current.canExportReports).toBe(false)
    expect(result.current.canEmitFiscalNote).toBe(false)
    expect(result.current.canEmitServiceFiscalNote).toBe(false)
    expect(result.current.canManagePurchases).toBe(false)
    expect(result.current.canManageUsers).toBe(false)
  })

  it("contador só vê notas fiscais e financeiro, sem nenhuma tela operacional", () => {
    setUser({
      email: "cont@a.com",
      business_id: 5,
      role: "contador",
      permissions: [
        "orders.view_fiscalnote",
        "orders.view_servicefiscalnote",
        "financial.view_financialentry",
        "core.can_export_reports",
      ],
    })
    const { result } = renderHook(() => usePermissions(), { wrapper })

    expect(result.current.canViewFiscalNotes).toBe(true)
    expect(result.current.canViewFinancial).toBe(true)
    expect(result.current.canExportReports).toBe(true)
    expect(result.current.canViewClients).toBe(false)
    expect(result.current.canViewAppointments).toBe(false)
    expect(result.current.canViewVehicles).toBe(false)
    expect(result.current.canViewLocations).toBe(false)
    expect(result.current.canViewSupplies).toBe(false)
    expect(result.current.canViewBudgets).toBe(false)
    expect(result.current.canViewOrders).toBe(false)
    expect(result.current.canViewBusiness).toBe(false)
    expect(result.current.canEmitFiscalNote).toBe(false)
    expect(result.current.canEmitServiceFiscalNote).toBe(false)
  })

  it("só a permissão de NFS-e já libera ver notas fiscais", () => {
    setUser({
      email: "x@a.com",
      business_id: 5,
      role: "gerente",
      permissions: ["orders.view_servicefiscalnote"],
    })
    const { result } = renderHook(() => usePermissions(), { wrapper })

    expect(result.current.canViewFiscalNotes).toBe(true)
  })
})
