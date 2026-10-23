import { useState } from "react"
import { useVehicleOptions } from "@/modules/core/hooks/options"
import LiveSelect from "@/modules/core/components/LiveSelect"
import VehicleQuickCreateModal from "./VehicleQuickCreateModal"

// Composto pronto pra substituir o SelectField de Veículo nas páginas de
// OS/Orçamento/Agendamento (LIVESEL-06 a 10): junta o LiveSelect genérico
// com o VehicleQuickCreateModal. Centraliza aqui o MESMO filtro client-side
// por client_id que hoje está repetido em cada página (ex.: OrderCreate.jsx).
//
// Sem clientId, `client` é FK obrigatória do veículo — não dá pra criar
// veículo órfão, então o campo fica desabilitado com `disabledHint` e sem
// atalho de criação (AC9).
export default function VehicleLiveSelect({
  label,
  value,
  onChange,
  clientId,
  error,
  disabled = false,
  disabledHint = "Escolha um cliente primeiro",
  extraOption,
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const { vehicle: vehicles } = useVehicleOptions()

  const hasClient = Boolean(clientId)

  // Mesma lógica client-side hoje duplicada em cada página (OrderCreate.jsx
  // e afins) — filtra pelo cliente ANTES de passar as opções pro LiveSelect.
  const options = vehicles
    .filter((v) => !clientId || String(v.client?.id || v.client) === String(clientId))
    .map((v) => ({
      id: v.id,
      name: `${v.manufacturer?.name} ${v.model?.name} (${v.plate})`,
      plate: v.plate ?? "",
    }))

  return (
    <>
      <LiveSelect
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        getSearchText={(option) => `${option.plate} ${option.name}`}
        error={error}
        disabled={disabled || !hasClient}
        disabledHint={disabledHint}
        createLabel="Cadastrar novo veículo"
        onCreateNew={hasClient ? () => setModalOpen(true) : undefined}
        extraOption={extraOption}
      />
      <VehicleQuickCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(vehicle) => onChange?.(String(vehicle.id))}
        clientId={clientId}
      />
    </>
  )
}
