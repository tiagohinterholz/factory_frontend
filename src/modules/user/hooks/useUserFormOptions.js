import { usePermissions } from "@/modules/auth/hooks/usePermissions"

// Rótulo de cada papel operacional (RBAC — item 3, fase 1) — "Colaborador"
// morreu como papel genérico, viraram estes 4 (ver permissoes.local.md).
export const ROLE_LABELS = {
  admin: "Administrador",
  atendente: "Atendente",
  mecanico: "Mecânico",
  gerente: "Gerente",
  financeiro: "Financeiro",
}

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
        { id: "atendente", name: "Atendente" },
        { id: "mecanico", name: "Mecânico" },
        { id: "gerente", name: "Gerente" },
        { id: "financeiro", name: "Financeiro" },
      ]
    : []

  const roleLocked =
    Boolean(currentRole) && !assignableRoles.some((option) => option.id === currentRole)
  const roleOptions = roleLocked
    ? [...assignableRoles, { id: currentRole, name: ROLE_LABELS[currentRole] || currentRole }]
    : assignableRoles

  return {
    isSuperUser,
    roleOptions,
    roleLocked,
  }
}
