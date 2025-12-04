import { Link } from "react-router-dom";
import { useState } from "react"
  

export default function Sidebar() {
  const [locationOpen, setLocationOpen] = useState(false)

  return (
    <aside className="w-64 h-screen bg-white border-r flex flex-col p-6 fixed left-0 top-0">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">THDev</h1>

      <nav className="space-y-4 text-gray-700">

        <Link to="/dashboard" className="block hover:text-blue-600">
          Dashboard
        </Link>

        <Link to="/orcamentos" className="block hover:text-blue-600">
          Orçamentos
        </Link>

        <Link to="/empreendimentos" className="block hover:text-blue-600">
          Empreendimentos
        </Link>

        <Link to="/clientes" className="block hover:text-blue-600">
          Clientes
        </Link>

        <Link to="/veiculos" className="block hover:text-blue-600">
          Veículos
        </Link>

        <div>
          <button 
            onClick={() => setLocationOpen(!locationOpen)}
            className="w-full flex justify-between items-center hover:text-blue-600"
          >
            <span>Localização</span>
            <span>{locationOpen ? "▲" : "▼"}</span>
          </button>

          {locationOpen && (
            <div className="ml-4 mt-2 space-y-2 text-sm">
              <Link to="/estados" className="block hover:text-blue-600">
                Estados
              </Link>
              <Link to="/cidades" className="block hover:text-blue-600">
                Cidades
              </Link>
            </div>
          )}
        </div>

        <Link to="/ordens" className="block hover:text-blue-600">
          Ordens de Serviço
        </Link>

        <Link to="/produtos" className="block hover:text-blue-600">
          Produtos
        </Link>

        <Link to="/fornecedores" className="block hover:text-blue-600">
          Fornecedores
        </Link>

        <Link to="/servicos" className="block hover:text-blue-600">
          Serviços
        </Link>

        <Link to="/agendamentos" className="block hover:text-blue-600">
          Agendamentos
        </Link>

      </nav>
    </aside>
  );
}
