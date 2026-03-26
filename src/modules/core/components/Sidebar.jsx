import { Link, useLocation } from "react-router-dom";
import { useState } from "react"
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
  Settings
} from "lucide-react"
  
const navItems = [
  { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
  { path: "/orcamentos", name: "Orçamentos", icon: TrendingUp },
  { path: "/empreendimentos", name: "Empreendimentos", icon: Briefcase },
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

export default function Sidebar() {
  const [locationOpen, setLocationOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <aside className="w-72 h-screen bg-slate-900 border-r border-white/5 flex flex-col p-6 fixed left-0 top-0 shadow-2xl z-50">
      
      {/* Logo Section */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Factory className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight leading-none">THDev</h1>
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1 block">Factory System</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar pr-1 scrollbar-thin">
        
        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Principal</p>
        
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition duration-300 group ${
              isActive(item.path) 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                : "text-slate-400 hover:bg-slate-800 hover:text-indigo-400"
            }`}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive(item.path) ? "text-white" : "text-slate-500 group-hover:text-indigo-400"}`} />
            <span className="font-medium text-[15px]">{item.name}</span>
          </Link>
        ))}

        {/* Dropdown Section */}
        <div className="pt-2">
          <button 
            onClick={() => setLocationOpen(!locationOpen)}
            className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition duration-300 group ${
              locationOpen || isActive("/estados") || isActive("/cidades")
                ? "text-indigo-400 bg-slate-800/50"
                : "text-slate-400 hover:bg-slate-800 hover:text-indigo-400"
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin className={`w-5 h-5 ${locationOpen || isActive("/estados") ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400"}`} />
              <span className="font-medium text-[15px]">Localização</span>
            </div>
            {locationOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {locationOpen && (
            <div className="ml-9 mt-1.5 space-y-1 border-l border-slate-800 pl-4 py-1">
              <Link to="/estados" className={`block py-2 text-sm transition duration-300 ${isActive("/estados") ? "text-white font-medium" : "text-slate-500 hover:text-indigo-400"}`}>
                Estados
              </Link>
              <Link to="/cidades" className={`block py-2 text-sm transition duration-300 ${isActive("/cidades") ? "text-white font-medium" : "text-slate-500 hover:text-indigo-400"}`}>
                Cidades
              </Link>
            </div>
          )}
        </div>

        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 mb-2">Serviços & Catálogos</p>
        
        {servicesItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition duration-300 group ${
              isActive(item.path) 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                : "text-slate-400 hover:bg-slate-800 hover:text-indigo-400"
            }`}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive(item.path) ? "text-white" : "text-slate-500 group-hover:text-indigo-400"}`} />
            <span className="font-medium text-[15px]">{item.name}</span>
          </Link>
        ))}

      </nav>

      <div className="mt-8 pt-6 border-t border-white/5">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white hover:bg-slate-800 transition duration-300 rounded-xl group">
          <Settings className="w-5 h-5 group-hover:rotate-45 duration-500" />
          <span className="font-medium">Configurações</span>
        </button>
      </div>

    </aside>
  );
}
