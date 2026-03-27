import { useProduct } from "../hooks/useProduct"
import ListHeader from "@/modules/core/components/ListHeader"
import ListGrid from "@/modules/core/components/ListGrid"
import ListCard from "@/modules/core/components/ListCard"


export default function ProductList() {
  const { product, loading } = useProduct()

  if (loading) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-4">

      <ListHeader
        title='Produtos'
        buttonText='Novo Produto'
        buttonLink='/produtos/novo'
      />
      
      <ListGrid>
        {product.map((product) => (
          <ListCard
            key={product.id}
            to={`/produtos/${product.id}`}
            title={product.name}
            subtitle={product.reference}
          />
        ))}
      </ListGrid>
    </div>
  )
}
