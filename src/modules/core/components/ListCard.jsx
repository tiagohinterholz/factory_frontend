import { Link } from "react-router-dom"

export default function ListCard({ to, title, subtitle }) {
  return (
    <Link 
      to={to}
      className="border p-4 rounded hover:shadow"
    >
      <p className="font-semibold">{title}</p>
      {subtitle && (
        <p className="text-gray-600">{subtitle}</p>
      )}
    </Link>
  )
}
