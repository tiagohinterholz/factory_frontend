import { Link } from "react-router-dom"

export default function ListHeader({ title, buttonText, buttonLink }) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">{title}</h1>

      <Link 
        to={buttonLink}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {buttonText}
      </Link>
    </div>
  )
}