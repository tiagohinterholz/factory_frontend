import { useOrder } from "../hooks/useOrder"
import { deleteOrder } from "../services/orders"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function OrderList() {
  const { 
    orders, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage, 
    totalItems,
    load
  } = useOrder()

  const columns = [
    { header: 'ID', accessor: (item) => `#${item.id}` },
    { header: 'Cliente', accessor: (item) => item.first_name || item.client?.first_name || "N/A" },
    { header: 'Veículo', accessor: (item) => item.vehicle_name || `${item.vehicle?.model || ""} ${item.vehicle?.plate || ""}` },
    { header: 'Data Serviço', accessor: (item) => item.service_date ? new Date(item.service_date + 'T12:00:00').toLocaleDateString('pt-BR') : 'N/A' },
    { header: 'Status', accessor: (item) => (
      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
        item.status === 'faturado' ? 'bg-emerald-100 text-emerald-700' : 
        item.status === 'a faturar' ? 'bg-indigo-100 text-indigo-700' : 
        'bg-slate-100 text-slate-700'
      }`}>
        {item.status}
      </span>
    )},
    { header: 'Total', accessor: (item) => `R$ ${parseFloat(item.total).toFixed(2)}` },
  ]

  const handleDelete = async (item) => {
    if (window.confirm(`Deseja excluir a ordem de serviço #${item.id}?`)) {
      try {
        await deleteOrder(item.id)
        load(searchTerm, currentPage)
      } catch (error) {
        console.error(error)
        alert('Erro ao excluir a ordem de serviço.')
      }
    }
  }

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title='Ordens de Serviço'
        buttonText='Nova OS'
        buttonLink='/ordens/novo'
      />
      <ListTable 
        columns={columns}
        data={orders}
        editLinkPrefix="/ordens"
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
