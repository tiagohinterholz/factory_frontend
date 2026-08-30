import { useProduct } from "../hooks/useProduct"
import { ProductService } from "../services/product"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import { useToast } from "@/modules/core/feedback/toast-context"
import { useConfirm } from "@/modules/core/feedback/confirm-context"

export default function ProductList() {
  const { 
    product, 
    loading,
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage,
    totalItems,
    load,
    error
  } = useProduct()

  const toast = useToast()
  const confirm = useConfirm()

  const columns = [
    { header: 'Produto', accessor: (item) => item.name },
    { header: 'Referência', accessor: (item) => item.reference ? item.reference : '-' },
    { header: 'Preço Venda', accessor: (item) => item.unit_price ? `R$ ${parseFloat(item.unit_price).toFixed(2).replace('.', ',')}` : 'R$ 0,00' },
    { header : 'Qtde. em estoque', accessor: (item) => item.stock_quantity ? item.stock_quantity : '0'}
  ]

  const handleDelete = async (item) => {
    const confirmed = await confirm({
      title: "Excluir produto?",
      message: `"${item.name}" será removido permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return

    try {
      await ProductService.deleteProduct(item.id)
      load(searchTerm, currentPage)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir o produto.")
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
        error={error}
        onRetry={() => load(searchTerm, currentPage)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
        totalItems={totalItems}
      />
    </div>
  )
}
