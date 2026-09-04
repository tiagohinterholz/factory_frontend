import { Link } from "react-router-dom"
import { Edit2, Trash2 } from "lucide-react"
import { useProduct } from "../hooks/useProduct"
import { useSupplierOptions } from "@/modules/core/hooks/options"
import { ProductService } from "@/modules/product/services/product"
import ListHeader from "@/modules/core/components/ListHeader"
import ExportReportButton from "@/modules/core/components/ExportReportButton"
import ListTable from "@/modules/core/components/ListTable"
import SelectField from "@/modules/core/components/SelectField"
import PdfIconButton from "@/modules/core/components/PdfIconButton"
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
    refetch,
    remove,
    error,
    supplierId,
    setSupplierId,
  } = useProduct()

  const toast = useToast()
  const confirm = useConfirm()
  const { supplier: suppliers } = useSupplierOptions()
  const supplierOptions = suppliers.map((s) => ({ id: s.id, name: s.corporate_name }))

  const columns = [
    { header: "Produto", accessor: (item) => item.name },
    { header: "Referência", accessor: (item) => (item.reference ? item.reference : "-") },
    {
      header: "Preço Venda",
      accessor: (item) =>
        item.unit_price
          ? `R$ ${parseFloat(item.unit_price).toFixed(2).replace(".", ",")}`
          : "R$ 0,00",
    },
    {
      header: "Qtde. em estoque",
      accessor: (item) => (item.stock_quantity ? item.stock_quantity : "0"),
    },
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
      await remove(item.id)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir o produto.")
    }
  }

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title="Produtos"
        buttonText="Novo Produto"
        buttonLink="/produtos/novo"
        actions={<ExportReportButton type="stock" />}
      />

      <div className="max-w-xs">
        <SelectField
          label="Filtrar por fornecedor"
          options={supplierOptions}
          value={supplierId}
          onChange={(event) => {
            setSupplierId(event.target.value)
            setCurrentPage(1)
          }}
        />
      </div>

      <ListTable
        columns={columns}
        data={product}
        loading={loading}
        error={error}
        onRetry={refetch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
        totalItems={totalItems}
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
              onClick={() => handleDelete(item)}
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
