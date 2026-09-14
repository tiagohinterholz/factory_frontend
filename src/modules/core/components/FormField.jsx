import { useId } from "react"

// Aceita os dois modos:
//   - controlado (legado):   value + onChange
//   - react-hook-form:        registration={register("campo")}
// Atributos extras (step, min, readOnly, ...) passam direto pro <input>.
// Mostra `error` (string) com borda e mensagem em vermelho.
// `datalist` (array de string): sugestões pré-populadas — continua um campo
// de texto livre, só ganha autocomplete nativo (<input list="...">) com as
// opções mais comuns (ex.: cor do veículo, complemento de endereço).
export default function FormField({
  label,
  type = "text",
  placeholder,
  error,
  value,
  onChange,
  registration,
  datalist,
  ...rest
}) {
  const inputProps = registration ?? { value, onChange }
  const datalistId = useId()

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
        list={datalist ? datalistId : undefined}
        {...inputProps}
        {...rest}
      />
      {datalist && (
        <datalist id={datalistId}>
          {datalist.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      )}
      {error && <span className="mt-1 text-xs text-danger">{error}</span>}
    </div>
  )
}
