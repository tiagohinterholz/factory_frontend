export default function FormField({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div className="flex flex-col group">
      <label className="label-premium group-focus-within:text-indigo-600 transition duration-300">
        {label}
      </label>
      <input
        type={type}
        className="input-premium shadow-sm shadow-slate-200/50"
        value={value}
        onChange={onChange}
        placeholder={placeholder || `Digite o(a) ${label?.toLowerCase()}`}
      />
    </div>
  )
}
