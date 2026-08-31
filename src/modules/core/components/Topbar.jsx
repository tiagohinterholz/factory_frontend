import { useNavigate } from "react-router-dom"
import { useAuth } from "@/modules/auth/context/auth-context"
import { LogOut, Bell, User, Menu } from "lucide-react"

export default function Topbar({ onOpenMobile }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  async function handleLogout() {
    await logout()
    navigate("/")
  }

  return (
    <header className="h-20 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          aria-label="Abrir menu"
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-brand transition duration-300"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Sistema de Gestão</h2>
          <p className="hidden sm:block text-[11px] text-slate-400 font-medium uppercase tracking-[0.2em]">
            Painel de Controle
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-brand transition duration-300">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-100"></div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-sm font-bold text-slate-700 leading-none">{user?.email}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
              {user?.role || "Colaborador"}
            </span>
          </div>

          <div className="relative group">
            <button className="w-10 h-10 bg-brand-subtle border border-line rounded-lg flex items-center justify-center text-brand transition-colors group-hover:bg-brand group-hover:text-brand-fg">
              <User className="w-6 h-6" />
            </button>

            <div className="absolute right-0 top-full mt-3 w-48 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-50 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-danger-subtle hover:text-danger rounded-xl transition duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-semibold">Sair do Sistema</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
