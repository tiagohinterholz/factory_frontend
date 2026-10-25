# STATE

## Decisions

Nenhuma ainda — primeira feature deste repo a passar pelo fluxo spec-driven com STATE.md próprio (o histórico de split-fiscal-notes-by-type ficou registrado só no `.specs/STATE.md` do backend).

## Handoff

- **Features ativas**: o textão gigante de melhorias virou 4 features (uma por bloco escolhido pelo usuário). As 2 mais front-heavy moram aqui: `live-select` (P1: select com busca pra Cliente/Veículo) e `client-vehicle-supplier-product-ux` (redirecionamentos, cards clicáveis, WhatsApp em fornecedor/produto, estoque negativo, modal financeiro no cadastro de produto, campo de custo em serviço). As outras 2 (`orcamento-os-financeiro-ux`, `rbac-agendamento-dashboard-ux`) moram no `.specs/STATE.md` do backend, por serem mais pesadas de back.
- **Phase / Task**: as 4 têm spec+context+design+tasks completos, TODOS em Draft — usuário pediu as 4 especificações completas de uma vez ("faz as quatro especificações completas... depois a gente arranca da stable das duas, se precisar"), sem rodada de Discuss interativa (sinalizou confiança, pediu ritmo). Nenhuma foi revisada/aprovada ainda.
- **Completed**: `live-select/{spec,context,design,tasks}.md` (13 tasks, 3 fases); `client-vehicle-supplier-product-ux/{spec,context,design,tasks}.md` (10 tasks, 3 fases — 2 delas tocam o backend: `Service.cost_price` e `Supplier.is_business_mirror`).
- **In-progress**: nada — Execute não começou em nenhuma das 4.
- **Next step**: usuário revisa (ou libera Execute direto) e decide a ordem. **Dependência importante**: `client-vehicle-supplier-product-ux` (T6, T8) só pode começar depois que `live-select` (T1 — o `LiveSelect` genérico — e T6 — o `ClientLiveSelect`) estiverem prontos. `orcamento-os-financeiro-ux` (bloco 3, backend) depende de `client-vehicle-supplier-product-ux` (TB2, `is_business_mirror`) pra uma parte específica (modal de serviço de fornecedor externo).
- **Blockers**: aprovação do usuário (nenhuma das 4 specs confirmada ainda)
- **Uncommitted files**: `.specs/features/live-select/`, `.specs/features/client-vehicle-supplier-product-ux/` (ambos novos, nenhum código de implementação ainda)
- **Branch**: nenhuma criada ainda pra nenhuma das 4 — decidir ao iniciar Execute de cada uma
