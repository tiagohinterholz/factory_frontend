import { useNavigate, useParams } from "react-router-dom"
import { useProductEditForm } from "@/modules/product/hooks/useProductEditForm"
import BackLink from "@/modules/core/components/BackLink"
import RecordPdfButton from "@/modules/core/components/RecordPdfButton"
import { useSupplierOptions } from "@/modules/core/hooks/options"
import { useProductOptions } from "@/modules/core/hooks/options"
import { useProductCategoryOptions } from "@/modules/core/hooks/options"
import { useProductSubcategoryOptionsByCategory } from "@/modules/core/hooks/options"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import MoneyField from "@/modules/core/components/MoneyField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { ProductService } from "@/modules/product/services/product"
import { StockMovementHistory } from "@/modules/purchase"
import { unitOfMeasureOptions } from "@/modules/product/constants/product"
import { Package, Edit2, Trash2, Eye } from "lucide-react"

export default function ProductDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { form, onSubmit, loading, handleDelete } = useProductEditForm()
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const supplierId = watch("supplier_id")
  const categoryId = watch("category_id")
  const { supplier: suppliers, loading: loadingSuppliers } = useSupplierOptions()
  const { product: products } = useProductOptions()
  const { productCategories, loading: loadingCategories } = useProductCategoryOptions()
  const { subcategoriesByCategory, loading: loadingSubcategories } =
    useProductSubcategoryOptionsByCategory(categoryId)

  const supplierOptions = suppliers.map((s) => ({ id: s.id, name: s.corporate_name }))
  const brandOptions = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort()

  if (loading || loadingSuppliers || loadingCategories) {
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">
              Detalhes do Produto
            </h1>
            <p className="text-slate-400 font-medium text-sm">Gestão técnica de estoque</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RecordPdfButton
              request={() => ProductService.getProductPdf(id)}
              label="Exportar PDF"
            />
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-danger hover:bg-danger-subtle rounded-xl transition duration-300 font-bold text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Excluir Produto
            </button>
          </div>
        </div>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Informações do Produto</h3>
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
                  title="Ver / editar fornecedor vinculado"
                  disabled={!supplierId}
                  onClick={() => navigate(`/fornecedores/${supplierId}`)}
                  className="h-[46px] w-[46px] shrink-0 grid place-items-center rounded-xl border border-line text-muted hover:text-ink hover:bg-ground transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Nome"
                error={errors.name?.message}
                registration={register("name")}
              />
              <FormField
                label="Marca"
                datalist={brandOptions}
                error={errors.brand?.message}
                registration={register("brand")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Referência"
                error={errors.reference?.message}
                registration={register("reference")}
              />
              <FormField
                label="SKU / Código de Barras"
                error={errors.sku?.message}
                registration={register("sku")}
              />
            </div>

            <FormField
              label="Descrição"
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
              <PrimaryButton type="submit" icon={Edit2} fullWidth={false} disabled={isSubmitting}>
                Atualizar Produto
              </PrimaryButton>
            </div>
          </form>
        </div>

        <div className="mt-6">
          <StockMovementHistory productId={id} />
        </div>
      </div>
    </div>
  )
}
