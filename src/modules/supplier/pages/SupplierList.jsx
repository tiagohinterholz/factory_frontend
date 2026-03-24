import { useSupplier } from "../hooks/useSupplier"
import ListHeader from "@/modules/core/components/ListHeader"
import ListGrid from "@/modules/core/components/ListGrid"
import ListCard from "@/modules/core/components/ListCard"


export default function SupplierList() {
  const { supplier, loading } = useSupplier()

  if (loading) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-4">

      <ListHeader
        title='Fornecedores'
        buttonText='Novo Fornecedor'
        buttonLink='/fornecedores/novo'
      />
      
      <ListGrid>
        {supplier.map((supplier) => (
          <ListCard
            key={supplier.id}
            to={`/fornecedores/${supplier.id}`}
            title={supplier.corporate_name}
            subtitle={supplier.cnpj}
          />
        ))}
      </ListGrid>
    </div>
  )
}
