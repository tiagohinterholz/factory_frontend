// Catálogo de planos do cadastro público — fonte única, usada tanto pela
// landing (vitrine) quanto pelo checkout (/assinar/:period). `code` bate
// exatamente com apps.businesses.constants.PLANS no back (é o valor que o
// backend resolve o preço de verdade a partir dele — o preço mostrado aqui
// é só exibição, nunca é o que decide quanto se cobra).
// Preços provisórios — ajustar aqui. Todo plano: 1 admin + 3 usuários.
// Curva: quanto mais longo o ciclo, menor o R$/mês (mensal 250 -> anual 190).
export const PLANS = [
  {
    code: "QUINZENAL",
    period: "Quinzenal",
    price: "150",
    cycle: "a cada 15 dias",
    equiv: "R$ 300/mês",
  },
  { code: "MENSAL", period: "Mensal", price: "250", cycle: "por mês", equiv: null },
  {
    code: "TRIMESTRAL",
    period: "Trimestral",
    price: "660",
    cycle: "a cada 3 meses",
    equiv: "R$ 220/mês",
    tag: "Mais popular",
  },
  {
    code: "SEMESTRAL",
    period: "Semestral",
    price: "1.260",
    cycle: "a cada 6 meses",
    equiv: "R$ 210/mês",
  },
  {
    code: "ANUAL",
    period: "Anual",
    price: "2.280",
    cycle: "por ano",
    equiv: "R$ 190/mês",
    tag: "Melhor preço",
  },
]

export function planByCode(code) {
  return PLANS.find((plan) => plan.code === code)
}
