// Normaliza um erro do axios/DRF em { message, fields }.
//   message -> texto pronto pro toast
//   fields  -> { campo: "1ª mensagem" } para (futuramente) marcar inputs
//
// Formatos que o DRF costuma devolver:
//   { "cpf": ["Já existe cliente com este CPF."], "non_field_errors": ["..."] }
//   { "detail": "Não encontrado." }
//   "texto solto"

export function parseApiError(error, fallback = "Algo deu errado. Tente novamente.") {
  // Sem response = a requisição nem chegou (rede caiu, servidor fora, CORS)
  if (!error?.response) {
    return { message: "Sem conexão com o servidor. Verifique sua internet.", fields: {} }
  }

  const { status, data } = error.response

  if (status >= 500) {
    return { message: "Erro no servidor. Tente novamente em instantes.", fields: {} }
  }

  if (typeof data === "string" && data.trim()) {
    return { message: data.trim(), fields: {} }
  }

  if (data && typeof data === "object") {
    const fields = {}
    let topMessage = null

    for (const [key, value] of Object.entries(data)) {
      let text = null
      if (Array.isArray(value)) {
        text = value.filter((item) => typeof item === "string").join(" ")
      } else if (typeof value === "string") {
        text = value
      }
      if (!text) continue

      if (key === "detail" || key === "non_field_errors") {
        topMessage = topMessage ?? text
      } else {
        fields[key] = text
      }
    }

    const firstFieldMessage = Object.values(fields)[0] ?? null
    return { message: topMessage || firstFieldMessage || fallback, fields }
  }

  return { message: fallback, fields: {} }
}
