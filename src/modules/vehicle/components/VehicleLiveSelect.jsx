import { useState } from "react"
import { useVehicleOptions } from "@/modules/core/hooks/options"
import LiveSelect from "@/modules/core/components/LiveSelect"
import VehicleQuickCreateModal from "./VehicleQuickCreateModal"

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

  const options = vehicles
    .filter((v) => !clientId || String(v.client?.id || v.client) === String(clientId))
    .map((v) => ({
      id: v.id,
      name: `${v.manufacturer?.name} ${v.model?.name}`,
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
