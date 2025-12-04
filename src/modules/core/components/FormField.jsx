export default function FormField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block mb-1">{label}</label>
      <input
        type={type}
        className="border p-2 rounded w-full"
        value={value}
        onChange={onChange}
      />
    </div>
  )
}
