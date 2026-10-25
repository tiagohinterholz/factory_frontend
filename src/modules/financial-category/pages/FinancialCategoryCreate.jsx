import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import BackLink from "@/modules/core/components/BackLink"
import FormField from "@/modules/core/components/FormField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Tag, Save } from "lucide-react"
import { FinancialCategoryService } from "../services/financial-category"
import {
  financialCategoryDefaults,
  financialCategoryKeys,
  financialCategorySchema,
} from "../domain"

export default function FinancialCategoryCreate() {
  const { form, onSubmit } = useResourceForm({
    schema: financialCategorySchema,
    defaultValues: financialCategoryDefaults,
    submit: (values) => FinancialCategoryService.createCategory(values),
    redirectTo: (category) => `/financeiro/categorias/${category.id}`,
    invalidate: [financialCategoryKeys.all],
    errorFallback: "Erro ao criar categoria",
  })
  const {
    register,
    formState: { errors, isSubmitting },
  } = form

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-xl mx-auto">
        <BackLink to="/financeiro/categorias" />
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Nova Categoria</h1>
        <p className="text-slate-400 font-medium text-sm mb-8">
          Organize entradas e saídas do financeiro
        </p>
        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Tag className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Cadastro de Categoria</h3>
          </div>
          <form className="space-y-6" onSubmit={onSubmit}>
            <FormField
              label="Nome da Categoria *"
              placeholder="Ex: Marketing"
              error={errors.name?.message}
              registration={register("name")}
            />
            <div className="pt-4">
              <PrimaryButton type="submit" icon={Save} disabled={isSubmitting}>
                Salvar Categoria
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
