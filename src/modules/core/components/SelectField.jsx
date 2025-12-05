export default function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block mb-1">{label}</label>
      <select
        className="border p-2 rounded w-full"
        value={value}
        onChange={onChange}
      >
      <option value="">Selecione a opção</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
            {option.name}
        </option>
      ))}
      </select>
    </div>
  )
}
