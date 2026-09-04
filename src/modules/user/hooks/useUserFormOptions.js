import { useAuth } from "@/modules/auth/context/auth-context"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import { useBusinessOptions } from "@/modules/core/hooks/options"

// Opções compartilhadas entre criar e editar usuário:
// - só o superuser escolhe o empreendimento num <select>; admin/colaborador
//   ficam presos ao próprio, e aqui resolvemos o nome dele pra exibir
//   (o usuário logado só tem `business_id` cru, sem o nome — precisa achar
//   no mesmo /empreendimentos/ que alimenta o dropdown do superuser).
// - perfis disponíveis: só quem já é admin/superuser cria outros usuários.
export function useUserFormOptions() {
  const { user: loggedUser, businessId } = useAuth()
  const { isSuperUser } = usePermissions()
  const { business: businesses, loading: loadingBusinesses } = useBusinessOptions()

  const businessOptions = (businesses ?? []).map((b) => ({ id: b.id, name: b.corporate_name }))
  const currentBusinessName =
    businesses.find((b) => String(b.id) === String(businessId))?.corporate_name ?? ""

  const canManageUsers = isSuperUser || loggedUser?.role === "admin"
  const roleOptions = canManageUsers
    ? [
        ...(isSuperUser ? [{ id: "admin", name: "Administrador" }] : []),
        { id: "colaborador", name: "Colaborador" },
      ]
    : []

  return { isSuperUser, businessOptions, currentBusinessName, loadingBusinesses, roleOptions }
}
