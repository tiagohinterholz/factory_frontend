import { useClientForm } from "@/modules/client/hooks/useClientForm"
import { useStates } from "@/modules/location/state/hooks/useState"
import { useCitiesByState } from "@/modules/location/city/hooks/useCity"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"


export default function ClientCreate() {
  const {
    business, setBusiness,
    firstName, setFirstName,  
    lastName, setLastName,
    cpf, setCpf,
    stateId, setStateId,
    cityId, setCityId,
    address, setAddress,
    number, setNumber,
    complement, setComplement,
    phone, setPhone,
    email, setEmail,
    handleSubmit
  } = useClientForm()
  
  const { states, loading: loadingStates } = useStates()
  const { citiesByState, loading: loadingCities } = useCitiesByState(stateId)
  const { business: businesses, loading: loadingBusinesses } = useBusiness()

  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const isSuperUser = !user.business_id

  const businessOptions = businesses.map(b => ({
    id: b.id,
    name: b.corporate_name
  }))

  if (loadingStates || loadingBusinesses || (stateId && loadingCities)) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Novo Cliente</h1>

     <form className="space-y-4" onSubmit={handleSubmit}>

        {isSuperUser && (
          <SelectField 
            label="Selecione o Empreendimento"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            options={businessOptions}
          />
        )}
        <FormField 
          label="Nome"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <FormField 
          label="Sobrenome"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <FormField 
          label="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
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
