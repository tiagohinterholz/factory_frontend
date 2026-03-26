export default function SelectField({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col group">
      <label className="label-premium group-focus-within:text-indigo-600 transition duration-300">
        {label}
      </label>
      <div className="relative">
        <select
          className="input-premium appearance-none pr-10 cursor-pointer shadow-sm shadow-slate-200/50"
          value={value}
          onChange={onChange}
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
    </div>
  )
}
