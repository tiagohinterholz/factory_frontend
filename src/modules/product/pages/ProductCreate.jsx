import { useNavigate } from "react-router-dom"
import { useProductForm } from "@/modules/product/hooks/useProductForm"
import BackLink from "@/modules/core/components/BackLink"
import { useSupplierOptions } from "@/modules/core/hooks/options"
import { useProductOptions } from "@/modules/core/hooks/options"
import { useProductCategoryOptions } from "@/modules/core/hooks/options"
import { useProductSubcategoryOptionsByCategory } from "@/modules/core/hooks/options"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import MoneyField from "@/modules/core/components/MoneyField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { unitOfMeasureOptions } from "@/modules/product/constants/product"
import { Package, Save, Plus } from "lucide-react"

export default function ProductCreate() {
  const navigate = useNavigate()
  const { form, onSubmit } = useProductForm()
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const categoryId = watch("category_id")

  const { supplier: suppliers, loading: loadingSuppliers } = useSupplierOptions()
  const { product: products } = useProductOptions()
  const { productCategories, loading: loadingCategories } = useProductCategoryOptions()
  const { subcategoriesByCategory, loading: loadingSubcategories } =
    useProductSubcategoryOptionsByCategory(categoryId)

  const supplierOptions = suppliers.map((s) => ({ id: s.id, name: s.corporate_name }))
  // datalist de "Marca" pré-populado com as marcas já cadastradas em outros
  // produtos — continua texto livre, só facilita reaproveitar o mesmo nome.
  const brandOptions = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort()

  if (loadingSuppliers || loadingCategories) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <BackLink to="/produtos" />
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Novo Produto</h1>
        <p className="text-slate-400 font-medium text-sm mb-8">Cadastro de itens para estoque</p>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Dados do Produto</h3>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <SelectField
                    label="Fornecedor"
                    options={supplierOptions}
                    error={errors.supplier_id?.message}
                    registration={register("supplier_id")}
                  />
                </div>
                <button
                  type="button"
                  title="Cadastrar novo fornecedor"
                  onClick={() => navigate("/fornecedores/novo")}
                  className="h-[46px] w-[46px] shrink-0 grid place-items-center rounded-xl border border-line text-brand hover:bg-brand-subtle transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Nome do Produto"
                placeholder="Ex: Óleo 5W30"
                error={errors.name?.message}
                registration={register("name")}
              />
              <FormField
                label="Marca"
                placeholder="Ex: Castrol"
                datalist={brandOptions}
                error={errors.brand?.message}
                registration={register("brand")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Referência"
                placeholder="Ex: REF-123"
                error={errors.reference?.message}
                registration={register("reference")}
              />
              <FormField
                label="SKU / Código de Barras"
                placeholder="Ex: 7891234567890"
                error={errors.sku?.message}
                registration={register("sku")}
              />
            </div>

            <FormField
              label="Descrição"
              placeholder="Detalhes técnicos..."
              error={errors.description?.message}
              registration={register("description")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Categoria"
                options={productCategories}
                error={errors.category_id?.message}
                registration={register("category_id", {
                  onChange: () => setValue("subcategory_id", ""),
                })}
              />
              <SelectField
                label="Subcategoria"
                options={subcategoriesByCategory}
                disabled={!categoryId || loadingSubcategories}
                disabledHint="Selecione a categoria primeiro"
                error={errors.subcategory_id?.message}
                registration={register("subcategory_id")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Qtd em Estoque"
                type="number"
                error={errors.stock_quantity?.message}
                registration={register("stock_quantity")}
              />
              <SelectField
                label="Unidade de Medida"
                options={unitOfMeasureOptions}
                error={errors.unit_of_measure?.message}
                registration={register("unit_of_measure")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MoneyField
                control={control}
                name="unit_price"
                label="Preço Unitário"
                error={errors.unit_price?.message}
              />
              <MoneyField
                control={control}
                name="cost_price"
                label="Preço de Custo (opcional)"
                error={errors.cost_price?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Estoque Mínimo (opcional)"
                type="number"
                placeholder="Deixe em branco pra não alertar"
                error={errors.minimum_stock?.message}
                registration={register("minimum_stock")}
              />
              <FormField
                label="NCM (opcional)"
                placeholder="Ex: 87089900"
                error={errors.ncm?.message}
                registration={register("ncm")}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Save} fullWidth={false} disabled={isSubmitting}>
                Adicionar Produto
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
