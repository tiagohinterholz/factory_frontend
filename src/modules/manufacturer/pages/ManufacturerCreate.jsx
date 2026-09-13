import { useManufacturerForm } from "@/modules/manufacturer/hooks/useManufacturerForm"
import BackLink from "@/modules/core/components/BackLink"
import FormField from "@/modules/core/components/FormField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Tag, Save } from "lucide-react"

export default function ManufacturerCreate() {
  const { form, onSubmit } = useManufacturerForm()
  const {
    register,
    formState: { errors, isSubmitting },
  } = form

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-xl mx-auto">
        <BackLink to="/marcas" />
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Nova Marca</h1>
        <p className="text-slate-400 font-medium text-sm mb-8">
          Adicione um fabricante ao catálogo de veículos
        </p>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Tag className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Cadastro de Marca</h3>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <FormField
              label="Nome da Marca"
              placeholder="Ex: Toyota"
              error={errors.name?.message}
              registration={register("name")}
            />

            <div className="pt-4">
              <PrimaryButton type="submit" icon={Save} disabled={isSubmitting}>
                Salvar Marca
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
