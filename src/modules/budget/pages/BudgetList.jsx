import { useBudget } from "../hooks/useBudget"
import { BudgetService } from "../services/budgets"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function BudgetList() {
  const { 
    budgets, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage, 
    totalItems,
    load
  } = useBudget()

  const columns = [
    { header: 'ID', accessor: (item) => `#${item.id}` },
    { header: 'Cliente', accessor: (item) => item.first_name || item.client?.first_name || "N/A" },
    { header: 'Veículo', accessor: (item) => item.vehicle_name || `${item.vehicle?.model || ""} ${item.vehicle?.plate || ""}` },
    { header: 'Validade', accessor: (item) => new Date(item.valid_until).toLocaleDateString() },
    { header: 'Status', accessor: (item) => (
      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
        item.status === 'aprovado' ? 'bg-emerald-100 text-emerald-700' : 
        item.status === 'pendente' ? 'bg-amber-100 text-amber-700' : 
        'bg-slate-100 text-slate-700'
      }`}>
        {item.status}
      </span>
    )},
    { header: 'Total', accessor: (item) => `R$ ${parseFloat(item.total).toFixed(2)}` },
  ]

  const handleDelete = async (item) => {
    if (window.confirm(`Deseja excluir o orçamento #${item.id}?`)) {
      try {
        await BudgetService.deleteBudget(item.id)
        load(searchTerm, currentPage)
      } catch (error) {
        console.error(error)
        alert('Erro ao excluir o orçamento.')
      }
    }
  }

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title='Orçamentos'
        buttonText='Novo Orçamento'
        buttonLink='/orcamentos/novo'
      />
      <ListTable 
        columns={columns}
        data={budgets}
        editLinkPrefix="/orcamentos"
        onDelete={handleDelete}
        loading={loading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
        totalItems={totalItems}
      />
    </div>
  )
}
