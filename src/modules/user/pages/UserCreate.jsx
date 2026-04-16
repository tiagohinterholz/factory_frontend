import { useUserForm } from "@/modules/user/hooks/useUserForm"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { UserPlus, Save, Lock } from "lucide-react"

export default function UserCreate() {
  const {
    email, setEmail,  
    name, setName,
    business, setBusiness,
    role, setRole,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    handleSubmit
  } = useUserForm()

  const { business: businesses } = useBusiness()
  
  const userStr = localStorage.getItem("user") || "{}"
  const loggedUser = JSON.parse(userStr)
  const isSuperUser = !loggedUser.business_id
  const loggedRole = loggedUser.role

  const businessOptions = businesses?.map(b => ({
    id: b.id,
    name: b.corporate_name
  })) || []

  const roleOptions = [
    ...(isSuperUser ? [{ id: 'admin', name: 'Administrador' }] : []),
    { id: 'colaborador', name: 'Colaborador' }
  ].filter(option => {
    if (isSuperUser) return true;
    if (loggedRole === 'admin') return option.id === 'colaborador';
    return false;
  })

  return (
    <div className="p-6 space-y-6">
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Novo Usuário</h1>
        <p className="text-slate-400 font-medium text-sm mb-8 uppercase tracking-[0.15em]">Cadastre os dados de acesso</p>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Dados Cadastrais</h3>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João da Silva"
                required
              />
              <FormField 
                label="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="joao@empresa.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField 
                label="Perfil (Role)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                options={roleOptions}
                required
              />
              
              {isSuperUser ? (
                <SelectField 
                  label="Empreendimento"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  options={businessOptions}
                  required
                />
              ) : (
                <FormField 
                    label="Empreendimento"
                    value={loggedUser.business?.name || "Meu Empreendimento"}
                    onChange={() => {}}
                    readOnly
                />
              )}
            </div>

            <div className="pt-6 pb-2">
               <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 tracking-tight">Credenciais (Senha)</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
              <FormField 
                label="Confirmar Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                required
              />
            </div>

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Save} fullWidth={false}>
                Salvar Usuário
              </PrimaryButton>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
