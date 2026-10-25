import { Controller } from "react-hook-form"
import { InputMask } from "@react-input/mask"

// Input com máscara ligado ao react-hook-form via Controller.
// Ex.: <MaskedField control={control} name="cpf" label="CPF"
//        mask="___.___.___-__" placeholder="000.000.000-00" error={errors.cpf?.message} />
export default function MaskedField({
  control,
  name,
  label,
  placeholder,
  error,
  mask,
  replacement = { _: /\d/ },
  disabled = false,
  uppercase = false,
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        function handleBlur(event) {
          if (uppercase && field.value) field.onChange(field.value.toUpperCase())
          field.onBlur(event)
        }

        return (
          <div className="flex flex-col group">
            <label className="label-premium group-focus-within:text-brand transition-colors">
              {label}
            </label>
            <InputMask
              mask={mask}
              replacement={replacement}
              placeholder={placeholder}
              disabled={disabled}
              className={`input-premium ${
                error ? "border-danger focus:border-danger focus:ring-danger/15" : ""
              }`}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={handleBlur}
              ref={field.ref}
            />
            {error && <span className="mt-1 text-xs text-danger">{error}</span>}
          </div>
        )
      }}
    />
  )
}
