import { Link } from "react-router-dom"
import { Wrench, KeyRound, MailCheck } from "lucide-react"
import FormField from "@/modules/core/components/FormField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { useForgotPasswordForm } from "@/modules/auth/hooks/useForgotPasswordForm"

export default function ForgotPassword() {
  const { form, onSubmit, sent } = useForgotPasswordForm()
  const {
    register,
    formState: { errors, isSubmitting },
  } = form

  return (
    <div className="min-h-screen bg-ground flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="flex items-center gap-2 font-display font-extrabold tracking-tight text-ink mb-8 justify-center"
        >
          <span className="w-[30px] h-[30px] rounded-lg bg-brand text-brand-fg grid place-items-center">
            <Wrench className="w-[17px] h-[17px]" />
          </span>
          AutoFlow <span className="font-sans font-medium text-muted">Center</span>
        </Link>

        <div className="card-premium">
          {sent ? (
            <div className="text-center py-2">
              <MailCheck className="w-8 h-8 text-brand mx-auto mb-4" />
              <h1 className="text-lg font-semibold text-ink mb-2">Verifique seu e-mail</h1>
              <p className="text-sm text-muted">
                Se esse e-mail estiver cadastrado, você vai receber um link pra redefinir sua senha.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-ink tracking-tight">
                    Esqueceu sua senha?
                  </h1>
                  <p className="text-[12.5px] text-muted">
                    Informe seu e-mail e mandamos um link de redefinição
                  </p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={onSubmit}>
                <FormField
                  label="E-mail"
                  type="email"
                  placeholder="voce@suaoficina.com"
                  error={errors.email?.message}
                  registration={register("email")}
                />
                <div className="pt-2">
                  <PrimaryButton type="submit" disabled={isSubmitting}>
                    Enviar link
                  </PrimaryButton>
                </div>
              </form>
            </>
          )}

          <p className="text-center text-sm mt-6">
            <Link to="/login" className="text-brand font-bold hover:underline">
              Voltar pro login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
