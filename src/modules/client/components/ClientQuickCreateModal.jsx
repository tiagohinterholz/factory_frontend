import { useClientForm } from "@/modules/client/hooks/useClientForm"
import Modal from "@/modules/core/components/Modal"
import FormField from "@/modules/core/components/FormField"
import MaskedField from "@/modules/core/components/MaskedField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import ClientTypeToggle from "@/modules/client/components/ClientTypeToggle"
import { useStateOptions, useCityOptionsByState } from "@/modules/core/hooks/options"
import { CPF_MASK, CNPJ_MASK, PHONE_MASK } from "@/modules/core/schemas/br-fields"

export default function ClientQuickCreateModal({ open, onClose, onCreated }) {
  const { form, onSubmit } = useClientForm({
    redirectTo: null,
    onSuccess: (client) => {
      onCreated?.(client)
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
  const clientType = watch("client_type")
  const isPJ = clientType === "PJ"

  const { states } = useStateOptions()
  const { citiesByState } = useCityOptionsByState(stateId)

  function handleClose() {
    form.reset()
    onClose?.()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Cadastrar novo cliente">
      <form className="space-y-6" onSubmit={onSubmit}>
        <ClientTypeToggle
          value={clientType}
          onChange={(nextType) => setValue("client_type", nextType)}
        />

        {isPJ ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Razão Social"
              placeholder="Ex: Frota Veloz Transportes Ltda"
              error={errors.corporate_name?.message}
              registration={register("corporate_name")}
            />
            <MaskedField
              control={control}
              name="cnpj"
              label="CNPJ"
              mask={CNPJ_MASK}
              placeholder="00.000.000/0000-00"
              error={errors.cnpj?.message}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Nome"
                placeholder="Ex: João"
                error={errors.first_name?.message}
                registration={register("first_name")}
              />
              <FormField
                label="Sobrenome"
                placeholder="Ex: Silva"
                error={errors.last_name?.message}
                registration={register("last_name")}
              />
            </div>
            <MaskedField
              control={control}
              name="cpf"
              label="CPF"
              mask={CPF_MASK}
              placeholder="000.000.000-00"
              error={errors.cpf?.message}
            />
          </>
        )}

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

        <MaskedField
          control={control}
          name="phone"
          label="Telefone"
          mask={PHONE_MASK}
          placeholder="(00) 00000-0000"
          error={errors.phone?.message}
        />

        <div className="pt-2 flex justify-end">
          <PrimaryButton type="submit" fullWidth={false} disabled={isSubmitting}>
            Salvar Cliente
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  )
}
