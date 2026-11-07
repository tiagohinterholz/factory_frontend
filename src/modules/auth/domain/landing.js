export function landingPathFor(user) {
  const permissions = user?.permissions ?? []
  const isAdmin = !user?.business_id || user?.role === "admin"
  if (isAdmin || permissions.includes("orders.view_order")) return "/dashboard"
  if (permissions.includes("financial.view_financialentry")) return "/financeiro"
  if (
    permissions.includes("orders.view_fiscalnote") ||
    permissions.includes("orders.view_servicefiscalnote")
  ) {
    return "/notas-fiscais"
  }
  return "/dashboard"
}
