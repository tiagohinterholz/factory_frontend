# Cliente/Veículo/Fornecedor/Produto UX Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path.

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

**Status: DRAFT, não revisado pelo usuário ainda.** Escrito a pedido explícito do usuário ("faz as quatro especificações completas"), mas sem rodada de confirmação linha a linha — o usuário pediu ritmo. Execute só deve começar depois de uma revisão, mesmo que rápida.

**Dependência entre features: esta feature reaproveita `LiveSelect`/`ClientLiveSelect` da feature `live-select` — T6/T8 abaixo não podem começar antes do Execute de `live-select` ter entregue pelo menos T1 (o `LiveSelect` genérico) e T6 (o `ClientLiveSelect`).**

---

**Design**: `.specs/features/client-vehicle-supplier-product-ux/design.md`
**Status**: Draft

---

## Test Coverage Matrix

> Generated from codebase sampling — confirm before Execute. Guidelines found: none.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Backend model/migration (`Service.cost_price`, `Supplier.is_business_mirror`) | none (migração/campo) + integration pro serializer | Serializer expõe o campo novo; data migration coberta por um teste que confirma a flag foi setada certo num cenário de teste | `apps/workservices/tests/`, `apps/suppliers/tests/` | `HOST_DB=localhost PORT_DB=5433 .venv/bin/python -m pytest apps -q` |
| Novos composites (`ManufacturerLiveSelect`, `ModelLiveSelect`, `SupplierLiveSelect`, `ProductFinancialEntryModal`) | unit | Mesma profundidade que `ClientLiveSelect`/`VehicleLiveSelect` já exigiram na feature `live-select` — 1:1 pros ACs que cada um cobre | `src/modules/vehicle/components/*.test.jsx`, `src/modules/supplier/components/*.test.jsx`, `src/modules/product/components/*.test.jsx` | `npx vitest run --silent` |
| Wiring por módulo (Cliente/Veículo/Fornecedor/Produto) | unit (component, matches existing page-test depth) | Suíte existente de cada página continua passando + nova asserção por AC coberta naquele módulo | `src/modules/client/pages/*.test.jsx`, `src/modules/vehicle/pages/*.test.jsx`, `src/modules/supplier/pages/*.test.jsx`, `src/modules/product/pages/*.test.jsx` | `npx vitest run --silent` |

## Parallelism Assessment

| Test Type | Parallel-Safe? | Isolation Model | Evidence |
| --- | --- | --- | --- |
| pytest (backend) | Não | Postgres de teste compartilhado, mesmo padrão já observado a sessão inteira | `.github/workflows` single-process |
| vitest (frontend) | Sim | Isolamento por arquivo | Confirmado repetidamente nesta sessão |

## Gate Check Commands

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick (backend) | Após TB1/TB2 | `cd factory_project && HOST_DB=localhost PORT_DB=5433 .venv/bin/python -m pytest apps/workservices apps/suppliers apps/businesses -q` |
| Full (backend) | Fim da fase 1 | `cd factory_project && HOST_DB=localhost PORT_DB=5433 .venv/bin/python -m pytest apps -q && .venv/bin/python -m flake8 apps --max-line-length=79 --count --statistics && .venv/bin/python -m isort apps --check-only --diff` |
| Quick (frontend) | Após uma task de um módulo | `cd factory_project_frontend && npx vitest run src/modules/<area> --silent` |
| Full (frontend) | Fim de fase | `cd factory_project_frontend && npx vitest run --silent && npm run lint && npm run format:check` |

---

## Execution Plan

### Phase 1: Backend foundation (Parallel)

```
TB1 [P], TB2 [P]
```

### Phase 2: Composites novos (depende de live-select T1/T6 já entregues; parcialmente paralelo)

```
T1 [P], T2 [P] (T2 segue o padrão de T1, sem dependência rígida entre eles)
T3 (depende de TB2 pra ordenação do fornecedor-espelho)
T4 [P] (independente)
```

