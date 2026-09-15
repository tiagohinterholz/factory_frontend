import { usePermissions } from "@/modules/auth/hooks/usePermissions"

// Opções compartilhadas entre criar e editar usuário:
// - empreendimento nem aparece no form: é sempre o do próprio tenant
//   (implícito pelo token); superusuário não gerencia usuário por aqui.
// - perfis atribuíveis: só quem já é admin/superuser cria outros usuários,
//   e só superuser promove alguém a admin.
//
// `currentRole` (edição): o usuário sendo editado pode já ter um perfil que
// quem está editando não pode ATRIBUIR (ex.: admin comum abrindo outro
// admin) — nesse caso o perfil real ainda tem que aparecer selecionado no
// <select>, só que travado (`roleLocked`), em vez de cair vazio/errado por
// não ter <option> correspondente.
export function useUserFormOptions({ currentRole } = {}) {
  const { isSuperUser, canManageUsers } = usePermissions()

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
    roleOptions,
    roleLocked,
  }
}
