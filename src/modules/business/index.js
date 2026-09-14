// Superfície pública do módulo business. Ver comentário em order/index.js.
// A tela de Gestão vive em @/modules/settings (rota /configuracoes já era
// dela) — expõe os hooks/componente que ela precisa.
export { BusinessService } from "./services/business"
export { useBusinessEditForm } from "./hooks/useBusinessEditForm"
export { useBusinessHours } from "./hooks/useBusinessHours"
export { useBusinessLogo } from "./hooks/useBusinessLogo"
export { default as BusinessHoursPanel } from "./components/BusinessHoursPanel"
