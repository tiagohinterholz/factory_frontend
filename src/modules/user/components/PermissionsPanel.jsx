import { useState } from "react"
import { ShieldCheck, Loader2, Save } from "lucide-react"
import { useUserPermissions } from "@/modules/user/hooks/useUserPermissions"

function groupByModule(assignable) {
  const groups = new Map()
  for (const item of assignable) {
    if (!groups.has(item.module)) groups.set(item.module, [])
    groups.get(item.module).push(item)
  }
  return [...groups.entries()]
}

// Permissão extra de UM usuário específico, além do papel dele — só quem
// tem can_manage_permissions (Administrador) vê isto. Não é o mesmo que
// trocar o papel do usuário (isso é o campo "Perfil" logo acima): aqui é
// dar uma ação a mais sem promover a pessoa inteira pra outro papel.
export default function PermissionsPanel({ userId }) {
  const { assignable, loading, save, saving } = useUserPermissions(userId)

  if (loading) {
    return (
      <div className="card-premium mt-6">
        <div className="h-24 bg-ground rounded-xl animate-pulse"></div>
      </div>
    )
  }

  return <PermissionsChecklist assignable={assignable} save={save} saving={saving} />
}

// Só monta depois que `assignable` já chegou do servidor — inicializa o
// estado marcado uma vez a partir dele, sem precisar de efeito pra
// ressincronizar (o componente todo reflui do zero se o usuário editado
// mudar, porque o pai troca de tela).
function PermissionsChecklist({ assignable, save, saving }) {
  const [checked, setChecked] = useState(
    () => new Set(assignable.filter((item) => item.granted).map((item) => item.codename)),
  )
  const [dirty, setDirty] = useState(false)

  function toggle(codename) {
    setChecked((current) => {
      const next = new Set(current)
      if (next.has(codename)) next.delete(codename)
      else next.add(codename)
      return next
    })
    setDirty(true)
  }

  async function handleSave() {
    await save([...checked])
    setDirty(false)
  }

  return (
    <div className="card-premium mt-6">
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 tracking-tight">Permissões Extras</h3>
            <p className="text-xs text-muted mt-0.5">Ações liberadas além do que o Perfil já dá</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="btn-primary !py-2 disabled:opacity-60 disabled:pointer-events-none"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
        {groupByModule(assignable).map(([module, items]) => (
          <div key={module}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {module}
            </p>
            <div className="space-y-2">
              {items.map((item) => (
                <label
                  key={item.codename}
                  className="flex items-center gap-2.5 text-sm text-ink cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-line text-brand focus:ring-brand"
                    checked={checked.has(item.codename)}
                    onChange={() => toggle(item.codename)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
