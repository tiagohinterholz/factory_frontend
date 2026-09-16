import { Link, useParams } from "react-router-dom"
import { Wrench, KeyRound } from "lucide-react"
import PasswordFields from "@/modules/user/components/PasswordFields"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { useResetPasswordForm } from "@/modules/auth/hooks/useResetPasswordForm"

export default function ResetPassword() {
  const { uidb64, token } = useParams()
  const { form, onSubmit } = useResetPasswordForm({ uidb64, token })
  const {
    register,
    watch,
    setValue,
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
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-ink tracking-tight">Redefinir senha</h1>
              <p className="text-[12.5px] text-muted">Escolha uma nova senha pra sua conta</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={onSubmit} autoComplete="off">
            <PasswordFields register={register} watch={watch} setValue={setValue} errors={errors} />
            <div className="pt-2">
              <PrimaryButton type="submit" disabled={isSubmitting}>
                Redefinir senha
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
