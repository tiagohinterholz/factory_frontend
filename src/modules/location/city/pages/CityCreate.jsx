import { useCityForm } from "@/modules/location/city/hooks/useCityForm"
import { useStates } from "@/modules/location/state/hooks/useState"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Milestone, Save } from "lucide-react"

export default function CityCreate() {
  const { form, onSubmit } = useCityForm()
  const {
    register,
    formState: { errors, isSubmitting },
  } = form

  const { states, loading } = useStates()
  const stateOptions = states.map((s) => ({ id: s.id, name: `${s.name} (${s.abbreviation})` }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Nova Cidade</h1>
        <p className="text-slate-400 font-medium text-sm mb-8">
          Adicione um novo município ao sistema
        </p>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Milestone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Cadastro Municipal</h3>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <FormField
              label="Nome da Cidade"
              placeholder="Ex: Curitiba"
              error={errors.name?.message}
              registration={register("name")}
            />

            <SelectField
              label="Estado"
              options={stateOptions}
              error={errors.state_id?.message}
              registration={register("state_id")}
            />

            <div className="pt-4">
              <PrimaryButton type="submit" icon={Save} disabled={isSubmitting}>
                Salvar Cidade
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
