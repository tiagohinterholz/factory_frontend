import FormField from "@/modules/core/components/FormField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { useStateEditForm } from "@/modules/location/state/hooks/useStateEditForm"


export default function StateEdit() {
  const {
    name,
    setName,
    abbreviation,
    setAbbreviation,
    loading,
    handleUpdate,
    handleDelete
  } = useStateEditForm()

  if (loading) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-4">

      <h1 className="text-2xl font-bold">Editar Estado</h1>

      <form className="space-y-4" onSubmit={handleUpdate}>
        <FormField
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormField
          label="Abreviação"
          value={abbreviation}
          onChange={(e) => setAbbreviation(e.target.value)}
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