### Phase 3: Wiring por módulo (depende da Fase 2, paralelo entre módulos)

```
T5 [P] (Cliente)
T6 [P] (Veículo — depende de T1, T2, e de live-select's ClientLiveSelect)
T7 [P] (Fornecedor)
T8 [P] (Produto — depende de T3, T4, TB1)
```

**3 fases → delegação em sub-agentes não é obrigatória pelo critério do skill (>3), mas a Fase 3 tem 4 tasks substanciais — oferecer mesmo assim se o usuário topar.**

---

## Task Breakdown

### TB1: `Service.cost_price` (backend) [P]

**What**: Campo nullable novo no model `Service`, migration, exposição no serializer.
**Where**: `apps/workservices/models/service.py`, migration nova, `apps/workservices/serializers/service_serializer.py`
**Depends on**: None
**Reuses**: mesmo padrão de `Product.cost_price`
**Requirement**: CVSP-P3-07

**Done when**:
- [ ] Campo `cost_price` nullable, serializer expõe
- [ ] Teste de serializer/model cobrindo o campo novo
- [ ] Gate: `cd factory_project && HOST_DB=localhost PORT_DB=5433 .venv/bin/python -m pytest apps/workservices -q`

**Tests**: integration
**Gate**: quick

---

### TB2: `Supplier.is_business_mirror` (backend) [P]

**What**: Flag booleana nova + data migration marcando o fornecedor-espelho já existente de cada negócio (match por CNPJ, com log de qualquer `Business` sem match) + `business_service.create()` passa a marcar `True` na criação do espelho.
**Where**: `apps/suppliers/models/supplier.py`, migration nova (schema+data), `apps/businesses/services/business_service.py`
**Depends on**: None
**Reuses**: `business_service.py:53-76` (criação do espelho já existente)
**Requirement**: CVSP-P3-06

**Done when**:
- [ ] Campo booleano `is_business_mirror`, default `False`
- [ ] Data migration marca `True` nos registros existentes que batem por CNPJ, loga os que não batem
- [ ] `business_service.create()` marca `True` no espelho criado a partir de agora
- [ ] Teste confirmando a marcação (migration de dados + criação nova)
- [ ] Gate: `cd factory_project && HOST_DB=localhost PORT_DB=5433 .venv/bin/python -m pytest apps/suppliers apps/businesses -q`

**Tests**: integration
**Gate**: quick

---

### T1: `ManufacturerLiveSelect` + modal de cadastro rápido [P]

**What**: Composite de busca+criação pra Marca, mesmo padrão de `ClientLiveSelect`.
**Where**: `src/modules/vehicle/components/ManufacturerLiveSelect.jsx`, `ManufacturerQuickCreateModal.jsx`
**Depends on**: `LiveSelect` (feature `live-select`, T1)
**Requirement**: CVSP-P2-06

**Done when**:
- [ ] Filtra por nome, cadastra inline (só campo "Nome")
- [ ] Gate: `cd factory_project_frontend && npx vitest run src/modules/vehicle --silent`

**Tests**: unit
**Gate**: quick

---

### T2: `ModelLiveSelect` + modal de cadastro rápido [P]

**What**: Composite de busca+criação pra Modelo, filtrado por `manufacturerId`.
**Where**: `src/modules/vehicle/components/ModelLiveSelect.jsx`, `ModelQuickCreateModal.jsx`
**Depends on**: `LiveSelect` (feature `live-select`, T1)
**Requirement**: CVSP-P2-06

**Done when**:
- [ ] Desabilitado sem `manufacturerId`, filtra por nome com `manufacturerId` presente
- [ ] Modal de cadastro traz Marca pré-preenchida e travada + campo Nome
- [ ] Gate: `cd factory_project_frontend && npx vitest run src/modules/vehicle --silent`

**Tests**: unit
**Gate**: quick

