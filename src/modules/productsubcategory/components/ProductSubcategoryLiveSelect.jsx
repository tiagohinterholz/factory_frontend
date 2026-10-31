import { useState } from "react"
import { useProductSubcategoryOptionsByCategory } from "@/modules/core/hooks/options"
import LiveSelect from "@/modules/core/components/LiveSelect"
import ProductSubcategoryQuickCreateModal from "./ProductSubcategoryQuickCreateModal"

export default function ProductSubcategoryLiveSelect({
  label,
  value,
  onChange,
  categoryId,
  error,
  disabled = false,
  disabledHint = "Selecione a categoria primeiro",
  extraOption,
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const { subcategoriesByCategory } = useProductSubcategoryOptionsByCategory(categoryId)

  const hasCategory = Boolean(categoryId)

  const options = subcategoriesByCategory.map((subcategory) => ({
    id: subcategory.id,
    name: subcategory.name,
  }))

  return (
    <>
      <LiveSelect
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        error={error}
        disabled={disabled || !hasCategory}
        disabledHint={disabledHint}
        createLabel="Cadastrar nova subcategoria"
        onCreateNew={hasCategory ? () => setModalOpen(true) : undefined}
        extraOption={extraOption}
      />
      <ProductSubcategoryQuickCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(subcategory) => onChange?.(String(subcategory.id))}
        categoryId={categoryId}
      />
    </>
  )
}
