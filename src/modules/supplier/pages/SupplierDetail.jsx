import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSupplierEditForm } from "@/modules/supplier/hooks/useSupplierEditForm"
import { useStates } from "@/modules/location/state/hooks/useState"
import { useCitiesByState } from "@/modules/location/city/hooks/useCity"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import { GetProductBySupplier, GetServiceBySupplier } from "@/modules/supplier/services/supplier"

import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import RelatedDataCard from "@/modules/core/components/RelatedDataCard"

import { Factory, Package, Hammer, Edit2, Trash2, Milestone, ChevronRight } from "lucide-react"


export default function SupplierDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    business, setBusiness,
    corporateName, setCorporateName,  
    tradeName, setTradeName,
    cnpj, setCnpj,
    stateId, setStateId,
    cityId, setCityId,
    address, setAddress,
    number, setNumber,
    complement, setComplement,
    phone, setPhone,
    email, setEmail,
    loading,
    handleUpdate,
    handleDelete
  } = useSupplierEditForm()
  
  const { states, loading: loadingStates } = useStates()
  const { citiesByState, loading: loadingCities } = useCitiesByState(stateId)
  const { business: businesses, loading: loadingBusinesses } = useBusiness()

  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [loadingRelated, setLoadingRelated] = useState(true)
  const [activeTab, setActiveTab] = useState('products')

  useEffect(() => {
    async function loadRelatedData() {
      try {
        const [prodData, servData] = await Promise.all([
          GetProductBySupplier(id),
          GetServiceBySupplier(id)
        ])
        setProducts(prodData)
        setServices(servData)
      } catch (err) {
        console.error("Erro ao carregar dados relacionados", err)
      } finally {
        setLoadingRelated(false)
      }
    }
    if (id) loadRelatedData()
  }, [id])

  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const isSuperUser = !user.business_id

  const businessOptions = businesses.map(b => ({
    id: b.id,
    name: b.corporate_name
  }))

  const handleStateChange = (e) => {
    setStateId(e.target.value);
    setCityId(""); 
  };

  if (loading || loadingStates || loadingBusinesses || (stateId && loadingCities)) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Detalhes do Fornecedor</h1>
          <p className="text-slate-400 font-medium text-sm uppercase tracking-[0.15em]">Gestão de parcerias e catálogos</p>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition duration-300 font-bold text-sm"
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
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                <Factory className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 tracking-tight">Dados Cadastrais</h3>
            </div>

            <form className="space-y-6" onSubmit={handleUpdate}>
              
              {isSuperUser && (
                <SelectField 
                  label="Empreendimento"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  options={businessOptions}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  label="Razão Social"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                />
                <FormField 
                  label="Nome Fantasia"
                  value={corporateName}
                  onChange={(e) => setCorporateName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  label="CNPJ"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                />
                <FormField 
                  label="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                />
              </div>

              <FormField 
                label="Telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <div className="pt-6 pb-2">
                 <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                    <Milestone className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 tracking-tight">Endereço e Localização</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField 
                  label="Estado"
                  value={stateId}
                  onChange={handleStateChange}
                  options={states}
                />
                <SelectField 
                  label="Cidade"
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  options={citiesByState}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                   <FormField 
                    label="Endereço"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <FormField 
                  label="Número"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
              </div>

              <FormField 
                label="Complemento"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
              />

              <div className="pt-4 flex justify-end">
                <PrimaryButton type="submit" icon={Edit2} fullWidth={false}>
                  Salvar Alterações
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>

        {/* Lado Direito: Produtos e Serviços com Abas */}
        <div className="lg:col-span-5 h-full">
          <div className="card-premium h-full flex flex-col p-4">
            {/* Cabeçalho de Abas */}
            <div className="flex p-1 bg-slate-50/80 rounded-2xl border border-slate-100 mb-6 shadow-inner">
              <button 
                onClick={() => setActiveTab('products')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === 'products' 
                  ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50 hover:scale-[1.02]' 
                  : 'text-slate-400 hover:text-slate-500'
                }`}
              >
                <Package className="w-4 h-4" />
                Produtos
                {products.length > 0 && (
                  <span className={`ml-1.5 text-[10px] px-2 py-0.5 rounded-full ${
                    activeTab === 'products' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {products.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('services')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === 'services' 
                  ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50 hover:scale-[1.02]' 
                  : 'text-slate-400 hover:text-slate-500'
                }`}
              >
                <Hammer className="w-4 h-4" />
                Serviços
                {services.length > 0 && (
                  <span className={`ml-1.5 text-[10px] px-2 py-0.5 rounded-full ${
                    activeTab === 'services' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {services.length}
                  </span>
                )}
              </button>
            </div>

            {/* Conteúdo da Aba Ativa */}
            <div className="flex-1 min-h-[400px]">
              {activeTab === 'products' ? (
                <RelatedDataCard 
                  title="Produtos Fornecidos"
                  icon={Package}
                  items={products.map(p => ({
                    id: p.id,
                    name: p.name,
                    subtitle: `R$ ${p.unit_price || '0,00'}`
                  }))}
                  loading={loadingRelated}
                  emptyMessage="Nenhum produto cadastrado para este fornecedor."
                  onAddClick={() => navigate("/produtos/novo", { state: { supplierId: id } })}
                />
              ) : (
                <RelatedDataCard 
                  title="Serviços Oferecidos"
                  icon={Hammer}
                  items={services.map(s => ({
                    id: s.id,
                    name: s.name,
                    subtitle: `R$ ${s.unit_price || '0,00'}`
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
