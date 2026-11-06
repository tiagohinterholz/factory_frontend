import { Link } from "react-router-dom"
import { TriangleAlert } from "lucide-react"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import { useBusinessCertificate } from "@/modules/business/hooks/useBusinessCertificate"
import { formatDate } from "@/modules/core/utils/format"

export default function CertificateExpiryBanner() {
  const { canManageBusiness, businessId } = usePermissions()
  const enabled = canManageBusiness && Boolean(businessId)
  const { certificate } = useBusinessCertificate({ enabled })

  if (!enabled || !certificate?.installed) return null

  const expiryDate = formatDate(certificate.valid_until)
  let message
  if (certificate.status === "expired") {
    message = `O certificado digital da empresa venceu em ${expiryDate}. A emissão de notas fiscais está bloqueada.`
  } else if (certificate.status === "expiring") {
    message = `O certificado digital da empresa vence em ${expiryDate}.`
  } else {
    return null
  }

  const tone =
    certificate.status === "expired"
      ? "border-danger/30 bg-danger-subtle text-danger"
      : "border-warn/30 bg-warn-subtle text-warn"

  return (
    <div
      role="alert"
      className={`mb-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border px-4 py-3 ${tone}`}
    >
      <TriangleAlert className="w-5 h-5 shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <Link
        to="/configuracoes/certificado"
        className="text-sm font-bold underline underline-offset-2"
      >
        Atualizar certificado
      </Link>
    </div>
  )
}
