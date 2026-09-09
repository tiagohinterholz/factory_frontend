import { Link } from "react-router-dom"
import { Edit2, Trash2 } from "lucide-react"
import { useProduct } from "../hooks/useProduct"
import { useSupplierOptions } from "@/modules/core/hooks/options"
import { ProductService } from "@/modules/product/services/product"
import ListHeader from "@/modules/core/components/ListHeader"
import ExportReportButton from "@/modules/core/components/ExportReportButton"
import ListTable from "@/modules/core/components/ListTable"
import ListFilters from "@/modules/core/components/ListFilters"
import PdfIconButton from "@/modules/core/components/PdfIconButton"

export default function ProductList() {
  const {
    product,
    loading,
    filters,
    applyFilters,
    ordering,
    toggleSort,
    currentPage,
    setCurrentPage,
    totalItems,
    refetch,
    remove,
    error,
  } = useProduct()

  const { supplier: suppliers } = useSupplierOptions()

  const filterFields = [
    { name: "name", label: "Nome", type: "text" },
    { name: "reference", label: "Referência", type: "text" },
    {
      name: "supplier_id",
      label: "Fornecedor",
      type: "select",
      options: suppliers.map((s) => ({ id: s.id, name: s.corporate_name })),
    },
  ]

  const columns = [
    { header: "Produto", sortKey: "name", accessor: (item) => item.name },
    {
      header: "Referência",
      sortKey: "reference",
      accessor: (item) => (item.reference ? item.reference : "-"),
    },
    {
      header: "Preço Venda",
      sortKey: "unit_price",
      accessor: (item) =>
        item.unit_price
          ? `R$ ${parseFloat(item.unit_price).toFixed(2).replace(".", ",")}`
          : "R$ 0,00",
    },
    {
      header: "Qtde. em estoque",
      sortKey: "stock_quantity",
      accessor: (item) => (item.stock_quantity ? item.stock_quantity : "0"),
    },
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title="Produtos"
        buttonText="Novo Produto"
        buttonLink="/produtos/novo"
        actions={
          <div className="flex items-center gap-2">
            <ListFilters fields={filterFields} value={filters} onApply={applyFilters} />
            <ExportReportButton type="stock" />
          </div>
        }
      />

      <ListTable
        columns={columns}
        data={product}
        loading={loading}
        error={error}
        onRetry={refetch}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
        totalItems={totalItems}
        ordering={ordering}
        onSort={toggleSort}
        renderActions={(item) => (
          <div className="flex items-center justify-end gap-1">
            <PdfIconButton
              request={() => ProductService.getProductPdf(item.id)}
              title="Baixar PDF do produto"
            />
            <Link
              to={`/produtos/${item.id}`}
              className="p-1.5 text-brand hover:bg-brand-subtle rounded transition-colors"
            >
              <Edit2 size={16} />
            </Link>
            <button
              type="button"
              onClick={() => remove(item)}
              className="p-1.5 text-danger hover:bg-danger-subtle rounded transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      />
    </div>
  )
}
