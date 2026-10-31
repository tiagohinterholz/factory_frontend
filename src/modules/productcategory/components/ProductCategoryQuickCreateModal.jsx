import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { ProductCategoryService } from "@/modules/productcategory"
import {
  productCategorySchema,
  productCategoryDefaults,
  productCategoryKeys,
} from "@/modules/productcategory/domain"
import Modal from "@/modules/core/components/Modal"
import FormField from "@/modules/core/components/FormField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"

export default function ProductCategoryQuickCreateModal({ open, onClose, onCreated }) {
  const { form, onSubmit } = useResourceForm({
    schema: productCategorySchema,
    defaultValues: productCategoryDefaults,
    submit: (values) => ProductCategoryService.createProductCategory(values),
    redirectTo: null,
    onSuccess: (category) => {
      onCreated?.(category)
      onClose?.()
      form.reset()
    },
    invalidate: [productCategoryKeys.all],
    errorFallback: "Erro ao criar categoria",
  })
  const {
    register,
    formState: { errors, isSubmitting },
  } = form

  function handleClose() {
    form.reset()
    onClose?.()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Cadastrar nova categoria">
      <form className="space-y-6" onSubmit={onSubmit}>
        <FormField
          label="Nome"
          placeholder="Ex: Pneus"
          error={errors.name?.message}
          registration={register("name")}
        />

        <div className="pt-2 flex justify-end">
          <PrimaryButton type="submit" fullWidth={false} disabled={isSubmitting}>
            Salvar Categoria
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  )
}
