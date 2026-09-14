import { Controller } from "react-hook-form"
import { formatMoney } from "@/modules/core/utils/format"

// Máscara monetária "de caixa eletrônico": cada dígito novo entra nos
// centavos e empurra o resto pra esquerda (digitar "15000" mostra
// "R$ 150,00"). O valor do form fica sempre em reais (150, não 15000),
// pronto pro payload — a formatação é só de exibição.
export default function MoneyField({ control, name, label, error, placeholder = "R$ 0,00" }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const cents = Math.round((Number(field.value) || 0) * 100)
        const display = cents === 0 ? "" : formatMoney(cents / 100)

        function handleChange(event) {
          const digits = event.target.value.replace(/\D/g, "")
          const nextCents = digits ? Number(digits) : 0
          field.onChange(nextCents / 100)
        }

        return (
          <div className="flex flex-col group">
            <label className="label-premium group-focus-within:text-brand transition-colors">
              {label}
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder={placeholder}
              className={`input-premium ${
                error ? "border-danger focus:border-danger focus:ring-danger/15" : ""
              }`}
              value={display}
              onChange={handleChange}
              onBlur={field.onBlur}
              ref={field.ref}
            />
            {error && <span className="mt-1 text-xs text-danger">{error}</span>}
          </div>
        )
      }}
    />
  )
}
