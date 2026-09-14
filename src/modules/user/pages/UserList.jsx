import { useUser } from "../hooks/useUser"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

// Lista os usuários do próprio negócio (/configuracoes/usuarios/, self —
// sem business_id na URL). Sem coluna de Empreendimento: toda a lista já é
// de um negócio só, mostrar isso em cada linha seria redundante.
export default function UserList() {
  const { user, loading, currentPage, setCurrentPage, remove, totalItems, refetch, error } =
    useUser()

  const columns = [
    { header: "Nome", accessor: (item) => item.name },
    { header: "Email", accessor: (item) => item.email },
    { header: "Perfil", accessor: (item) => item.role },
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader title="Usuários" buttonText="Novo Usuário" buttonLink="/usuarios/novo" />
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
