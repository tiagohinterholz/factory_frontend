import { useUserForm } from "@/modules/user/hooks/useUserForm"
import { useUserFormOptions } from "@/modules/user/hooks/useUserFormOptions"
import BackLink from "@/modules/core/components/BackLink"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import PasswordFields from "@/modules/user/components/PasswordFields"
import { UserPlus, Save, Lock } from "lucide-react"

export default function UserCreate() {
  const { form, onSubmit } = useUserForm()
  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const { isSuperUser, businessOptions, currentBusinessName, loadingBusinesses, roleOptions } =
    useUserFormOptions()

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <BackLink to="/usuarios" />
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Novo Usuário</h1>
        <p className="text-slate-400 font-medium text-sm mb-8">Cadastre os dados de acesso</p>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Dados Cadastrais</h3>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Nome Completo"
                placeholder="Ex: João da Silva"
                error={errors.name?.message}
                registration={register("name")}
              />
              <FormField
                label="E-mail"
                type="email"
                placeholder="joao@empresa.com"
                error={errors.email?.message}
                registration={register("email")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Perfil (Role)"
                options={roleOptions}
                error={errors.role?.message}
                registration={register("role")}
              />

              {isSuperUser ? (
                <SelectField
                  label="Empreendimento"
                  options={businessOptions}
                  error={errors.business_id?.message}
                  registration={register("business_id")}
                />
              ) : (
                <FormField
                  label="Empreendimento"
                  value={currentBusinessName || (loadingBusinesses ? "Carregando…" : "—")}
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

            <PasswordFields register={register} watch={watch} setValue={setValue} errors={errors} />

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Save} fullWidth={false} disabled={isSubmitting}>
                Salvar Usuário
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
