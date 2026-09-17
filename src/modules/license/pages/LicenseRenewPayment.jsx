import { Link, useParams } from "react-router-dom"
import { CheckCircle2, ExternalLink, Loader2, TriangleAlert } from "lucide-react"
import { useLicenseRenewalPayment } from "@/modules/license/hooks/useLicenseRenewalPayment"
import BackLink from "@/modules/core/components/BackLink"
import PrimaryButton from "@/modules/core/components/PrimaryButton"

// Tela de espera da cobrança de renovação (4.4.2) — mesmo padrão do
// checkout público em SignupPayment.jsx, mas dentro do layout autenticado
// (o admin já está logado, não precisa da tela cheia de "site público").
function Shell({ children }) {
  return (
    <div className="p-6">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6 text-left">
          <BackLink to="/configuracoes/licenca" />
        </div>
        <div className="card-premium">{children}</div>
      </div>
    </div>
  )
}

export default function LicenseRenewPayment() {
  const { id } = useParams()
  const { payment, loading, error } = useLicenseRenewalPayment(id)

  if (loading) {
    return (
      <Shell>
        <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted">Carregando...</p>
      </Shell>
    )
  }

  if (error || !payment) {
    return (
      <Shell>
        <TriangleAlert className="w-8 h-8 text-danger mx-auto mb-4" />
        <h1 className="text-lg font-semibold text-ink mb-2">Cobrança não encontrada</h1>
        <p className="text-sm text-muted">
          Não conseguimos localizar essa cobrança. Volte e tente novamente.
        </p>
      </Shell>
    )
  }

  if (payment.error_message) {
    return (
      <Shell>
        <TriangleAlert className="w-8 h-8 text-danger mx-auto mb-4" />
        <h1 className="text-lg font-semibold text-ink mb-2">Não foi possível gerar a cobrança</h1>
        <p className="text-sm text-muted">{payment.error_message}</p>
      </Shell>
    )
  }

  if (payment.checkout_url) {
    return (
      <Shell>
        <CheckCircle2 className="w-8 h-8 text-brand mx-auto mb-4" />
        <h1 className="text-lg font-semibold text-ink mb-2">Cobrança gerada</h1>
        <p className="text-sm text-muted mb-6">
          Falta só o pagamento — a licença é renovada automaticamente assim que ele for confirmado.
        </p>
        <a href={payment.checkout_url} target="_blank" rel="noreferrer">
          <PrimaryButton type="button" icon={ExternalLink}>
            Ir para o pagamento
          </PrimaryButton>
        </a>
      </Shell>
    )
  }

  return (
    <Shell>
      <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto mb-4" />
      <h1 className="text-lg font-semibold text-ink mb-2">Preparando sua cobrança</h1>
      <p className="text-sm text-muted">Isso leva só alguns segundos, não feche esta página.</p>
    </Shell>
  )
}
