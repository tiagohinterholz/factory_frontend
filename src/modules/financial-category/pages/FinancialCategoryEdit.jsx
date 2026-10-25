import { useId, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { Edit2, Layers, Plus, Tag, Trash2 } from "lucide-react"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"
import BackLink from "@/modules/core/components/BackLink"
import FormField from "@/modules/core/components/FormField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import { FinancialCategoryService } from "../services/financial-category"
import { useFinancialSubcategoryOptions } from "../hooks/useFinancialCategories"
import {
  financialCategoryDefaults,
  financialCategoryKeys,
  financialCategorySchema,
} from "../domain"

export default function FinancialCategoryEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()
  const subcategoryInputId = useId()
  const { canManageFinancialCategories } = usePermissions()
  const [isSystem, setIsSystem] = useState(false)
  const [newSubcategory, setNewSubcategory] = useState("")
  const [savingSubcategory, setSavingSubcategory] = useState(false)
  const { subcategories, loading: loadingSubcategories } = useFinancialSubcategoryOptions(id)

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

  const removeSubcategory = useResourceAction({
    mutationFn: (item) => FinancialCategoryService.deleteSubcategory(item.id),
    confirm: (item) => ({
      title: "Excluir subcategoria?",
      message: `A subcategoria "${item.name}" será removida.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [financialCategoryKeys.subcategories(id)],
    errorFallback: "Erro ao excluir subcategoria",
  })

  const {
    register,
    formState: { errors, isSubmitting },
  } = form
  const readOnly = !canManageFinancialCategories

  async function handleAddSubcategory(event) {
    event.preventDefault()
    const name = newSubcategory.trim()
    if (!name || savingSubcategory) return
    setSavingSubcategory(true)
    try {
      await FinancialCategoryService.createSubcategory({ category_id: id, name, is_active: true })
      setNewSubcategory("")
      queryClient.invalidateQueries({ queryKey: financialCategoryKeys.subcategories(id) })
    } catch (apiError) {
      toast.error(parseApiError(apiError, "Erro ao adicionar subcategoria").message)
    } finally {
      setSavingSubcategory(false)
    }
  }

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
          {!readOnly && (
            <form onSubmit={handleAddSubcategory} className="flex items-end gap-2 mb-4">
              <div className="flex-1">
                <label htmlFor={subcategoryInputId} className="label-premium">
                  Nova subcategoria
                </label>
                <input
                  id={subcategoryInputId}
                  className="input-premium"
                  value={newSubcategory}
                  onChange={(event) => setNewSubcategory(event.target.value)}
                  placeholder="Ex: Energia elétrica"
                />
              </div>
              <button
                type="submit"
                disabled={savingSubcategory}
                title="Adicionar subcategoria"
                aria-label="Adicionar subcategoria"
                className="p-3 bg-brand text-white rounded-xl hover:bg-brand-hover disabled:opacity-50"
              >
                <Plus size={20} />
              </button>
            </form>
          )}
          {loadingSubcategories ? (
            <p className="text-sm text-slate-400">Carregando...</p>
          ) : subcategories.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma subcategoria cadastrada.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {subcategories.map((subcategory) => (
                <li key={subcategory.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{subcategory.name}</span>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => removeSubcategory.run(subcategory)}
                      title={`Excluir subcategoria ${subcategory.name}`}
                      aria-label={`Excluir subcategoria ${subcategory.name}`}
                      className="text-rose-400 hover:text-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
