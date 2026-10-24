import { useState } from "react"
import { useClientOptions } from "@/modules/core/hooks/options"
import LiveSelect from "@/modules/core/components/LiveSelect"
import ClientQuickCreateModal from "./ClientQuickCreateModal"

export default function ClientLiveSelect({ label, value, onChange, error, disabled, extraOption }) {
  const [modalOpen, setModalOpen] = useState(false)
  const { client: clients } = useClientOptions()

  const options = clients.map((client) => ({
    id: client.id,
    name: client.display_name,
    document: client.cpf || client.cnpj || "",
  }))

  return (
    <>
      <LiveSelect
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        getSearchText={(option) => `${option.name} ${option.document}`}
        error={error}
        disabled={disabled}
        createLabel="Cadastrar novo cliente"
        onCreateNew={() => setModalOpen(true)}
        extraOption={extraOption}
      />
      <ClientQuickCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(client) => onChange?.(String(client.id))}
      />
    </>
  )
}
