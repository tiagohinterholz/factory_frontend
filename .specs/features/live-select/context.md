# Live Select (Cliente/Veículo) Context

**Gathered:** 2026-10-20
**Spec:** `.specs/features/live-select/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Um componente de select com busca (abre lista ao clicar, filtra conforme digita) substitui o `<select>` nativo nos campos de Cliente e Veículo das telas de OS, Orçamento e Agendamento (criação e edição), com atalho de cadastro rápido inline (modal) quando o registro buscado não existe.

---

## Implementation Decisions

### Atalho de cadastro rápido

- Modal inline, sem navegar pra outra página — preserva o restante do formulário-pai intacto.
- Construído em cima do `Modal.jsx` genérico já existente (não havia nenhum precedente de "modal cria registro" no código — confirmado por pesquisa; o único precedente próximo, o botão de olho em `VehicleDetail.jsx`, navega pra outra página, que é exatamente o padrão antigo que esta feature substitui).

### Fonte da busca

- Filtra 100% em cima da lista já carregada hoje (`useClientOptions`/`useVehicleOptions`) — zero mudança de backend nesta feature.
- Decisão explícita: busca no servidor (com endpoint novo + debounce) fica fora de escopo; só reconsiderar se o volume de clientes/veículos de algum cliente crescer a ponto de a lista completa pesar no carregamento.

### Escopo do P1

- Só Cliente e Veículo. Produto/Serviço/Fornecedor e Categoria/Marca-Modelo/Estado-Cidade ficam para features futuras (P2/P3 do backlog maior que originou esta feature).

---

## Agent's Discretion

- Critério de filtro por texto (nome+documento pra cliente; placa+marca/modelo pra veículo) — não foi perguntado diretamente, mas é extensão natural e de baixo risco do "digita e filtra" pedido; registrado como assumption no spec, não uma pergunta aberta.
- Comportamento de lista vazia (base nova) — mesma lógica, registrado como edge case no spec.

### Troca de cliente com veículo já selecionado

- Trocar o Cliente limpa a seleção de Veículo (evita salvar um veículo que não é do cliente novo por engano).

## Declined / Undiscussed Gray Areas → Assumptions

Nenhuma — todas as áreas levantadas foram discutidas e resolvidas.

---

## Specific References

Nenhuma — o usuário mencionou ter mandado um exemplo por WhatsApp que não está disponível nesta conversa; a spec foi fechada com a opção recomendada (abre lista, filtra, cadastra se não achar) em vez desse exemplo. Se o exemplo mostrar algo diferente do que foi especificado aqui, é só avisar antes do Design avançar.

---

## Deferred Ideas

- Produto, Serviço, Fornecedor com o mesmo componente de select com busca (P2 do backlog maior).
- Categoria/Subcategoria, Marca/Modelo, Estado/Cidade com o mesmo componente (P3 do backlog maior).
- Mover o filtro de veículo-por-cliente pro backend (`VehicleFilterSet.client_id`, que já existe e já funciona, só não é usado pelo frontend hoje) — otimização independente, não bloqueia esta feature.
- Todo o resto da lista original (RBAC contador, financeiro categoria/tag, relatórios, agendamento, redirecionamento pós-save, etc.) — vira features próprias depois, fora desta.
