import { useProductOptions } from "@/modules/core/hooks/options"
import FormField from "@/modules/core/components/FormField"
import MoneyField from "@/modules/core/components/MoneyField"
import { SupplierLiveSelect } from "@/modules/supplier"
import { ProductCategoryLiveSelect } from "@/modules/productcategory"
import { ProductSubcategoryLiveSelect } from "@/modules/productsubcategory"
import { unitOfMeasureOptions } from "@/modules/product/constants/product"

export default function ProductFormFields({ form }) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form

  const categoryId = watch("category_id")
  const subcategoryId = watch("subcategory_id")
  const supplierId = watch("supplier_id")

  const { product: products } = useProductOptions()
  const brandOptions = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort()

  return (
    <>
      <SupplierLiveSelect
        label="Fornecedor *"
        value={supplierId}
        onChange={(value) => setValue("supplier_id", value)}
        error={errors.supplier_id?.message}
      />

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
        <ProductCategoryLiveSelect
          label="Categoria"
          value={categoryId}
          onChange={(value) => {
            setValue("category_id", value)
            setValue("subcategory_id", "")
          }}
          error={errors.category_id?.message}
        />
        <ProductSubcategoryLiveSelect
          label="Subcategoria"
          value={subcategoryId}
          onChange={(value) => setValue("subcategory_id", value)}
          categoryId={categoryId}
          error={errors.subcategory_id?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Qtd em Estoque"
          type="number"
          error={errors.stock_quantity?.message}
          registration={register("stock_quantity")}
        />
        <FormField
          label="Unidade de Medida"
          placeholder="UN"
          datalist={unitOfMeasureOptions}
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
    </>
  )
}
