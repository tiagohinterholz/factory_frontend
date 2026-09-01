import { Suspense, useState } from "react"
import { Outlet, useLocation, Link } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"
import { ErrorBoundary } from "@/modules/core/components/ErrorBoundary"
import PageLoader from "@/modules/core/components/PageLoader"

const COLLAPSED_KEY = "sidebar:collapsed"

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1"
  } catch {
    return false
  }
}

export default function DashboardLayout({ children }) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current
      try {
        localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0")
      } catch {
        // storage indisponível: mantém só em memória
      }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={`flex flex-col min-h-screen transition-[margin] duration-300 ${
          collapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
      >
        <Topbar onOpenMobile={() => setMobileOpen(true)} />

        <main className="p-4 sm:p-8 flex-1 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="max-w-[1400px] mx-auto">
            <ErrorBoundary key={location.pathname}>
              <Suspense fallback={<PageLoader />}>{children || <Outlet />}</Suspense>
            </ErrorBoundary>
          </div>
        </main>

        <footer className="p-6 text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest border-t border-slate-100 bg-white/50">
          © 2026 - THDev Factory System. Todos os direitos reservados.
          {" · "}
          <Link to="/privacidade" className="hover:text-slate-600">
            Aviso de Privacidade
          </Link>
        </footer>
      </div>
    </div>
  )
}
