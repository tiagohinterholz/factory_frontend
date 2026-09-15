import { useUser } from "../hooks/useUser"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

// Lista os usuários do próprio negócio (/configuracoes/usuarios/, self —
// sem business_id na URL). Sem coluna de Empreendimento: toda a lista já é
// de um negócio só, mostrar isso em cada linha seria redundante.
export default function UserList() {
  const { user, loading, currentPage, setCurrentPage, remove, totalItems, refetch, error } =
    useUser()
  const { isSuperUser } = usePermissions()

  const columns = [
    { header: "Nome", accessor: (item) => item.name },
    { header: "Email", accessor: (item) => item.email },
    { header: "Perfil", accessor: (item) => item.role },
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title="Usuários"
        buttonText={isSuperUser ? undefined : "Novo Usuário"}
        buttonLink={isSuperUser ? undefined : "/usuarios/novo"}
      />
      <ListTable
        columns={columns}
        data={user}
        editLinkPrefix="/usuarios"
        onDelete={remove}
        loading={loading}
        error={error}
        onRetry={refetch}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
        totalItems={totalItems}
      />
    </div>
  )
}
