import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-50 relative">
      
      <Sidebar />

      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Topbar />
        
        <main className="p-8 flex-1 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="max-w-[1400px] mx-auto">
            {children || <Outlet />}
          </div>
        </main>

        <footer className="p-6 text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest border-t border-slate-100 bg-white/50">
          © 2026 - THDev Factory System. Todos os direitos reservados.
        </footer>
      </div>

    </div>
  );
}
