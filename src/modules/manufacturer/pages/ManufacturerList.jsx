import { useManufacturers } from "@/modules/manufacturer/hooks/useManufacturer"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function ManufacturerList() {
  const {
    manufacturers,
    loading,
    currentPage,
    setCurrentPage,
    totalItems,
    refetch,
    remove,
    error,
  } = useManufacturers()

  const columns = [
    { header: "Marca", accessor: (item) => item.name },
    { header: "Ativa", accessor: (item) => (item.is_active ? "Sim" : "Não") },
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader title="Marcas" buttonText="Nova Marca" buttonLink="/marcas/novo" />
      <ListTable
        columns={columns}
        data={manufacturers}
        editLinkPrefix="/marcas"
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
