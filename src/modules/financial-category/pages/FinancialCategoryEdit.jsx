import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Edit2, Layers, Tag, Trash2 } from "lucide-react"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import BackLink from "@/modules/core/components/BackLink"
import FormField from "@/modules/core/components/FormField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import { FinancialCategoryService } from "../services/financial-category"
import {
  financialCategoryDefaults,
  financialCategoryKeys,
  financialCategorySchema,
} from "../domain"

export default function FinancialCategoryEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canManageFinancialCategories } = usePermissions()
  const [isSystem, setIsSystem] = useState(false)

  const { form, onSubmit, loading } = useResourceForm({
    schema: financialCategorySchema,
    defaultValues: financialCategoryDefaults,
    load: async () => {
      const data = await FinancialCategoryService.getCategory(id)
      setIsSystem(Boolean(data.is_system))
      return { name: data.name ?? "", is_active: data.is_active ?? true }
    },
    submit: (values) => FinancialCategoryService.updateCategory(id, values),
    invalidate: [financialCategoryKeys.all],
    errorFallback: "Erro ao atualizar categoria",
  })

  const remove = useResourceAction({
    mutationFn: () => FinancialCategoryService.deleteCategory(id),
    confirm: {
      title: "Excluir categoria?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    },
    invalidate: [financialCategoryKeys.all],
    onSuccess: () => navigate("/financeiro/categorias"),
    errorFallback: "Erro ao excluir categoria",
  })

  const {
    register,
    formState: { errors, isSubmitting },
  } = form
  const readOnly = !canManageFinancialCategories

  if (loading) {
    return <p className="p-6 text-slate-500 font-medium">Carregando...</p>
  }

  return (
    <div className="p-6 space-y-6">
      <BackLink to="/financeiro/categorias" />
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">
            {readOnly ? "Categoria" : "Editar Categoria"}
          </h1>
          <p className="text-slate-400 font-medium text-sm">
            {isSystem
              ? "Categoria do sistema: pode ser desativada, não renomeada nem excluída"
              : "Categoria financeira"}
          </p>
        </div>
        {!readOnly && !isSystem && (
          <button
            type="button"
            onClick={remove.run}
            className="flex items-center gap-2 px-4 py-2 text-danger hover:bg-danger-subtle rounded-xl font-bold text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Tag className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Cadastro de Categoria</h3>
          </div>
          <form className="space-y-6" onSubmit={onSubmit}>
            <FormField
              label="Nome da Categoria *"
              disabled={readOnly || isSystem}
              error={errors.name?.message}
              registration={register("name")}
            />
            <label className="flex items-center gap-3 text-sm font-medium text-ink">
              <input
                type="checkbox"
                disabled={readOnly}
                className="w-4 h-4 rounded border-line text-brand focus:ring-brand"
                {...register("is_active")}
              />
              Categoria ativa
            </label>
            {!readOnly && (
              <div className="pt-4 flex justify-end">
                <PrimaryButton type="submit" icon={Edit2} fullWidth={false} disabled={isSubmitting}>
                  Salvar Alterações
                </PrimaryButton>
              </div>
            )}
          </form>
        </div>

        <div className="lg:col-span-5 card-premium">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Subcategorias</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            As subcategorias dessa categoria ficam na listagem padrão de subcategorias financeiras.
          </p>
          <Link
            to="/subcategorias-financeiro"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-fg hover:bg-brand-hover transition-colors"
          >
            Ver subcategorias financeiras
          </Link>
        </div>
      </div>
    </div>
  )
}
