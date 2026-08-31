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
      <label className="label-premium group-focus-within:text-indigo-600 transition duration-300">
        {label}
      </label>
      <input
        type={type}
        className={`input-premium shadow-sm shadow-slate-200/50 ${
          error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10" : ""
        }`}
        placeholder={placeholder || `Digite o(a) ${label?.toLowerCase()}`}
        {...inputProps}
        {...rest}
      />
      {error && <span className="mt-1 text-xs font-medium text-rose-500">{error}</span>}
    </div>
  )
}
