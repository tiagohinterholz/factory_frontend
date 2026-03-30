import { useProduct } from "../hooks/useProduct"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function ProductList() {
  const { product, loading } = useProduct()

  const columns = [
    { header: 'Produto', accessor: (item) => item.name },
    { header: 'Referência', accessor: (item) => item.reference },
    { header: 'Preço Venda', accessor: (item) => item.unit_price ? `R$ ${parseFloat(item.unit_price).toFixed(2).replace('.', ',')}` : 'R$ 0,00' },
  ]

  const handleDelete = (item) => {
    if (window.confirm(`Deseja excluir o produto ${item.name}?`)) {
      console.log('Excluindo...', item.id)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title='Produtos'
        buttonText='Novo Produto'
        buttonLink='/produtos/novo'
      />
      <ListTable 
        columns={columns}
        data={product}
        editLinkPrefix="/produtos"
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  )
}
