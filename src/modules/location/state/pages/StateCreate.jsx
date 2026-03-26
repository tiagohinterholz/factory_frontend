import { useStateForm } from "@/modules/location/state/hooks/useStateForm"
import FormField from "@/modules/core/components/FormField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Globe, Save } from "lucide-react"

export default function StateCreate() {
  const {
    name,
    setName,
    abbreviation,
    setAbbreviation,
    handleSubmit
  } = useStateForm()

  return (
    <div className="p-6 space-y-6">
      
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Novo Estado</h1>
        <p className="text-slate-400 font-medium text-sm mb-8 uppercase tracking-[0.15em]">Cadastre uma nova unidade federativa</p>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Informações Geográficas</h3>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <FormField 
                  label="Nome do Estado"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Minas Gerais"
                />
              </div>
              <FormField 
                label="Sigla"
                value={abbreviation}
                onChange={(e) => setAbbreviation(e.target.value)}
                placeholder="EX: MG"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Save} fullWidth={false}>
                Salvar Estado
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
