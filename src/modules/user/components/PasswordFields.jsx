import { WandSparkles } from "lucide-react"
import FormField from "@/modules/core/components/FormField"
import PasswordStrengthMeter from "./PasswordStrengthMeter"
import { generateStrongPassword } from "@/modules/core/utils/password-policy"

// Bloco de senha reaproveitado no criar e no editar usuário: os dois campos,
// o botão de gerar senha forte e o medidor de força logo abaixo.
export default function PasswordFields({
  register,
  watch,
  setValue,
  errors,
  passwordLabel = "Senha",
  confirmLabel = "Confirmar Senha",
  hint,
}) {
  const password = watch("password") || ""

  function handleGenerate() {
    const generated = generateStrongPassword()
    setValue("password", generated, { shouldValidate: true, shouldDirty: true })
    setValue("confirmPassword", generated, { shouldValidate: true, shouldDirty: true })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label={passwordLabel}
          type="password"
          placeholder="Mínimo 8 caracteres"
          error={errors.password?.message}
          registration={register("password")}
        />
        <FormField
          label={confirmLabel}
          type="password"
          placeholder="Repita a senha"
          error={errors.confirmPassword?.message}
          registration={register("confirmPassword")}
        />
      </div>

      {hint && <p className="text-xs text-muted -mt-1">{hint}</p>}

      <button
        type="button"
        onClick={handleGenerate}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
      >
        <WandSparkles className="w-3.5 h-3.5" />
        Gerar senha forte automaticamente
      </button>

      <PasswordStrengthMeter password={password} />
    </div>
  )
}
