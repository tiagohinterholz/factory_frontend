import { useStateForm } from "@/modules/location/state/hooks/useStateForm"
import BackLink from "@/modules/core/components/BackLink"
import FormField from "@/modules/core/components/FormField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Globe, Save } from "lucide-react"

export default function StateCreate() {
  const { form, onSubmit } = useStateForm()
  const {
    register,
    formState: { errors, isSubmitting },
  } = form

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-xl mx-auto">
        <BackLink to="/estados" />
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Novo Estado</h1>
        <p className="text-slate-400 font-medium text-sm mb-8">
          Cadastre uma nova unidade federativa
        </p>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Informações Geográficas</h3>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <FormField
                  label="Nome do Estado"
                  placeholder="Ex: Minas Gerais"
                  error={errors.name?.message}
                  registration={register("name")}
                />
              </div>
              <FormField
                label="Sigla"
                placeholder="EX: MG"
                error={errors.abbreviation?.message}
                registration={register("abbreviation")}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Save} fullWidth={false} disabled={isSubmitting}>
                Salvar Estado
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
