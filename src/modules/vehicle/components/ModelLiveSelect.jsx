import { useState } from "react"
import { useModelOptionsByManufacturer } from "@/modules/core/hooks/options"
import LiveSelect from "@/modules/core/components/LiveSelect"
import ModelQuickCreateModal from "./ModelQuickCreateModal"

export default function ModelLiveSelect({
  label,
  value,
  onChange,
  manufacturerId,
  error,
  disabled = false,
  disabledHint = "Selecione a marca primeiro",
  extraOption,
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const { modelsByManufacturer } = useModelOptionsByManufacturer(manufacturerId)

  const hasManufacturer = Boolean(manufacturerId)

  const options = modelsByManufacturer.map((model) => ({ id: model.id, name: model.name }))

  return (
    <>
      <LiveSelect
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        error={error}
        disabled={disabled || !hasManufacturer}
        disabledHint={disabledHint}
        createLabel="Cadastrar novo modelo"
        onCreateNew={hasManufacturer ? () => setModalOpen(true) : undefined}
        extraOption={extraOption}
      />
      <ModelQuickCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(model) => onChange?.(String(model.id))}
        manufacturerId={manufacturerId}
      />
    </>
  )
}
