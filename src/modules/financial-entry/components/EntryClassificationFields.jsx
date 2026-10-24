import { Controller } from "react-hook-form"
import SelectField from "@/modules/core/components/SelectField"
import {
  FinancialCategoryLiveSelect,
  TagInput,
  legacyCategoryFor,
  useFinancialSubcategoryOptions,
  useFinancialTagOptions,
} from "@/modules/financial-category"

export default function EntryClassificationFields({
  form,
  categoryLocked = false,
  tagsLocked = false,
  extraCategory,
}) {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = form
  const categoryId = watch("financial_category_id")
  const { subcategories } = useFinancialSubcategoryOptions(categoryId)
  const { tags } = useFinancialTagOptions()

  return (
    <>
      {!categoryLocked && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FinancialCategoryLiveSelect
            value={categoryId}
            extraOption={extraCategory && { id: extraCategory.id, name: extraCategory.name }}
            error={errors.financial_category_id?.message}
            onChange={(id, category) => {
              setValue("financial_category_id", id ?? "", { shouldValidate: true })
              setValue("category", legacyCategoryFor(category))
              setValue("financial_subcategory_id", "")
            }}
          />
          <SelectField
            label="Subcategoria"
            options={subcategories.map((item) => ({ id: item.id, name: item.name }))}
            disabled={!categoryId || subcategories.length === 0}
            registration={register("financial_subcategory_id")}
          />
        </div>
      )}
      <Controller
        control={control}
        name="tags"
        render={({ field }) => (
          <TagInput
            value={field.value ?? []}
            onChange={field.onChange}
            suggestions={tags.map((tag) => tag.name)}
            disabled={tagsLocked}
          />
        )}
      />
    </>
  )
}
