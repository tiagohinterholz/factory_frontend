import { useAuth } from "@/modules/auth/context/auth-context"

// Decisões de permissão derivadas do usuário logado. As telas consultam isto
// em vez de reinterpretar `isSuperUser` / `role` crus — é o ponto único pra
// evoluir quando o backend granularizar os papéis.
export function usePermissions() {
  const { user, isSuperUser, businessId } = useAuth()

  // admin do próprio empreendimento (ou superusuário, que é admin de todos)
  const isAdmin = isSuperUser || user?.role === "admin"

  return {
    isSuperUser,
    isAdmin,
    businessId,
    // pra achar o próprio registro em /usuarios/<id>/ — colaborador não
    // gerencia outros usuários, mas edita o próprio (nome, senha)
    userId: user?.user_id ?? null,
    // admin gerencia usuários e a licença do próprio empreendimento
    canManageUsers: isAdmin,
    canManageLicenses: isAdmin,
    // exportar relatórios (backend: IsSuperUser | IsAdminUser)
    canExportReports: isAdmin,
    // financeiro é dado sensível — colaborador nem vê (backend: IsSuperUser | IsAdminUser)
    canManageFinancial: isAdmin,
  }
}
