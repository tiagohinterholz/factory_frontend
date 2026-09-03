import { Settings as SettingsIcon } from "lucide-react"

export default function Settings() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-ink tracking-tight">Configurações</h1>
      <p className="text-sm text-muted mt-1">Preferências da sua conta</p>

      <div className="mt-8 max-w-lg rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
        <div className="mx-auto w-12 h-12 rounded-xl bg-brand-subtle text-brand grid place-items-center">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <h2 className="mt-4 font-semibold text-ink">Em construção</h2>
        <p className="mt-2 text-sm text-muted">
          A tela de configurações da conta ainda está sendo desenvolvida.
        </p>
      </div>
    </div>
  )
}
