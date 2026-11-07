import { useState } from "react"
import { useManufacturerOptions } from "@/modules/core/hooks/options"
import LiveSelect from "@/modules/core/components/LiveSelect"
import ManufacturerQuickCreateModal from "./ManufacturerQuickCreateModal"

export default function ManufacturerLiveSelect({
  label,
  value,
  onChange,
  error,
  disabled,
  extraOption,
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const { manufacturers } = useManufacturerOptions()

  const options = manufacturers.map((manufacturer) => ({
    id: manufacturer.id,
    name: manufacturer.name,
  }))

  return (
    <>
      <LiveSelect
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        error={error}
        disabled={disabled}
        createLabel="Cadastrar nova marca"
        onCreateNew={() => setModalOpen(true)}
        extraOption={extraOption}
      />
      <ManufacturerQuickCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(manufacturer) => onChange?.(String(manufacturer.id))}
      />
    </>
  )
}
