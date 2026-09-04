import { useUserEditForm } from "@/modules/user/hooks/useUserEditForm"
import { useUserFormOptions } from "@/modules/user/hooks/useUserFormOptions"
import BackLink from "@/modules/core/components/BackLink"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import PasswordFields from "@/modules/user/components/PasswordFields"
import { UserCog, Edit2, Trash2, Lock } from "lucide-react"

export default function UserDetail() {
  const { form, onSubmit, loading, handleDelete } = useUserEditForm()
  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const { isSuperUser, businessOptions, currentBusinessName, loadingBusinesses, roleOptions } =
    useUserFormOptions()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <BackLink to="/usuarios" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Editar Usuário</h1>
            <p className="text-slate-400 font-medium text-sm">Dados de acesso e credenciais</p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-danger hover:bg-danger-subtle rounded-xl transition duration-300 font-bold text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Excluir Usuário
          </button>
        </div>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <UserCog className="w-5 h-5" />
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
                <h3 className="font-bold text-slate-800 tracking-tight">Alterar Senha</h3>
              </div>
            </div>

            <PasswordFields
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
              hint="Deixe em branco para manter a senha atual."
            />

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Edit2} fullWidth={false} disabled={isSubmitting}>
                Salvar Alterações
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
