// Mesmo esquema do FormField: value/onChange (legado) OU registration (rhf) + error.
export default function SelectField({ label, options = [], error, value, onChange, registration }) {
  const selectProps = registration ?? { value, onChange }

  return (
    <div className="flex flex-col group">
      <label className="label-premium group-focus-within:text-brand transition-colors">
        {label}
      </label>
      <div className="relative">
        <select
          className={`input-premium appearance-none pr-10 cursor-pointer ${
            error ? "border-danger focus:border-danger focus:ring-danger/15" : ""
          }`}
          {...selectProps}
        >
          <option value="">Selecione o(a) {label?.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted group-focus-within:text-brand transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <span className="mt-1 text-xs text-danger">{error}</span>}
    </div>
  )
}
