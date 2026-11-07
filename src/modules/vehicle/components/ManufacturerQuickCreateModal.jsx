import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { ManufacturerService } from "@/modules/manufacturer"
import {
  manufacturerSchema,
  manufacturerDefaults,
  manufacturerKeys,
} from "@/modules/manufacturer/domain"
import Modal from "@/modules/core/components/Modal"
import FormField from "@/modules/core/components/FormField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"

export default function ManufacturerQuickCreateModal({ open, onClose, onCreated }) {
  const { form, onSubmit } = useResourceForm({
    schema: manufacturerSchema,
    defaultValues: manufacturerDefaults,
    submit: (values) => ManufacturerService.createManufacturer(values),
    redirectTo: null,
    onSuccess: (manufacturer) => {
      onCreated?.(manufacturer)
      onClose?.()
      form.reset()
    },
    invalidate: [manufacturerKeys.all],
    errorFallback: "Erro ao criar marca",
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
    <Modal open={open} onClose={handleClose} title="Cadastrar nova marca">
      <form className="space-y-6" onSubmit={onSubmit}>
        <FormField
          label="Nome"
          placeholder="Ex: Toyota"
          error={errors.name?.message}
          registration={register("name")}
        />

        <div className="pt-2 flex justify-end">
          <PrimaryButton type="submit" fullWidth={false} disabled={isSubmitting}>
            Salvar Marca
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  )
}
