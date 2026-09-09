// Fonte única das query keys do módulo Fornecedores. Hierárquico por prefixo:
// invalidar supplierKeys.all pega a listagem e os detalhes. Padrão "query key
// factory". Produtos/serviços por fornecedor ficam em productKeys/workServiceKeys.
export const supplierKeys = {
  all: ["suppliers"],
  lists: () => [...supplierKeys.all, "list"],
  list: (params) => [...supplierKeys.lists(), params],
  detail: (id) => [...supplierKeys.all, "detail", id],
}
