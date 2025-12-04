export default function PrimaryButton({ children, type = "button" }) {
  return (
    <button 
      type={type}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      {children}
    </button>
  )
}
