import { useSupplierEditForm } from "@/modules/supplier/hooks/useSupplierEditForm"
import { useStates } from "@/modules/location/state/hooks/useState"
import { useCitiesByState } from "@/modules/location/city/hooks/useCity"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"


export default function SupplierEdit() {
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

  if (loading || loadingStates || loadingBusinesses || (stateId && loadingCities)) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Editar Fornecedor</h1>

     <form className="space-y-4" onSubmit={handleUpdate}>

        {isSuperUser && (
          <SelectField 
            label="Selecione o Empreendimento"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            options={businessOptions}
          />
        )}
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

        <FormField 
          label="CNPJ"
          value={cnpj}
          onChange={(e) => setCnpj(e.target.value)}
        />

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

        <FormField 
          label="Endereço"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <FormField 
          label="Número"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />

        <FormField 
          label="Complemento"
          value={complement}
          onChange={(e) => setComplement(e.target.value)}
        />

        <FormField 
          label="Telefone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <FormField 
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PrimaryButton type="submit">
          Atualizar
        </PrimaryButton>
      </form>

      <button
        onClick={handleDelete}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Deletar
      </button>

    </div>
  )
}
