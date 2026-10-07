import { useProductCategories } from "@/modules/productcategory/hooks/useProductCategory"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function ProductCategoryList() {
  const {
    productCategories,
    loading,
    currentPage,
    setCurrentPage,
    totalItems,
    refetch,
    remove,
    error,
  } = useProductCategories()

  const columns = [
    { header: "Categoria", accessor: (item) => item.name },
    { header: "Ativa", accessor: (item) => (item.is_active ? "Sim" : "Não") },
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title="Categorias de Produto"
        buttonText="Nova Categoria"
        buttonLink="/categorias-produto/novo"
      />
      <ListTable
        columns={columns}
        data={productCategories}
        editLinkPrefix="/categorias-produto"
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
