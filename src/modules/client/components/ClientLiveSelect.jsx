import { useState } from "react"
import { useClientOptions } from "@/modules/core/hooks/options"
import LiveSelect from "@/modules/core/components/LiveSelect"
import ClientQuickCreateModal from "./ClientQuickCreateModal"

// Composto pronto pra substituir o SelectField de Cliente nas páginas de
// OS/Orçamento/Agendamento (LIVESEL-01 a 05): junta o LiveSelect genérico
// (busca-ao-digitar) com o ClientQuickCreateModal (cadastro rápido inline).
// A página não precisa mais chamar useClientOptions() pra esse campo — este
// composto já busca a lista internamente.
export default function ClientLiveSelect({ label, value, onChange, error, disabled, extraOption }) {
  const [modalOpen, setModalOpen] = useState(false)
  const { client: clients } = useClientOptions()

  // Busca nome/razão social E documento (CPF/CNPJ) — critério do spec
  // (LIVESEL-02): cliente repetido costuma lembrar o CPF, não o nome.
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
