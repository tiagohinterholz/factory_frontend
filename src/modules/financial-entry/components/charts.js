export const SERIES = [
  { key: "inflow", label: "Entradas", color: "#0e8f84" },
  { key: "outflow", label: "Saídas", color: "#c2410c" },
]

export function niceMax(value) {
  if (!(value > 0)) return 100
  const exponent = 10 ** Math.floor(Math.log10(value))
  const fraction = value / exponent
  const step = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10
  return step * exponent
}

export function niceTicks(rawMax, target = 4) {
  const step = niceMax((rawMax > 0 ? rawMax : 100) / target)
  const top = Math.max(step, Math.ceil((rawMax > 0 ? rawMax : 100) / step) * step)
  return { top, ticks: Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step) }
}

export function compactMoney(value) {
  const number = Number(value) || 0
  if (Math.abs(number) >= 1000000)
    return `R$ ${(number / 1000000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`
  if (Math.abs(number) >= 1000)
    return `R$ ${(number / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`
  return `R$ ${number.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`
}
