import { useFinancialCategories } from "../hooks/useFinancialCategories"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"

export default function FinancialCategoryList() {
  const { categories, loading, currentPage, setCurrentPage, totalItems, refetch, remove, error } =
    useFinancialCategories()
  const { canManageFinancialCategories } = usePermissions()

  const columns = [
    {
      header: "Categoria",
      accessor: (item) => (
        <span className="flex items-center gap-2">
          {item.name}
          {item.is_system && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
              Sistema
            </span>
          )}
        </span>
      ),
    },
    { header: "Ativa", accessor: (item) => (item.is_active ? "Sim" : "Não") },
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title="Categorias Financeiras"
        buttonText={canManageFinancialCategories ? "Nova Categoria" : undefined}
        buttonLink={canManageFinancialCategories ? "/financeiro/categorias/novo" : undefined}
      />
      <ListTable
        columns={columns}
        data={categories}
        editLinkPrefix="/financeiro/categorias"
        onDelete={canManageFinancialCategories ? remove : undefined}
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
