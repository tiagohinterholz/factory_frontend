import { useStateForm } from "@/modules/location/state/hooks/useStateForm"
import FormField from "@/modules/core/components/FormField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"

export default function StateCreate() {
  const {
    name,
    setName,
    abbreviation,
    setAbbreviation,
    handleSubmit
  } = useStateForm()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Novo Estado</h1>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField 
          label="Nome do Estado"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <FormField 
          label="Abreviação"
          value={abbreviation}
          onChange={(e) => setAbbreviation(e.target.value)}
        />

        <PrimaryButton type="submit">
          Salvar
        </PrimaryButton>

      </form>
    </div>
  )
}
