export const fuelOptions = [
  { id: "gasolina", name: "Gasolina" },
  { id: "alcool", name: "Álcool" },
  { id: "diesel S10", name: "Diesel S10" },
  { id: "diesel S500", name: "Diesel S500" },
  { id: "flex", name: "Flex" },
  { id: "elétrico", name: "Elétrico" },
  { id: "híbrido", name: "Híbrido" },
]

// Mesmo intervalo validado em vehicle/domain/schema.js: ano de fabricação vai
// até o ano atual, ano do modelo aceita mais um (carro "modelo do ano que vem"
// vendido ainda este ano). Mais recente primeiro — é o que mais se cadastra.
const MIN_YEAR = 1940
const CURRENT_YEAR = new Date().getFullYear()

function yearOptions(maxYear) {
  const options = []
  for (let year = maxYear; year >= MIN_YEAR; year--) {
    options.push({ id: String(year), name: String(year) })
  }
  return options
}

export const manufactureYearOptions = yearOptions(CURRENT_YEAR)
export const modelYearOptions = yearOptions(CURRENT_YEAR + 1)

// Sugestões pra o datalist de "Cor" — continua texto livre (o cliente pode
// digitar "grafite", "vinho" etc.), isso aqui só popula o autocomplete com
// as cores mais comuns no mercado.
export const VEHICLE_COLOR_OPTIONS = [
  "Branco",
  "Preto",
  "Prata",
  "Cinza",
  "Vermelho",
  "Azul",
  "Verde",
  "Amarelo",
  "Marrom",
  "Bege",
  "Dourado",
  "Laranja",
  "Roxo",
]
