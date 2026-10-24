// Mesmas opções do model Product.unit_of_measure (apps/products/models/product.py).
export const unitOfMeasureOptions = [
  { id: "UN", name: "Unidade" },
  { id: "LT", name: "Litro" },
  { id: "KG", name: "Quilograma" },
  { id: "MT", name: "Metro" },
  { id: "CX", name: "Caixa" },
  { id: "PAR", name: "Par" },
  { id: "CJ", name: "Conjunto" },
]

export function purchaseRequestMessage(productName) {
  return `Olá! Gostaria de solicitar a compra/reposição do produto ${productName}.`
}
