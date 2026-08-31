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
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col group">
          <label className="label-premium group-focus-within:text-indigo-600 transition duration-300">
            {label}
          </label>
          <InputMask
            mask={mask}
            replacement={replacement}
            placeholder={placeholder}
            className={`input-premium shadow-sm shadow-slate-200/50 ${
              error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10" : ""
            }`}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
          />
          {error && <span className="mt-1 text-xs font-medium text-rose-500">{error}</span>}
        </div>
      )}
    />
  )
}
