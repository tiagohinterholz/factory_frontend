// Aceita os dois modos:
//   - controlado (legado):   value + onChange
//   - react-hook-form:        registration={register("campo")}
// Atributos extras (step, min, readOnly, ...) passam direto pro <input>.
// Mostra `error` (string) com borda e mensagem em vermelho.
export default function FormField({
  label,
  type = "text",
  placeholder,
  error,
  value,
  onChange,
  registration,
  ...rest
}) {
  const inputProps = registration ?? { value, onChange }

  return (
    <div className="flex flex-col group">
      <label className="label-premium group-focus-within:text-brand transition-colors">
        {label}
      </label>
      <input
        type={type}
        className={`input-premium ${
          error ? "border-danger focus:border-danger focus:ring-danger/15" : ""
        }`}
        placeholder={placeholder || `Digite o(a) ${label?.toLowerCase()}`}
        {...inputProps}
        {...rest}
      />
      {error && <span className="mt-1 text-xs text-danger">{error}</span>}
    </div>
  )
}
