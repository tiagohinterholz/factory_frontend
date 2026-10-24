import { useCityEditForm } from "@/modules/location/city/hooks/useCityEditForm"
import BackLink from "@/modules/core/components/BackLink"
import { useStateOptions } from "@/modules/core/hooks/options"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import { Milestone, Trash2, Edit2 } from "lucide-react"

export default function CityEdit() {
  const { form, onSubmit, loading, handleDelete } = useCityEditForm()
  const { isSuperUser } = usePermissions()
  const {
    register,
    formState: { errors, isSubmitting },
  } = form

  const { states, loading: loadingStates } = useStateOptions()
  const stateOptions = states.map((s) => ({ id: s.id, name: `${s.name} (${s.abbreviation})` }))

  if (loading || loadingStates) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-xl mx-auto">
        <BackLink to="/cidades" />
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">
              {isSuperUser ? "Editar Cidade" : "Cidade"}
            </h1>
            <p className="text-slate-400 font-medium text-sm">Gestão de municípios</p>
          </div>
          {isSuperUser && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-danger hover:bg-danger-subtle rounded-xl transition duration-300 font-bold text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Excluir
            </button>
          )}
        </div>

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
              placeholder="Ex: São Paulo"
              disabled={!isSuperUser}
              error={errors.name?.message}
              registration={register("name")}
            />

            <SelectField
              label="Estado"
              options={stateOptions}
              disabled={!isSuperUser}
              error={errors.state_id?.message}
              registration={register("state_id")}
            />

            {isSuperUser && (
              <div className="pt-4">
                <PrimaryButton type="submit" icon={Edit2} disabled={isSubmitting}>
                  Salvar Alterações
                </PrimaryButton>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
