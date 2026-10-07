import { useNavigate, useParams } from "react-router-dom"
import BackLink from "@/modules/core/components/BackLink"
import FormField from "@/modules/core/components/FormField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import RelatedDataCard from "@/modules/core/components/RelatedDataCard"
import { useProductCategoryEditForm } from "@/modules/productcategory/hooks/useProductCategoryEditForm"
import { useProductSubcategoryOptionsByCategory } from "@/modules/core/hooks/options"
import { Tag, Layers, Trash2, Edit2 } from "lucide-react"

export default function ProductCategoryEdit() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { form, onSubmit, loading, handleDelete } = useProductCategoryEditForm()
  const {
    register,
    formState: { errors, isSubmitting },
  } = form

  const { subcategoriesByCategory, loading: loadingSubcategories } =
    useProductSubcategoryOptionsByCategory(id)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <BackLink to="/categorias-produto" />
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Editar Categoria</h1>
          <p className="text-slate-400 font-medium text-sm">Gestão do catálogo de produtos</p>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 text-danger hover:bg-danger-subtle rounded-xl transition duration-300 font-bold text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Excluir
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <div className="card-premium">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
              <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
                <Tag className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 tracking-tight">Cadastro de Categoria</h3>
            </div>

            <form className="space-y-6" onSubmit={onSubmit}>
              <FormField
                label="Nome da Categoria"
                error={errors.name?.message}
                registration={register("name")}
              />

              <label className="flex items-center gap-3 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-line text-brand focus:ring-brand"
                  {...register("is_active")}
                />
                Categoria ativa
              </label>

              <div className="pt-4 flex justify-end">
                <PrimaryButton type="submit" icon={Edit2} fullWidth={false} disabled={isSubmitting}>
                  Salvar Alterações
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-5">
          <RelatedDataCard
            title="Subcategorias Vinculadas"
            icon={Layers}
            items={subcategoriesByCategory.map((subcategory) => ({
              id: subcategory.id,
              name: subcategory.name,
              subtitle: "Subcategoria",
            }))}
            loading={loadingSubcategories}
            emptyMessage="Esta categoria ainda não possui subcategorias cadastradas."
            onAddClick={() =>
              navigate("/subcategorias-produto/novo", { state: { categoryId: id } })
            }
            renderItem={(item) => (
              <div
                onClick={() => navigate(`/subcategorias-produto/${item.id}`)}
                className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between group cursor-pointer transition duration-300 hover:bg-white hover:border-line hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-brand transition duration-300 shadow-sm border border-slate-100">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm group-hover:text-brand transition duration-300">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}
