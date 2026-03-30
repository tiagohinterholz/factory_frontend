import { useSupplier } from "../hooks/useSupplier"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function SupplierList() {
  const { supplier, loading } = useSupplier()

  const columns = [
    { header: 'Razão Social', accessor: (item) => item.corporate_name },
    { header: 'CNPJ', accessor: (item) => item.cnpj },
    { header: 'Telefone', accessor: (item) => item.phone },
  ]

  const handleDelete = (item) => {
    if (window.confirm(`Deseja excluir o fornecedor ${item.corporate_name}?`)) {
      console.log('Excluindo...', item.id)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title='Fornecedores'
        buttonText='Novo Fornecedor'
        buttonLink='/fornecedores/novo'
      />
      <ListTable 
        columns={columns}
        data={supplier}
        editLinkPrefix="/fornecedores"
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  )
}
