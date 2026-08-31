// Mesmo esquema do FormField: value/onChange (legado) OU registration (rhf) + error.
export default function SelectField({ label, options = [], error, value, onChange, registration }) {
  const selectProps = registration ?? { value, onChange }

  return (
    <div className="flex flex-col group">
      <label className="label-premium group-focus-within:text-indigo-600 transition duration-300">
        {label}
      </label>
      <div className="relative">
        <select
          className={`input-premium appearance-none pr-10 cursor-pointer shadow-sm shadow-slate-200/50 ${
            error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10" : ""
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
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition duration-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <span className="mt-1 text-xs font-medium text-rose-500">{error}</span>}
    </div>
  )
}
