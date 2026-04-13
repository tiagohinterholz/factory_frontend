import { useParams } from "react-router-dom"
import { useWorkServiceEditForm } from "@/modules/workservice/hooks/useWorkServiceEditForm"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import { useSupplier } from "@/modules/supplier/hooks/useSupplier"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Settings, Edit2, Trash2 } from "lucide-react"

export default function WorkServiceDetail() {
  useParams()
  
  const {
    business, setBusiness,
    supplier, setSupplier,  
    name, setName,
    description, setDescription,
    unitPrice, setUnitPrice,
    loading,
    handleUpdate,
    handleDelete
  } = useWorkServiceEditForm()
  
  const { business: businesses, loading: loadingBusinesses } = useBusiness()
  const { supplier: suppliers, loading: loadingSuppliers } = useSupplier()

  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const isSuperUser = !user.business_id

  const businessOptions = businesses.map(b => ({
    id: b.id,
    name: b.corporate_name
  }))

  const supplierOptions = suppliers.map(s => ({
    id: s.id,
    name: s.corporate_name
  }))

  if (loading || loadingBusinesses || loadingSuppliers) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Detalhes do Serviço</h1>
            <p className="text-slate-400 font-medium text-sm uppercase tracking-[0.15em]">Gestão de Mão de Obra</p>
          </div>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition duration-300 font-bold text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Excluir Serviço
          </button>
        </div>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Informações do Serviço</h3>
          </div>

          <form className="space-y-6" onSubmit={handleUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isSuperUser && (
                <SelectField 
                  label="Empreendimento"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  options={businessOptions}
                />
              )}

              <SelectField 
                label="Fornecedor (Opcional)"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                options={supplierOptions}
              />
            </div>

            <FormField 
              label="Nome do Serviço"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <FormField 
              label="Descrição / Detalhes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              isTextArea
            />

            <div className="max-w-xs">
              <FormField 
                label="Preço do Serviço (Mão de Obra)"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                type="number"
                step="0.01"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Edit2} fullWidth={false}>
                Salvar Alterações
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
