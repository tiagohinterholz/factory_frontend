// Superfície pública do módulo order. Outros módulos importam SÓ daqui (ou de
// `@/modules/order/domain`, a camada pura) — nunca de hooks/services/components
// internos. A regra `no-restricted-imports` no eslint.config.js força isso.
export { OrderService } from "./services/order"
export { useFinishOrder } from "./hooks/useFinishOrder"
