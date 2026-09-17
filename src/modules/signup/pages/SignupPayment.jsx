import { Link, useParams } from "react-router-dom"
import { CheckCircle2, ExternalLink, Loader2, TriangleAlert, Wrench } from "lucide-react"
import { useSignupStatus } from "@/modules/signup/hooks/useSignupStatus"
import PrimaryButton from "@/modules/core/components/PrimaryButton"

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-ground flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md text-center">
        <Link
          to="/"
          className="flex items-center gap-2 font-display font-extrabold tracking-tight text-ink mb-8 justify-center"
        >
          <span className="w-[30px] h-[30px] rounded-lg bg-brand text-brand-fg grid place-items-center">
            <Wrench className="w-[17px] h-[17px]" />
          </span>
          AutoFlow <span className="font-sans font-medium text-muted">Center</span>
        </Link>
        <div className="card-premium">{children}</div>
      </div>
    </div>
  )
}

export default function SignupPayment() {
  const { id } = useParams()
  const { signup, loading, error } = useSignupStatus(id)

  if (loading) {
    return (
      <Shell>
        <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted">Carregando...</p>
      </Shell>
    )
  }

  if (error || !signup) {
    return (
      <Shell>
        <TriangleAlert className="w-8 h-8 text-danger mx-auto mb-4" />
        <h1 className="text-lg font-semibold text-ink mb-2">Cadastro não encontrado</h1>
        <p className="text-sm text-muted mb-6">
          Não conseguimos localizar esse cadastro. Volte e tente novamente.
        </p>
        <Link to="/" className="text-brand font-bold text-sm hover:underline">
          Voltar para o site
        </Link>
      </Shell>
    )
  }

  if (signup.error_message) {
    return (
      <Shell>
        <TriangleAlert className="w-8 h-8 text-danger mx-auto mb-4" />
        <h1 className="text-lg font-semibold text-ink mb-2">Não foi possível gerar a cobrança</h1>
        <p className="text-sm text-muted mb-6">{signup.error_message}</p>
        <Link to="/#planos" className="text-brand font-bold text-sm hover:underline">
          Voltar e tentar de novo
        </Link>
      </Shell>
    )
  }

  if (signup.checkout_url) {
    return (
      <Shell>
        <CheckCircle2 className="w-8 h-8 text-brand mx-auto mb-4" />
        <h1 className="text-lg font-semibold text-ink mb-2">Cobrança gerada</h1>
        <p className="text-sm text-muted mb-6">
          Falta só o pagamento — você será redirecionado pro ambiente seguro do provedor de
          pagamento pra concluir.
        </p>
        <a href={signup.checkout_url} target="_blank" rel="noreferrer">
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
