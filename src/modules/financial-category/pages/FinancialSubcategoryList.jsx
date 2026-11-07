import { Link } from "react-router-dom"
import { useFinancialSubcategories } from "@/modules/financial-category/hooks/useFinancialCategories"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function FinancialSubcategoryList() {
  const {
    subcategories,
    loading,
    currentPage,
    setCurrentPage,
    totalItems,
    refetch,
    remove,
    error,
  } = useFinancialSubcategories()

  const columns = [
    { header: "Subcategoria", accessor: (item) => item.name },
    {
      header: "Categoria",
      accessor: (item) => (
        <Link
          to={`/financeiro/categorias/${item.category.id}`}
          className="text-brand hover:underline"
        >
          {item.category.name}
        </Link>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title="Subcategorias Financeiras"
        buttonText="Nova Subcategoria"
        buttonLink="/subcategorias-financeiro/novo"
      />
      <ListTable
        columns={columns}
        data={subcategories}
        editLinkPrefix="/subcategorias-financeiro"
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
