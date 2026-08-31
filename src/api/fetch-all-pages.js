import { normalizeList } from "./normalize-list"

// Puxa TODAS as páginas de um endpoint DRF paginado (PAGE_SIZE=10, sem
// page_size_query_param) e devolve a lista inteira. É o que os <select> dos
// formulários precisam: com dados populados, o registro que se está editando
// costuma estar fora da 1ª página e a <option> não existiria.
//
// Uso: fetchAllPages((page) => ClientService.getClient({ page }))
export async function fetchAllPages(fetchPage, { pageSize = 10, maxPages = 100 } = {}) {
  const first = normalizeList(await fetchPage(1))
  let results = first.results
  const total = first.count ?? results.length
  const lastPage = Math.min(Math.ceil(total / pageSize), maxPages)

  if (lastPage > 1) {
    const rest = await Promise.all(
      Array.from({ length: lastPage - 1 }, (_, index) => fetchPage(index + 2)),
    )
    for (const response of rest) {
      results = results.concat(normalizeList(response).results)
    }
  }

  return results
}