---

### T3: `SupplierLiveSelect` + modal de cadastro rápido

**What**: Composite de busca+criação pra Fornecedor, com o fornecedor-espelho (`is_business_mirror`) sempre primeiro na lista.
**Where**: `src/modules/supplier/components/SupplierLiveSelect.jsx`, `SupplierQuickCreateModal.jsx`
**Depends on**: `LiveSelect` (feature `live-select`, T1), TB2
**Requirement**: CVSP-P2-04, CVSP-P3-06

**Done when**:
- [ ] Fornecedor-espelho aparece primeiro, antes do filtro de texto ser aplicado
- [ ] Modal de cadastro rápido com campos mínimos (razão social/nome fantasia, CNPJ, telefone)
- [ ] Gate: `cd factory_project_frontend && npx vitest run src/modules/supplier --silent`

**Tests**: unit
**Gate**: quick

---

### T4: `ProductFinancialEntryModal` [P]

**What**: Modal pós-save de Produto perguntando sobre saída financeira.
**Where**: `src/modules/product/components/ProductFinancialEntryModal.jsx`
**Depends on**: None
**Requirement**: CVSP-P3-05

**Done when**:
- [ ] Abre com valor sugerido (custo × quantidade), confirma cria `FinancialEntry` via serviço já existente, recusa não cria nada
- [ ] Gate: `cd factory_project_frontend && npx vitest run src/modules/product --silent`

**Tests**: unit
**Gate**: quick

---

### T5: Módulo Cliente [P]

**What**: Redirecionamentos (create→edição do próprio, edit→fica na edição), capitalização automática, asteriscos em obrigatórios, cards de veículo/orçamento ocultos quando vazios, link real nos veículos do modal, rótulo "Adicionar veículo".
**Where**: `src/modules/client/hooks/useClientForm.js` (override de redirect no call site), `useClientEditForm.js`, `src/modules/client/pages/ClientCreate.jsx`, `ClientDetail.jsx`, `src/modules/client/components/ClientVehiclesModal.jsx`
**Depends on**: None
**Requirement**: CVSP-P1-01, 02, 06, 07, 11, 12; CVSP-P2-01

**Done when**:
- [ ] Todos os ACs acima verificados nos respectivos arquivos
- [ ] Testes de página atualizados, suíte existente passa
- [ ] Gate: `cd factory_project_frontend && npx vitest run src/modules/client --silent`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(client): redirect to record after save, hide empty related cards, link vehicles`

---

### T6: Módulo Veículo [P]

**What**: Redirecionamentos, máscara de placa, reordenação do menu, troca de Cliente/Marca/Modelo pros respectivos LiveSelects.
**Where**: `src/modules/vehicle/hooks/useVehicleForm.js` (override de redirect), `src/modules/vehicle/pages/VehicleCreate.jsx`, `VehicleDetail.jsx`, `src/modules/core/components/Sidebar.jsx`
**Depends on**: T1, T2, `ClientLiveSelect` (feature `live-select`)
**Requirement**: CVSP-P1-03, 04, 09, 10; CVSP-P2-05, 06

**Done when**:
- [ ] Todos os ACs acima verificados
- [ ] Testes de página atualizados
- [ ] Gate: `cd factory_project_frontend && npx vitest run src/modules/vehicle --silent`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(vehicle): live-select for client/manufacturer/model, plate mask, menu order`

---

### T7: Módulo Fornecedor [P]

**What**: Redirecionamento, rótulos de adicionar produto/serviço, click-through nos produtos/serviços listados, quantidade em estoque exibida, botão de WhatsApp.
**Where**: `src/modules/supplier/hooks/useSupplierForm.js`, `src/modules/supplier/pages/SupplierDetail.jsx`
**Depends on**: None
**Requirement**: CVSP-P1-05, 08; CVSP-P2-02, 03; CVSP-P3-01

