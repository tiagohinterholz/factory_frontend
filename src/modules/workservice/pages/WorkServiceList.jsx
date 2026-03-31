import { useWorkService } from "../hooks/useWorkService"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function WorkServiceList() {
  const { workservice, loading } = useWorkService()

  const columns = [
    { header: 'Serviço', accessor: (item) => item.name },
    { header: 'Referência', accessor: (item) => item.reference ? item.reference : '-' },
    { header: 'Preço Venda', accessor: (item) => item.unit_price ? `R$ ${parseFloat(item.unit_price).toFixed(2).replace('.', ',')}` : 'R$ 0,00' },
  ]

  const handleDelete = (item) => {
    if (window.confirm(`Deseja excluir o serviço ${item.name}?`)) {
      console.log('Excluindo...', item.id)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title='Serviços'
        buttonText='Novo Serviço'
        buttonLink='/servicos/novo'
      />
      <ListTable 
        columns={columns}
        data={workservice}
        editLinkPrefix="/servicos"
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  )
}
