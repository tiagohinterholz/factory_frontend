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
    // só o superusuário escolhe entre empreendimentos no formulário;
    // o usuário de um empreendimento fica preso ao próprio
    canChooseBusiness: isSuperUser,
    // admin gerencia usuários e a licença do próprio empreendimento
    canManageUsers: isAdmin,
    canManageLicenses: isAdmin,
    // exportar relatórios (backend: IsSuperUser | IsAdminUser)
    canExportReports: isAdmin,
  }
}
