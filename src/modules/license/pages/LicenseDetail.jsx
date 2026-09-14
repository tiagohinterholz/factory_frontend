import { useParams } from "react-router-dom"
import BackLink from "@/modules/core/components/BackLink"
import { useLicenseById } from "@/modules/license/hooks/useLicenseById"
import { formatDate } from "@/modules/core/utils/format"
import { Briefcase } from "lucide-react"

const statusMap = {
  TRIAL: { label: "Em Teste", color: "text-amber-600 bg-amber-50" },
  ACTIVE: { label: "Ativa", color: "text-emerald-600 bg-emerald-50" },
  EXPIRED: { label: "Expirada", color: "text-danger bg-danger-subtle" },
}

// Só leitura — renovar por ID saiu do contrato (não tem endpoint
// substituto pro superusuário ainda). Cada negócio renova a própria
// licença em Configurações → Licença.
export default function LicenseDetail() {
  const { id } = useParams()
  const { license, loading } = useLicenseById(id)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const currentStatus = statusMap[license?.status] || {
    label: license?.status,
    color: "text-slate-400 bg-slate-50",
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <BackLink to="/licencas" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">
              Licença — {license?.business?.corporate_name}
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-slate-400 font-medium text-sm">Somente leitura</p>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${currentStatus.color}`}
              >
                {currentStatus.label}
              </span>
            </div>
          </div>
        </div>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Dados da Licença</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="label-premium">Período</p>
              <p className="text-sm font-medium text-ink">{license?.period}</p>
            </div>
            <div>
              <p className="label-premium">Limite de Usuários</p>
              <p className="text-sm font-medium text-ink">
                {license?.current_users}/{license?.max_users}
              </p>
            </div>
            <div>
              <p className="label-premium">Data de Ativação</p>
              <p className="text-sm font-medium text-ink">
                {formatDate(license?.activation_date) || "-"}
              </p>
            </div>
            <div>
              <p className="label-premium">Data de Expiração</p>
              <p className="text-sm font-medium text-ink">
                {formatDate(license?.expiration_date) || "-"}
              </p>
            </div>
            <div>
              <p className="label-premium">Dias Restantes</p>
              <p className="text-sm font-medium text-ink">{license?.remaining_days} dias</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
