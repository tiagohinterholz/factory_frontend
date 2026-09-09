import { useSupplier } from "../hooks/useSupplier"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import ListFilters from "@/modules/core/components/ListFilters"

const FILTER_FIELDS = [
  { name: "corporate_name", label: "Razão social", type: "text" },
  { name: "cnpj", label: "CNPJ", type: "text" },
]

export default function SupplierList() {
  const {
    supplier,
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
  } = useSupplier()

  const columns = [
    { header: "Razão Social", sortKey: "corporate_name", accessor: (item) => item.corporate_name },
    { header: "CNPJ", sortKey: "cnpj", accessor: (item) => item.cnpj },
    { header: "Telefone", accessor: (item) => item.phone },
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title="Fornecedores"
        buttonText="Novo Fornecedor"
        buttonLink="/fornecedores/novo"
        actions={<ListFilters fields={FILTER_FIELDS} value={filters} onApply={applyFilters} />}
      />
      <ListTable
        columns={columns}
        data={supplier}
        editLinkPrefix="/fornecedores"
        onDelete={remove}
        loading={loading}
        error={error}
        onRetry={refetch}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
        totalItems={totalItems}
        ordering={ordering}
        onSort={toggleSort}
      />
    </div>
  )
}
