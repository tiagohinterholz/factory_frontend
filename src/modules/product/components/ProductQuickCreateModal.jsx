import { useState } from "react"
import { Save } from "lucide-react"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import Modal from "@/modules/core/components/Modal"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { useProductForm } from "@/modules/product/hooks/useProductForm"
import ProductFormFields from "./ProductFormFields"
import ProductFinancialEntryModal from "./ProductFinancialEntryModal"

export default function ProductQuickCreateModal({ open, onClose, onCreated }) {
  const { canCreateFinancialEntry } = usePermissions()
  const [createdProduct, setCreatedProduct] = useState(null)

  const { form, onSubmit } = useProductForm({
    redirectTo: null,
    onSuccess: (product) => {
      form.reset()
      onCreated?.(product)
      if (canCreateFinancialEntry) {
        setCreatedProduct(product)
      } else {
        onClose?.()
      }
    },
  })
  const {
    formState: { isSubmitting },
  } = form

  function handleClose() {
    form.reset()
    onClose?.()
  }

  function finishFinancialStep() {
    setCreatedProduct(null)
    onClose?.()
  }

  return (
    <>
      <Modal
        open={open && !createdProduct}
        onClose={handleClose}
        title="Cadastrar novo produto"
        maxWidth="max-w-2xl"
      >
        <form className="space-y-6" onSubmit={onSubmit}>
          <ProductFormFields form={form} />

          <div className="pt-2 flex justify-end">
            <PrimaryButton type="submit" icon={Save} fullWidth={false} disabled={isSubmitting}>
              Salvar produto
            </PrimaryButton>
          </div>
        </form>
      </Modal>
      <ProductFinancialEntryModal
        open={Boolean(createdProduct)}
        product={createdProduct}
        onClose={finishFinancialStep}
      />
    </>
  )
}
