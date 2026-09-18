import { Link } from "react-router-dom"
import { useProductSubcategories } from "@/modules/productsubcategory/hooks/useProductSubcategory"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function ProductSubcategoryList() {
  const {
    productSubcategories,
    loading,
    currentPage,
    setCurrentPage,
    totalItems,
    refetch,
    remove,
    error,
  } = useProductSubcategories()

  const columns = [
    { header: "Subcategoria", accessor: (item) => item.name },
    {
      header: "Categoria",
      accessor: (item) => (
        <Link to={`/categorias-produto/${item.category.id}`} className="text-brand hover:underline">
          {item.category.name}
        </Link>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title="Subcategorias de Produto"
        buttonText="Nova Subcategoria"
        buttonLink="/subcategorias-produto/novo"
      />
      <ListTable
        columns={columns}
        data={productSubcategories}
        editLinkPrefix="/subcategorias-produto"
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
