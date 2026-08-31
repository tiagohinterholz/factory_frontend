import { useAuth } from "@/modules/auth/context/auth-context"

// Decisões de permissão derivadas do usuário logado. As telas consultam isto
// em vez de reinterpretar `isSuperUser` cru — é o ponto único pra evoluir quando
// surgirem papéis mais finos (gerente, operador, etc).
export function usePermissions() {
  const { isSuperUser, businessId } = useAuth()

  return {
    isSuperUser,
    businessId,
    // superusuário escolhe o empreendimento no formulário; o usuário de um
    // empreendimento fica sempre preso ao próprio.
    canChooseBusiness: isSuperUser,
    canManageLicenses: isSuperUser,
    canManageUsers: isSuperUser,
  }
}
