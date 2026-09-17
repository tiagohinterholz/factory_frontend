import { Link } from "react-router-dom"
import { Edit2, PackageCheck, XCircle } from "lucide-react"
import { usePurchaseOrder } from "../hooks/usePurchaseOrder"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import ListFilters from "@/modules/core/components/ListFilters"
import { useSupplierOptions } from "@/modules/core/hooks/options"
import { formatDate, formatMoney } from "@/modules/core/utils/format"
import { purchaseOrderStatusTone, purchaseOrderIsOpen } from "../domain"

const STATUS_OPTIONS = [
  { id: "aberto", name: "Aberto" },
  { id: "recebido", name: "Recebido" },
  { id: "cancelado", name: "Cancelado" },
]

export default function PurchaseOrderList() {
  const {
    purchaseOrders,
    loading,
    filters,
    applyFilters,
    ordering,
    toggleSort,
    currentPage,
    setCurrentPage,
    totalItems,
    refetch,
    receive,
    cancel,
    error,
  } = usePurchaseOrder()

  const { supplier: suppliers } = useSupplierOptions()

  const filterFields = [
    { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
    {
      name: "supplier_id",
      label: "Fornecedor",
      type: "select",
      options: suppliers.map((s) => ({ id: s.id, name: s.corporate_name })),
    },
  ]

  const columns = [
    { header: "ID", accessor: (item) => `#${item.id}` },
    {
      header: "Fornecedor",
      accessor: (item) =>
        item.supplier ? (
          <Link to={`/fornecedores/${item.supplier.id}`} className="text-brand hover:underline">
            {item.supplier.corporate_name}
          </Link>
        ) : (
          "-"
        ),
    },
    {
      header: "Criado em",
      sortKey: "created_at",
      accessor: (item) => formatDate(item.created_at),
    },
    {
      header: "Status",
      sortKey: "status",
      accessor: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${purchaseOrderStatusTone(item.status)}`}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: "Total",
      sortKey: "total",
      accessor: (item) => formatMoney(item.total),
    },
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title="Compras"
        buttonText="Novo Pedido de Compra"
        buttonLink="/compras/novo"
        actions={<ListFilters fields={filterFields} value={filters} onApply={applyFilters} />}
      />
      <ListTable
        dense
        columns={columns}
        data={purchaseOrders}
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
            {purchaseOrderIsOpen(item.status) && (
              <>
                <button
                  type="button"
                  onClick={() => receive(item)}
                  disabled={!item.items?.length}
                  title={
                    item.items?.length
                      ? "Receber pedido de compra"
                      : "Adicione ao menos um item primeiro"
                  }
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  <PackageCheck size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => cancel(item)}
                  title="Cancelar pedido de compra"
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                >
                  <XCircle size={16} />
                </button>
              </>
            )}
            <Link
              to={`/compras/${item.id}`}
              className="p-1.5 text-brand hover:bg-brand-subtle rounded transition-colors"
            >
              <Edit2 size={16} />
            </Link>
          </div>
        )}
      />
    </div>
  )
}
