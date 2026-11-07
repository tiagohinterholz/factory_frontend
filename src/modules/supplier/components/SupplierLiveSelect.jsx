import { useState } from "react"
import { useSupplierOptions } from "@/modules/core/hooks/options"
import LiveSelect from "@/modules/core/components/LiveSelect"
import SupplierQuickCreateModal from "./SupplierQuickCreateModal"

export default function SupplierLiveSelect({
  label,
  value,
  onChange,
  error,
  disabled,
  extraOption,
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const { supplier: suppliers } = useSupplierOptions()

  const sortedSuppliers = [...suppliers].sort((a, b) => {
    if (Boolean(a.is_business_mirror) === Boolean(b.is_business_mirror)) return 0
    return a.is_business_mirror ? -1 : 1
  })

  const options = sortedSuppliers.map((supplier) => ({
    id: supplier.id,
    name: supplier.corporate_name,
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
        createLabel="Cadastrar novo fornecedor"
        onCreateNew={() => setModalOpen(true)}
        extraOption={extraOption}
      />
      <SupplierQuickCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(supplier) => onChange?.(String(supplier.id))}
      />
    </>
  )
}
