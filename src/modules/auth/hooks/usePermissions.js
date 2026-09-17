import { useAuth } from "@/modules/auth/context/auth-context"

// Decisões de permissão derivadas do usuário logado. As telas consultam isto
// em vez de reinterpretar `role` cru — é o ponto único que evolui quando o
// backend muda quem pode o quê, sem precisar caçar `isAdmin` espalhado.
//
// `permissions` vem pronto do login (CustomTokenObtainPairSerializer manda
// `user.get_all_permissions()`) — o front só consulta a lista, nunca
// adivinha por `role`. Senão, no dia que alguém ganhar uma permissão extra
// além do grupo padrão (tela de gestão de permissão, ainda não existe), o
// front continuaria escondendo o botão sem motivo.
export function usePermissions() {
  const { user, isSuperUser, businessId } = useAuth()

  const permissions = user?.permissions ?? []
  // admin do próprio empreendimento (ou superusuário, que é admin de todos)
  const isAdmin = isSuperUser || user?.role === "admin"
  // admin sempre tem tudo (no backend, o grupo Administrador tem toda
  // permissão do sistema) — soma isso à checagem em vez de depender só da
  // lista, senão qualquer lugar que monte um usuário administrador de
  // mentirinha sem essa lista (teste, por exemplo) perderia acesso à toa.
  const has = (codename) => isAdmin || permissions.includes(codename)

  return {
    isSuperUser,
    isAdmin,
    businessId,
    // pra achar o próprio registro em /usuarios/<id>/ — atendente não
    // gerencia outros usuários, mas edita o próprio (nome, senha)
    userId: user?.user_id ?? null,
    canManageUsers: has("users.can_manage_users"),
    canManageLicenses: has("businesses.can_renew_license"),
    canExportReports: has("core.can_export_reports"),
    canManageFinancial: has("financial.view_financialentry"),
    canManagePurchases: has("purchases.view_purchaseorder"),
    canEmitFiscalNote: has("orders.can_emit_fiscal_note"),
    canManageBusiness: has("businesses.change_business"),
    canAnonymizeClient: has("customers.can_anonymize_client"),
  }
}
