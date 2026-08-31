import { Link, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Car,
  MapPin,
  ClipboardList,
  Package,
  Factory,
  Hammer,
  Calendar,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react"

const navItems = [
  { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
  { path: "/orcamentos", name: "Orçamentos", icon: TrendingUp },
  { path: "/clientes", name: "Clientes", icon: Users },
  { path: "/veiculos", name: "Veículos", icon: Car },
]

const servicesItems = [
  { path: "/ordens", name: "Ordens de Serviço", icon: ClipboardList },
  { path: "/produtos", name: "Produtos", icon: Package },
  { path: "/fornecedores", name: "Fornecedores", icon: Factory },
  { path: "/servicos", name: "Serviços", icon: Hammer },
  { path: "/agendamentos", name: "Agendamentos", icon: Calendar },
]

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const location = useLocation()
  const { canManageLicenses, canManageUsers } = usePermissions()
  const [locationOpen, setLocationOpen] = useState(
    location.pathname.startsWith("/estados") || location.pathname.startsWith("/cidades"),
  )
  const [businessOpen, setBusinessOpen] = useState(location.pathname.startsWith("/empreendimentos"))

  const isActive = (path) => location.pathname.startsWith(path)

  // Esc fecha o drawer no mobile
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (event) => {
      if (event.key === "Escape") onCloseMobile()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [mobileOpen, onCloseMobile])

  // Recolhida, clicar num grupo re-expande a sidebar e abre o grupo.
  const handleGroup = (setter) => () => {
    if (collapsed) {
      onToggleCollapse()
      setter(true)
    } else {
      setter((current) => !current)
    }
  }

  const renderNavItem = ({ path, name, icon: Icon }) => (
    <Link
      key={path}
      to={path}
      onClick={onCloseMobile}
      title={collapsed ? name : undefined}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition duration-300 group ${
        collapsed ? "lg:justify-center lg:px-0" : ""
      } ${
        isActive(path)
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
          : "text-slate-400 hover:bg-slate-800 hover:text-indigo-400"
      }`}
    >
      <Icon
        className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
          isActive(path) ? "text-white" : "text-slate-500 group-hover:text-indigo-400"
        }`}
      />
      <span className={`font-medium text-[15px] ${collapsed ? "lg:hidden" : ""}`}>{name}</span>
    </Link>
  )

  const renderGroupButton = (label, Icon, open, activePaths, onClick) => {
    const highlighted = open || activePaths.some((path) => isActive(path))
    return (
      <button
        onClick={onClick}
        title={collapsed ? label : undefined}
        className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition duration-300 group ${
          collapsed ? "lg:justify-center lg:px-0" : ""
        } ${
          highlighted
            ? "text-indigo-400 bg-slate-800/50"
            : "text-slate-400 hover:bg-slate-800 hover:text-indigo-400"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={`w-5 h-5 shrink-0 ${
              highlighted ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400"
            }`}
          />
          <span className={`font-medium text-[15px] ${collapsed ? "lg:hidden" : ""}`}>{label}</span>
        </div>
        <span className={collapsed ? "lg:hidden" : ""}>
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
      </button>
    )
  }

  const subLinkClass = (activeCondition) =>
    `block py-2 text-sm transition duration-300 ${
      activeCondition ? "text-white font-medium" : "text-slate-500 hover:text-indigo-400"
    }`

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen z-50 bg-slate-900 border-r border-white/5 flex flex-col p-6 shadow-2xl transition-all duration-300 w-72 ${
          collapsed ? "lg:w-20 lg:px-3" : "lg:w-72"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <button
          onClick={onCloseMobile}
          aria-label="Fechar menu"
          className="lg:hidden absolute top-5 right-5 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div
          className={`flex items-center gap-3 mb-10 px-2 ${
            collapsed ? "lg:px-0 lg:justify-center" : ""
          }`}
        >
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
            <Factory className="text-white w-6 h-6" />
          </div>
          <div className={collapsed ? "lg:hidden" : ""}>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">THDev</h1>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1 block">
              Factory System
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar pr-1 scrollbar-thin">
          <p
            className={`px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            Principal
          </p>

          {navItems.map(renderNavItem)}

          {/* Empreendimentos */}
          <div className="pt-2">
            {renderGroupButton(
              "Empreendimentos",
              Briefcase,
              businessOpen,
              ["/empreendimentos"],
              handleGroup(setBusinessOpen),
            )}

            {businessOpen && !collapsed && (
              <div className="ml-9 mt-1.5 space-y-1 border-l border-slate-800 pl-4 py-1">
                <Link
                  to="/empreendimentos"
                  onClick={onCloseMobile}
                  className={subLinkClass(
                    isActive("/empreendimentos") &&
                      !location.pathname.includes("/licencas") &&
                      !location.pathname.includes("/usuarios"),
                  )}
                >
                  Gestão
                </Link>
                {canManageLicenses && (
                  <Link
                    to="/empreendimentos/licencas"
                    onClick={onCloseMobile}
                    className={subLinkClass(isActive("/empreendimentos/licencas"))}
                  >
                    Licenças
                  </Link>
                )}
                {canManageUsers && (
                  <Link
                    to="/usuarios"
                    onClick={onCloseMobile}
                    className={subLinkClass(isActive("/usuarios"))}
                  >
                    Usuários
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Localização */}
          <div className="pt-2">
            {renderGroupButton(
              "Localização",
              MapPin,
              locationOpen,
              ["/estados", "/cidades"],
              handleGroup(setLocationOpen),
            )}

            {locationOpen && !collapsed && (
              <div className="ml-9 mt-1.5 space-y-1 border-l border-slate-800 pl-4 py-1">
                <Link
                  to="/estados"
                  onClick={onCloseMobile}
                  className={subLinkClass(isActive("/estados"))}
                >
                  Estados
                </Link>
                <Link
                  to="/cidades"
                  onClick={onCloseMobile}
                  className={subLinkClass(isActive("/cidades"))}
                >
                  Cidades
                </Link>
              </div>
            )}
          </div>

          <p
            className={`px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 mb-2 ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            Serviços & Catálogos
          </p>

          {servicesItems.map(renderNavItem)}
        </nav>

        <div className="mt-8 pt-6 border-t border-white/5 space-y-1">
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            aria-expanded={!collapsed}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            className={`hidden lg:flex w-full items-center gap-3 px-4 py-3 text-slate-500 hover:text-white hover:bg-slate-800 transition duration-300 rounded-xl ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-5 h-5 shrink-0" />
            ) : (
              <PanelLeftClose className="w-5 h-5 shrink-0" />
            )}
            <span className={collapsed ? "lg:hidden" : ""}>Recolher menu</span>
          </button>

          <button
            title={collapsed ? "Configurações" : undefined}
            className={`w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white hover:bg-slate-800 transition duration-300 rounded-xl group ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <Settings className="w-5 h-5 shrink-0 group-hover:rotate-45 duration-500" />
            <span className={`font-medium ${collapsed ? "lg:hidden" : ""}`}>Configurações</span>
          </button>
        </div>
      </aside>
    </>
  )
}
