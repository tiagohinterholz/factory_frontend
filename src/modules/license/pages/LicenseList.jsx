import { useNavigate } from "react-router-dom"
import { Eye } from "lucide-react"
import { useLicenses } from "../hooks/useLicenses"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import { formatDate } from "@/modules/core/utils/format"

// Só leitura, só pro superusuário navegar licenças de outros negócios —
// renovar por ID saiu do contrato (não tem endpoint substituto ainda).
export default function LicenseList() {
  const navigate = useNavigate()
  const { licenses, loading, error, refetch, currentPage, setCurrentPage, totalItems } =
    useLicenses()

  const columns = [
    { header: "Razão Social", accessor: (item) => item.business?.corporate_name },
    {
      header: "Status",
      accessor: (item) => {
        const statusMap = {
          TRIAL: { label: "Em Teste", color: "bg-amber-50 text-amber-600" },
          ACTIVE: { label: "Ativo", color: "bg-emerald-50 text-emerald-600" },
          EXPIRED: { label: "Expirado", color: "bg-danger-subtle text-danger" },
        }
        const config = statusMap[item.status] || {
          label: item.status,
          color: "bg-slate-50 text-slate-400",
        }
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${config.color}`}
          >
            {config.label}
          </span>
        )
      },
    },
    {
      header: "Data de Ativação",
      accessor: (item) => formatDate(item.activation_date) || "-",
    },
    {
      header: "Data de Expiração",
      accessor: (item) => formatDate(item.expiration_date) || "-",
    },
    {
      header: "Dias Restantes",
      accessor: (item) => (
        <div className="flex flex-col">
          <span
            className={`font-bold ${item.remaining_days < 5 ? "text-danger" : "text-slate-700"}`}
          >
            {item.remaining_days} dias
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Usuários: {item.current_users}/{item.max_users}
          </span>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader title="Licenças" subtitle="Licenças dos empreendimentos — somente leitura" />
      <ListTable
        columns={columns}
        data={licenses}
        loading={loading}
        error={error}
        onRetry={refetch}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
        totalItems={totalItems}
        renderActions={(item) => (
          <button
            onClick={() => navigate(`/licencas/${item.id}`)}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand-subtle text-brand hover:bg-brand hover:text-white rounded-lg transition-all duration-300 font-bold text-[10px] uppercase tracking-wider"
          >
            <Eye size={14} />
            Ver
          </button>
        )}
      />
    </div>
  )
}
