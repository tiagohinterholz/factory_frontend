import { CertificatePanel } from "@/modules/business"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"

export default function CertificateSettings() {
  const { canManageBusiness } = usePermissions()

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">
            Certificado digital
          </h1>
          <p className="text-slate-400 font-medium text-sm">
            Assina as notas fiscais (NF-e e NFS-e) emitidas pelo seu empreendimento
          </p>
        </div>

        <div className="card-premium">
          <CertificatePanel canManage={canManageBusiness} />
        </div>
      </div>
    </div>
  )
}
