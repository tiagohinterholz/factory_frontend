import { RefreshCw, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useLicense } from "../hooks/useLicense"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function LicenseList() {
  const navigate = useNavigate()
  const { license, loading } = useLicense()

  const columns = [
    { header: 'Razão Social', accessor: (item) => item.business.corporate_name },
    { header: 'Status', accessor: (item) => {
      const statusMap = {
        'TRIAL': { label: 'Em Teste', color: 'bg-amber-50 text-amber-600' },
        'ACTIVE': { label: 'Ativo', color: 'bg-emerald-50 text-emerald-600' },
        'EXPIRED': { label: 'Expirado', color: 'bg-rose-50 text-rose-600' }
      }
      const config = statusMap[item.status] || { label: item.status, color: 'bg-slate-50 text-slate-400' }
      return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${config.color}`}>
            {config.label}
        </span>
      )
    }},
    { header: 'Data de Expiração', accessor: (item) => item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : '-' },
    { header: 'Dias Restantes', accessor: (item) => (
       <div className="flex flex-col">
          <span className={`font-bold ${item.remaining_days < 5 ? 'text-rose-500' : 'text-slate-700'}`}>
              {item.remaining_days} dias
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Usuários: {item.current_users}/{item.max_users}</span>
       </div>
    )},
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title='Gestão de Licenças'
        buttonText='Nova Configuração'
        buttonLink='/empreendimentos/licencas/novo'
      />
      <ListTable 
        columns={columns}
        data={license}
        loading={loading}
        renderActions={(item) => (
          <button 
            onClick={() => navigate(`/empreendimentos/licencas/${item.id}`)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all duration-300 font-bold text-[10px] uppercase tracking-wider"
          >
            <RefreshCw size={14} className="animate-hover-spin" />
            Configurar / Renovar
          </button>
        )}
      />
    </div>
  )
}
