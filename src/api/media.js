import { api } from "@/api/http"

// URL de mídia do Django (logo do empreendimento, anexos…) costuma vir
// relativa ("/media/…") no payload. A SPA roda em outra origem que a API,
// então um <img src="/media/…"> resolveria contra o host errado. Resolve
// contra a mesma base da API. URLs já absolutas (http/https), blob: e data:
// passam direto.
export function resolveMediaUrl(value) {
  if (!value) return ""
  if (/^(https?:|blob:|data:)/i.test(value)) return value

  const base = (api.defaults.baseURL ?? "").replace(/\/+$/, "")
  return `${base}${value.startsWith("/") ? "" : "/"}${value}`
}

// Alguns endpoints devolvem a imagem como base64 cru (sem o prefixo `data:`).
// Monta o data-URI, inferindo o mime pela assinatura dos primeiros bytes.
export function base64ImageDataUri(base64) {
  if (!base64) return ""
  if (base64.startsWith("data:")) return base64

  const mime = base64.startsWith("/9j/")
    ? "image/jpeg"
    : base64.startsWith("R0lGOD")
      ? "image/gif"
      : base64.startsWith("UklGR")
        ? "image/webp"
        : "image/png"
  return `data:${mime};base64,${base64}`
}
