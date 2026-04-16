import { useProductForm } from "@/modules/product/hooks/useProductForm"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import { useSupplier } from "@/modules/supplier/hooks/useSupplier"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Package, Save, Milestone } from "lucide-react"


export default function ProductCreate() {
  const {
    business, setBusiness,
    supplier, setSupplier,  
    name, setName,
    brand, setBrand,
    reference, setReference,
    description, setDescription,
    stockQuantity, setStockQuantity,
    unitPrice, setUnitPrice,
    handleSubmit
  } = useProductForm()
  
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

  if (loadingBusinesses || loadingSuppliers) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Novo Produto</h1>
        <p className="text-slate-400 font-medium text-sm mb-8 uppercase tracking-[0.15em]">Cadastro de itens para estoque</p>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Dados do Produto</h3>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isSuperUser && (
                <SelectField 
                  label="Empreendimento"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  options={businessOptions}
                  required
                />
              )}

              <SelectField 
                label="Fornecedor"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                options={supplierOptions}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Nome do Produto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Óleo 5W30"
              />
              <FormField 
                label="Marca"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ex: Castrol"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Referência/SKU"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex: REF-123"
              />
              <FormField 
                label="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes técnicos..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Qtd em Estoque"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                type="number"
              />
              <FormField 
                label="Preço Unitário"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                type="number"
                step="0.01"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Save} fullWidth={false}>
                Salvar Produto
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
