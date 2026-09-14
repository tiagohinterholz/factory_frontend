import { useAuth } from "@/modules/auth/context/auth-context"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import { useBusinessOptions } from "@/modules/core/hooks/options"

// Opções compartilhadas entre criar e editar usuário:
// - só o superuser escolhe o empreendimento num <select>; admin/colaborador
//   ficam presos ao próprio (nome vem do form, ver useUserEditForm).
// - perfis atribuíveis: só quem já é admin/superuser cria outros usuários,
//   e só superuser promove alguém a admin.
//
// `currentRole` (edição): o usuário sendo editado pode já ter um perfil que
// quem está editando não pode ATRIBUIR (ex.: admin comum abrindo outro
// admin) — nesse caso o perfil real ainda tem que aparecer selecionado no
// <select>, só que travado (`roleLocked`), em vez de cair vazio/errado por
// não ter <option> correspondente.
export function useUserFormOptions({ currentRole } = {}) {
  const { businessId } = useAuth()
  const { isSuperUser, canManageUsers } = usePermissions()
  const { business: businesses, loading: loadingBusinesses } = useBusinessOptions()

  const businessOptions = (businesses ?? []).map((b) => ({ id: b.id, name: b.corporate_name }))
  const currentBusinessName =
    businesses.find((b) => String(b.id) === String(businessId))?.corporate_name ?? ""

  const assignableRoles = canManageUsers
    ? [
        ...(isSuperUser ? [{ id: "admin", name: "Administrador" }] : []),
        { id: "colaborador", name: "Colaborador" },
      ]
    : []

  const roleLocked =
    Boolean(currentRole) && !assignableRoles.some((option) => option.id === currentRole)
  const roleOptions = roleLocked
    ? [
        ...assignableRoles,
        { id: currentRole, name: currentRole === "admin" ? "Administrador" : currentRole },
      ]
    : assignableRoles

  return {
    isSuperUser,
    businessOptions,
    currentBusinessName,
    loadingBusinesses,
    roleOptions,
    roleLocked,
  }
}
