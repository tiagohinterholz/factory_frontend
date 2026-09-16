import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { CreditCard, QrCode, Barcode, ArrowRight, Wrench } from "lucide-react"
import { useStateOptions, useCityOptionsByState } from "@/modules/core/hooks/options"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import MaskedField from "@/modules/core/components/MaskedField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { CNPJ_MASK, PHONE_MASK } from "@/modules/core/schemas/br-fields"
import { useSignupForm } from "@/modules/signup/hooks/useSignupForm"
import { planByCode, SIGNUP_STEP_1_FIELDS } from "@/modules/signup/domain"

const PAYMENT_METHODS = [
  { id: "PIX", label: "Pix", icon: QrCode },
  { id: "BOLETO", label: "Boleto", icon: Barcode },
  { id: "CREDIT_CARD", label: "Cartão de crédito", icon: CreditCard },
]

function StepDots({ step }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2].map((n) => (
        <span
          key={n}
          className={`h-1.5 rounded-full transition-all ${
            n === step ? "w-8 bg-brand" : "w-4 bg-line"
          }`}
        />
      ))}
    </div>
  )
}

export default function SignupCheckout() {
  const { period } = useParams()
  const plan = planByCode(period)
  const [step, setStep] = useState(1)

  const { form, onSubmit } = useSignupForm({ period })
  const {
    register,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = form

  const stateId = watch("state_id")
  const method = watch("method")

  const { states, loading: loadingStates } = useStateOptions()
  const { citiesByState, loading: loadingCities } = useCityOptionsByState(stateId)

  async function goToStep2() {
    const valid = await trigger(SIGNUP_STEP_1_FIELDS)
    if (valid) setStep(2)
  }

  return (
    <div className="min-h-screen bg-ground flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
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
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold text-ink tracking-tight">Criar sua conta</h1>
            {plan && (
              <span className="text-[12.5px] font-bold uppercase tracking-wide bg-brand-subtle text-brand rounded-full px-2.5 py-1">
                {plan.period} · R$ {plan.price}
              </span>
            )}
          </div>
          <p className="text-slate-400 font-medium text-sm mb-6">
            {step === 1 ? "Primeiro, os seus dados de acesso" : "Agora, os dados da sua empresa"}
          </p>

          <StepDots step={step} />

          <form className="space-y-6" onSubmit={onSubmit}>
            {step === 1 && (
              <>
                <FormField
                  label="Seu nome"
                  placeholder="Ex: João da Silva"
                  error={errors.responsible_name?.message}
                  registration={register("responsible_name")}
                />
                <FormField
                  label="E-mail"
                  type="email"
                  placeholder="voce@suaoficina.com"
                  error={errors.email?.message}
                  registration={register("email")}
                />
                <div className="pt-2">
                  <PrimaryButton type="button" icon={ArrowRight} onClick={goToStep2}>
                    Continuar
                  </PrimaryButton>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Razão Social"
                    placeholder="Ex: Oficina do João LTDA"
                    error={errors.corporate_name?.message}
                    registration={register("corporate_name")}
                  />
                  <MaskedField
                    control={control}
                    name="cnpj"
                    label="CNPJ"
                    mask={CNPJ_MASK}
                    placeholder="00.000.000/0000-00"
                    error={errors.cnpj?.message}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField
                    label="Estado"
                    options={loadingStates ? [] : states}
                    error={errors.state_id?.message}
                    registration={register("state_id", {
                      onChange: () => setValue("city_id", ""),
                    })}
                  />
                  <SelectField
                    label="Cidade"
                    options={citiesByState}
                    disabled={!stateId || loadingCities}
                    disabledHint="Selecione o estado primeiro"
                    error={errors.city_id?.message}
                    registration={register("city_id")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <FormField
                      label="Endereço"
                      placeholder="Rua, Avenida, etc."
                      error={errors.address?.message}
                      registration={register("address")}
                    />
                  </div>
                  <FormField
                    label="Número"
                    placeholder="123"
                    error={errors.number?.message}
                    registration={register("number")}
                  />
                </div>

                <MaskedField
                  control={control}
                  name="phone"
                  label="Telefone"
                  mask={PHONE_MASK}
                  placeholder="(00) 00000-0000"
                  error={errors.phone?.message}
                />

                <div>
                  <p className="label-premium mb-2">Forma de pagamento</p>
                  <div className="grid grid-cols-3 gap-2">
                    {PAYMENT_METHODS.map((option) => {
                      const Icon = option.icon
                      const selected = method === option.id
                      return (
                        <button
                          type="button"
                          key={option.id}
                          onClick={() => setValue("method", option.id)}
                          aria-pressed={selected}
                          className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition-colors ${
                            selected
                              ? "border-brand bg-brand-subtle text-brand"
                              : "border-line text-muted hover:bg-ground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[12px] font-bold">{option.label}</span>
                        </button>
                      )
                    })}
                  </div>
                  {errors.method && (
                    <span className="mt-1.5 block text-xs text-danger">
                      {errors.method.message}
                    </span>
                  )}
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 rounded-xl border border-line text-ink font-bold text-sm hover:bg-ground transition-colors"
                  >
                    Voltar
                  </button>
                  <div className="flex-1">
                    <PrimaryButton type="submit" disabled={isSubmitting}>
                      Finalizar e pagar
                    </PrimaryButton>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
