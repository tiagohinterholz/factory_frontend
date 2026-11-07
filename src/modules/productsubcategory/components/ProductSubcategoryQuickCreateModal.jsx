import { useEffect } from "react"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { ProductSubcategoryService } from "@/modules/productsubcategory/services/productsubcategory"
import {
  productSubcategorySchema,
  productSubcategoryDefaults,
  productSubcategoryKeys,
} from "@/modules/productsubcategory/domain"
import { productCategoryKeys } from "@/modules/productcategory/domain"
import { useProductCategoryOptions } from "@/modules/core/hooks/options"
import Modal from "@/modules/core/components/Modal"
import FormField from "@/modules/core/components/FormField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"

export default function ProductSubcategoryQuickCreateModal({
  open,
  onClose,
  onCreated,
  categoryId,
}) {
  const canOpen = Boolean(open && categoryId)

  useEffect(() => {
    if (open && !categoryId) {
      console.warn(
        "ProductSubcategoryQuickCreateModal: recusando abrir sem categoryId — escolha a categoria primeiro.",
      )
    }
  }, [open, categoryId])

  const { productCategories } = useProductCategoryOptions()
  const categoryName =
    productCategories.find((category) => String(category.id) === String(categoryId))?.name ?? ""

  const { form, onSubmit } = useResourceForm({
    schema: productSubcategorySchema,
    defaultValues: {
      ...productSubcategoryDefaults,
      category_id: categoryId ? String(categoryId) : "",
    },
    submit: (values) => ProductSubcategoryService.createProductSubcategory(values),
    redirectTo: null,
    onSuccess: (subcategory) => {
      onCreated?.(subcategory)
      onClose?.()
      form.reset()
    },
    invalidate: [
      productSubcategoryKeys.all,
      productCategoryKeys.subcategoriesByCategory(categoryId),
    ],
    errorFallback: "Erro ao criar subcategoria",
  })
  const {
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  useEffect(() => {
    setValue("category_id", categoryId ? String(categoryId) : "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId])

  function handleClose() {
    form.reset()
    onClose?.()
  }

  return (
    <Modal open={canOpen} onClose={handleClose} title="Cadastrar nova subcategoria">
      <form className="space-y-6" onSubmit={onSubmit}>
        <FormField label="Categoria" value={categoryName} disabled readOnly onChange={() => {}} />

        <FormField
          label="Nome"
          placeholder="Ex: Filtro de óleo"
          error={errors.name?.message}
          registration={register("name")}
        />

        <div className="pt-2 flex justify-end">
          <PrimaryButton type="submit" fullWidth={false} disabled={isSubmitting}>
            Salvar Subcategoria
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  )
}
