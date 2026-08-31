import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSupplierEditForm } from "@/modules/supplier/hooks/useSupplierEditForm"
import { useSupplierRelations } from "@/modules/supplier/hooks/useSupplierRelations"
import { useStateOptions } from "@/modules/core/hooks/options"
import { useCityOptionsByState } from "@/modules/core/hooks/options"
import { useBusinessOptions } from "@/modules/core/hooks/options"

import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import MaskedField from "@/modules/core/components/MaskedField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import RelatedDataCard from "@/modules/core/components/RelatedDataCard"
import { CNPJ_MASK, PHONE_MASK } from "@/modules/core/schemas/br-fields"

import { Factory, Package, Hammer, Edit2, Trash2, Milestone } from "lucide-react"

export default function SupplierDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { form, onSubmit, loading, handleDelete } = useSupplierEditForm()
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const { canChooseBusiness } = usePermissions()
  const stateId = watch("state_id")

  const { states, loading: loadingStates } = useStateOptions()
  const { citiesByState, loading: loadingCities } = useCityOptionsByState(stateId)
  const { business: businesses, loading: loadingBusinesses } = useBusinessOptions()
  const businessOptions = businesses.map((b) => ({ id: b.id, name: b.corporate_name }))

  const [activeTab, setActiveTab] = useState("products")
  const { products, services, loading: loadingRelated } = useSupplierRelations(id)

  if (loading || loadingStates || loadingBusinesses || (stateId && loadingCities)) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">
            Detalhes do Fornecedor
          </h1>
          <p className="text-slate-400 font-medium text-sm">Gestão de parcerias e catálogos</p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 text-danger hover:bg-danger-subtle rounded-xl transition duration-300 font-bold text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Excluir Fornecedor
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lado Esquerdo: Formulário */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-premium">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
              <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
                <Factory className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 tracking-tight">Dados Cadastrais</h3>
            </div>

            <form className="space-y-6" onSubmit={onSubmit}>
              {canChooseBusiness && (
                <SelectField
                  label="Empreendimento"
                  options={businessOptions}
                  error={errors.business_id?.message}
                  registration={register("business_id")}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Razão Social"
                  placeholder="Ex: Fornecedora de Insumos LTDA"
                  error={errors.corporate_name?.message}
                  registration={register("corporate_name")}
                />
                <FormField
                  label="Nome Fantasia"
                  placeholder="Ex: Insumos Brasil"
                  error={errors.trade_name?.message}
                  registration={register("trade_name")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MaskedField
                  control={control}
                  name="cnpj"
                  label="CNPJ"
                  mask={CNPJ_MASK}
                  placeholder="00.000.000/0000-00"
                  error={errors.cnpj?.message}
                />
                <FormField
                  label="E-mail"
                  type="email"
                  placeholder="contato@fornecedor.com"
                  error={errors.email?.message}
                  registration={register("email")}
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

              <div className="pt-6 pb-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                    <Milestone className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 tracking-tight">
                    Endereço e Localização
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Estado"
                  options={states}
                  error={errors.state_id?.message}
                  registration={register("state_id", { onChange: () => setValue("city_id", "") })}
                />
                <SelectField
                  label="Cidade"
                  options={citiesByState}
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

              <FormField
                label="Complemento"
                placeholder="Sala, Bloco, etc."
                error={errors.complement?.message}
                registration={register("complement")}
              />

              <div className="pt-4 flex justify-end">
                <PrimaryButton type="submit" icon={Edit2} fullWidth={false} disabled={isSubmitting}>
                  Salvar Alterações
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>

        {/* Lado Direito: Produtos e Serviços com Abas */}
        <div className="lg:col-span-5 h-full">
          <div className="card-premium h-full flex flex-col p-4">
            <div className="flex p-1 bg-slate-50/80 rounded-2xl border border-slate-100 mb-6 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab("products")}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === "products"
                    ? "bg-white text-brand shadow-sm border border-line"
                    : "text-slate-400 hover:text-slate-500"
                }`}
              >
                <Package className="w-4 h-4" />
                Produtos
                {products.length > 0 && (
                  <span
                    className={`ml-1.5 text-[10px] px-2 py-0.5 rounded-full ${
                      activeTab === "products"
                        ? "bg-brand-subtle text-brand"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {products.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("services")}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === "services"
                    ? "bg-white text-brand shadow-sm border border-line"
                    : "text-slate-400 hover:text-slate-500"
                }`}
              >
                <Hammer className="w-4 h-4" />
                Serviços
                {services.length > 0 && (
                  <span
                    className={`ml-1.5 text-[10px] px-2 py-0.5 rounded-full ${
                      activeTab === "services"
                        ? "bg-brand-subtle text-brand"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {services.length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex-1 min-h-[400px]">
              {activeTab === "products" ? (
                <RelatedDataCard
                  title="Produtos Fornecidos"
                  icon={Package}
                  items={products.map((p) => ({
                    id: p.id,
                    name: p.name,
                    subtitle: `R$ ${p.unit_price || "0,00"}`,
                  }))}
                  loading={loadingRelated}
                  emptyMessage="Nenhum produto cadastrado para este fornecedor."
                  onAddClick={() => navigate("/produtos/novo", { state: { supplierId: id } })}
                />
              ) : (
                <RelatedDataCard
                  title="Serviços Oferecidos"
                  icon={Hammer}
                  items={services.map((s) => ({
                    id: s.id,
                    name: s.name,
                    subtitle: `R$ ${s.unit_price || "0,00"}`,
                  }))}
                  loading={loadingRelated}
                  emptyMessage="Nenhum serviço cadastrado para este fornecedor."
                  onAddClick={() => navigate("/servicos/novo", { state: { supplierId: id } })}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
