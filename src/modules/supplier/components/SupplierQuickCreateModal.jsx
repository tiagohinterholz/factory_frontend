import { useSupplierForm } from "@/modules/supplier/hooks/useSupplierForm"
import Modal from "@/modules/core/components/Modal"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import MaskedField from "@/modules/core/components/MaskedField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { useStateOptions, useCityOptionsByState } from "@/modules/core/hooks/options"
import { CNPJ_MASK, PHONE_MASK } from "@/modules/core/schemas/br-fields"

export default function SupplierQuickCreateModal({ open, onClose, onCreated }) {
  const { form, onSubmit } = useSupplierForm({
    redirectTo: null,
    onSuccess: (supplier) => {
      onCreated?.(supplier)
      onClose?.()
      form.reset()
    },
  })
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const stateId = watch("state_id")
  const { states } = useStateOptions()
  const { citiesByState } = useCityOptionsByState(stateId)

  function handleClose() {
    form.reset()
    onClose?.()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Cadastrar novo fornecedor">
      <form className="space-y-6" onSubmit={onSubmit}>
        <FormField
          label="Razão Social"
          placeholder="Ex: Fornecedora de Insumos LTDA"
          error={errors.corporate_name?.message}
          registration={register("corporate_name")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MaskedField
            control={control}
            name="cnpj"
            label="CNPJ"
            mask={CNPJ_MASK}
            placeholder="00.000.000/0000-00"
            error={errors.cnpj?.message}
          />
          <FormField
            label="E-mail"
            type="email"
            placeholder="contato@fornecedor.com"
            error={errors.email?.message}
            registration={register("email")}
          />
        </div>

        <MaskedField
          control={control}
          name="phone"
          label="Telefone"
          mask={PHONE_MASK}
          placeholder="(00) 00000-0000"
          error={errors.phone?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            label="Estado"
            options={states}
            error={errors.state_id?.message}
            registration={register("state_id", {
              onChange: () => setValue("city_id", ""),
            })}
          />
          <SelectField
            label="Cidade"
            options={citiesByState}
            disabled={!stateId}
            disabledHint="Selecione o estado primeiro"
            error={errors.city_id?.message}
            registration={register("city_id")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <FormField
              label="Endereço"
              placeholder="Rua, Avenida, etc."
              error={errors.address?.message}
              registration={register("address")}
            />
          </div>
          <FormField
            label="Número"
            placeholder="123"
            error={errors.number?.message}
            registration={register("number")}
          />
        </div>

        <div className="pt-2 flex justify-end">
          <PrimaryButton type="submit" fullWidth={false} disabled={isSubmitting}>
            Salvar Fornecedor
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  )
}
