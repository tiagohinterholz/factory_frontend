import { useState } from "react"
import { useProductCategoryOptions } from "@/modules/core/hooks/options"
import LiveSelect from "@/modules/core/components/LiveSelect"
import ProductCategoryQuickCreateModal from "./ProductCategoryQuickCreateModal"

export default function ProductCategoryLiveSelect({
  label,
  value,
  onChange,
  error,
  disabled,
  extraOption,
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const { productCategories } = useProductCategoryOptions()

  const options = productCategories.map((category) => ({
    id: category.id,
    name: category.name,
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
        createLabel="Cadastrar nova categoria"
        onCreateNew={() => setModalOpen(true)}
        extraOption={extraOption}
      />
      <ProductCategoryQuickCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(category) => onChange?.(String(category.id))}
      />
    </>
  )
}