**Done when**:
- [ ] Todos os ACs acima verificados
- [ ] Testes de página atualizados
- [ ] Gate: `cd factory_project_frontend && npx vitest run src/modules/supplier --silent`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(supplier): clickable related items, labels, stock qty, whatsapp button`

---

### T8: Módulo Produto [P]

**What**: `SupplierLiveSelect` no campo Fornecedor, Unidade de Medida vira texto+sugestão, histórico de estoque lado a lado, WhatsApp (botão + ícone por linha de pedido de compra), destaque de estoque negativo/zero, modal financeiro pós-save, campo de custo de Serviço no formulário.
**Where**: `src/modules/product/pages/ProductCreate.jsx`, `ProductDetail.jsx`, `src/modules/product/pages/ProductList.jsx`, `src/modules/workservice/pages/WorkServiceCreate.jsx`/`WorkServiceDetail.jsx`
**Depends on**: T3, T4, TB1
**Requirement**: CVSP-P2-04, 07, 08; CVSP-P3-02, 03, 04, 05, 07

**Done when**:
- [ ] Todos os ACs acima verificados
- [ ] Testes de página atualizados
- [ ] Gate: `cd factory_project_frontend && npx vitest run --silent && npm run lint && npm run format:check` (última task do feature — gate completo)

**Tests**: unit
**Gate**: full

**Commit**: `feat(product): supplier live-select, whatsapp, negative stock highlight, financial entry modal, service cost field`

---

## Parallel Execution Map

```
Phase 1: TB1 [P], TB2 [P]
Phase 2: T1 [P], T2 [P], T4 [P] ──→ T3 (precisa de TB2)
Phase 3: T5 [P], T7 [P] (sem dependência de fase 2) | T6 [P] (precisa T1,T2) | T8 [P] (precisa T3,T4,TB1)
```

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| TB1, TB2 | 1 model/migration cada | ✅ Granular |
| T1-T4 | 1 componente composto cada (+ seu modal) | ✅ Granular |
| T5-T8 | Múltiplos arquivos, MESMO módulo, UM resultado coerente por módulo (decisão consciente: 27 ACs individuais agrupados em 4 tasks por módulo em vez de 27 micro-tasks, dado o volume da feature) | ⚠️ Aceito — ver nota abaixo |

**Nota sobre T5-T8**: cada um toca 2-4 arquivos do MESMO módulo, mas entrega UM resultado testável e commitável por vez (não é "fazer dois recursos não relacionados na mesma task"). Trade-off deliberado dado o tamanho da feature (27 ACs) — rastreável porque cada task já lista exatamente quais Requirement IDs cobre.

---

## Diagram-Definition Cross-Check

| Task | Depends On (corpo) | Diagrama Mostra | Status |
| --- | --- | --- | --- |
| TB1 | None | None | ✅ Match |
| TB2 | None | None | ✅ Match |
| T1 | live-select T1 | (externo à fase, citado no corpo) | ✅ Match |
| T2 | live-select T1 | (externo à fase, citado no corpo) | ✅ Match |
| T3 | live-select T1, TB2 | TB2→T3 | ✅ Match |
| T4 | None | None | ✅ Match |
| T5 | None | T5 solto na Fase 3 | ✅ Match |
| T6 | T1, T2, live-select ClientLiveSelect | T1,T2→T6 | ✅ Match |
| T7 | None | T7 solto na Fase 3 | ✅ Match |
| T8 | T3, T4, TB1 | T3,T4,TB1→T8 | ✅ Match |

---

## Test Co-location Validation

| Task | Camada | Matriz Exige | Task Diz | Status |
| --- | --- | --- | --- | --- |
| TB1, TB2 | backend model/migration | integration | integration | ✅ OK |
| T1-T4 | componente novo | unit | unit | ✅ OK |
| T5-T8 | wiring de página | unit | unit (T8 full no final) | ✅ OK |

No ❌ violations.
