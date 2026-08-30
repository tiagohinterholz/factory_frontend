// A API às vezes devolve um array cru, às vezes { results, count } (paginação DRF).
// Normaliza pro segundo formato sempre.
export function normalizeList(response) {
  if (Array.isArray(response)) {
    return { results: response, count: response.length }
  }
  if (response && Array.isArray(response.results)) {
    return { results: response.results, count: response.count ?? response.results.length }
  }
  return { results: [], count: 0 }
}
