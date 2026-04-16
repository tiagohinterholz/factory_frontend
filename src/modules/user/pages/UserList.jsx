import { useUser } from "../hooks/useUser"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function UserList() {
  const { 
    user, 
    loading,
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage,
    handleDelete: removeUser,
    totalItems 
  } = useUser()

  const columns = [
    { header: 'Nome', accessor: (item) => item.name },
    { header: 'Email', accessor: (item) => item.email },
    { header: 'Perfil', accessor: (item) => item.role },
    { header: 'Empreendimento', accessor: (item) => item.business?.corporate_name || '-' },
  ]

  const handleDelete = async (item) => {
    if (window.confirm(`Deseja realmente excluir o usuário ${item.name}?`)) {
      await removeUser(item.id)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title='Usuários'
        buttonText='Novo Usuário'
        buttonLink='/usuarios/novo'
      />
      <ListTable 
        columns={columns}
        data={user}
        editLinkPrefix="/usuarios"
        onDelete={handleDelete}
        loading={loading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
        totalItems={totalItems}
      />
    </div>
  )
}
