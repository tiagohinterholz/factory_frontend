import { useBusinessForm } from "@/modules/business/hooks/useBusinessForm"
import { useStates } from "@/modules/location/state/hooks/useState"
import { useCitiesByState } from "@/modules/location/city/hooks/useCity"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"


export default function BusinessCreate() {
  const {
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
    handleSubmit
  } = useBusinessForm()
  
  const { states, loading: loadingStates } = useStates()
  const { citiesByState, loading: loadingCities } = useCitiesByState(stateId)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Novo Empreendimento</h1>

     <form className="space-y-4" onSubmit={handleSubmit}>
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
          onChange={(e) => setStateId(e.target.value)}
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
          Salvar
        </PrimaryButton>

      </form>
    </div>
  )
}
