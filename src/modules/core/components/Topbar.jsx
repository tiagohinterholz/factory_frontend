import { Logout } from "@/modules/auth/services/auth"
import { useNavigate } from "react-router-dom"

export default function Topbar() {
  const navigate = useNavigate()
  function handleLogout() {
    Logout()
    navigate('/')
  }

  return (
    <header className="w-full bg-white border-b px-6 py-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-800">Painel Administrativo</h2>

      <button
        onClick={handleLogout}
        className="text-red-600 hover:text-red-800 font-semibold"
      >
        Sair
      </button>
    </header>
  )
}