# Live Select (Cliente/Veículo) Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

**Status note (drafted during an autonomous check while the user was away): Design (`design.md`) and this file are both DRAFT, not yet reviewed/approved by the user. Do not start Execute until the user confirms both.**

---

**Design**: `.specs/features/live-select/design.md`
**Status**: Draft

---

## Test Coverage Matrix

> Generated from codebase sampling — confirm before Execute. Guidelines found: none (`CLAUDE.md`/`AGENTS.md` not present in this repo) — strong defaults applied. Floor confirmed from existing siblings: `OrderCreate.test.jsx`, `OrderEdit.test.jsx`, `BudgetEdit.test.jsx`, `AppointmentDetail.test.jsx`, `useOrderForm.test.jsx`, `useBudgetForm.test.jsx` already exist at this depth; `BudgetCreate.jsx` and `AppointmentCreate.jsx` currently have NO page-level test at all (gap pre-dates this feature) — this feature adds one for each as part of wiring them, since the spec's ACs apply to those pages too.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| `LiveSelect` (generic primitive) | unit | Every interactive behavior: opens list on click, filters as you type (case-insensitive, custom `getSearchText`), shows create-shortcut only when `onCreateNew` is set AND nothing matches, selects an option, hides create-shortcut when a match exists | `src/modules/core/components/LiveSelect.test.jsx` | `npx vitest run src/modules/core --silent` |
| `useClientForm`/`useVehicleForm` (modified) | unit | Default behavior unchanged (regression: same `redirectTo` as before when no override passed) + new override params (`redirectTo: null`, custom `onSuccess`) work | `src/modules/client/hooks/useClientForm.test.jsx`, `src/modules/vehicle/hooks/useVehicleForm.test.jsx` | `npx vitest run src/modules/client src/modules/vehicle --silent` |
| `ClientQuickCreateModal`/`VehicleQuickCreateModal` | unit | 1:1 to spec ACs 4-5 (client) and 8-10 (vehicle): renders the minimum fields from the spec, validates via the existing schema, submits via the existing service, calls `onCreated` with the new record, shows backend field errors inline, closes without side-effects on cancel | `src/modules/client/components/ClientQuickCreateModal.test.jsx`, `src/modules/vehicle/components/VehicleQuickCreateModal.test.jsx` | `npx vitest run src/modules/client src/modules/vehicle --silent` |
| `ClientLiveSelect`/`VehicleLiveSelect` (composites) | unit | Filter+create wiring end-to-end per spec ACs 1-3 and 6-7; `VehicleLiveSelect` additionally covers AC9 (disabled + hint when no `clientId`) | `src/modules/client/components/ClientLiveSelect.test.jsx`, `src/modules/vehicle/components/VehicleLiveSelect.test.jsx` | same as above |
| Page wiring (6 pages: Order/Budget/Appointment × Create+Edit, except Budget/Appointment Create which are Create-only without a matching Edit named differently) | unit (component, matches existing page-test depth) | Existing test suite for the page still passes after the swap; new assertion per spec's Discuss decision: changing Cliente clears the already-selected Veículo | `src/modules/order/pages/OrderCreate.test.jsx`, `OrderEdit.test.jsx`, `src/modules/budget/pages/BudgetCreate.test.jsx` (new), `BudgetEdit.test.jsx`, `src/modules/appointment/pages/AppointmentCreate.test.jsx` (new), `AppointmentDetail.test.jsx` | `npx vitest run --silent` |

## Parallelism Assessment

> Generated from codebase — confirm before Execute.

| Test Type | Parallel-Safe? | Isolation Model | Evidence |
| --- | --- | --- | --- |
| vitest (all layers in this feature) | Yes | Per-file module isolation, no shared backend/global mutable state — confirmed pattern across the whole frontend test suite this session (unrelated test files run together without interference) | Observed repeatedly: `npx vitest run --silent` consistently green across unrelated files |

## Gate Check Commands

> Generated from codebase — confirm before Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | After a task touching one module | `cd factory_project_frontend && npx vitest run src/modules/<area> --silent` |
| Full | After phase completion | `cd factory_project_frontend && npx vitest run --silent && npm run lint && npm run format:check` |

---

## Execution Plan

### Phase 1: Foundation (Parallel OK — no inter-task dependency)

```
T1 [P]
T2 [P]
T3 [P]
```

### Phase 2: Composites + Quick-Create Modals (depends on Phase 1)

```
T2 done → T4 ─┐
T3 done → T5 ─┤
T1, T4 done → T6
T1, T5 done → T7
```

### Phase 3: Page Wiring (depends on Phase 2, all parallel)

```
T6, T7 done, then:
  T8 [P], T9 [P], T10 [P], T11 [P], T12 [P], T13 [P]
```

---

## Task Breakdown

### T1: `LiveSelect` generic component

**What**: Componente genérico de select com busca (Headless UI `Combobox`), sem nenhum conhecimento de cliente/veículo — mesmo contrato visual de `SelectField`/`FilterSelect` (classes `input-premium`/`label-premium`).
**Where**: `src/modules/core/components/LiveSelect.jsx`
**Depends on**: None
**Reuses**: `src/modules/core/components/FilterSelect.jsx` (classes Tailwind, convenção de props `options`/`value`/`onChange`)
**Requirement**: LIVESEL-01, LIVESEL-02, LIVESEL-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Abre a lista de opções ao clicar/focar
- [ ] Filtra conforme digita, usando `getSearchText(option)` (default: `option.name`), case-insensitive, substring em qualquer posição
- [ ] Mostra o atalho de criação (texto de `createLabel`, chama `onCreateNew`) só quando `onCreateNew` está definido E nenhuma opção bate com o texto digitado
- [ ] Sem `onCreateNew`, nunca mostra o atalho (reaproveitável em contexto sem criação)
- [ ] Gate check passa: `cd factory_project_frontend && npx vitest run src/modules/core --silent`

**Tests**: unit
**Gate**: quick

---

### T2: `useClientForm` ganha overrides de `redirectTo`/`onSuccess` [P]

**What**: Adiciona parâmetros opcionais `redirectTo`/`onSuccess` ao hook, com default = comportamento atual exato (`redirectTo: "/clientes"`, sem `onSuccess` extra) — zero mudança de comportamento pro cadastro completo existente.
**Where**: `src/modules/client/hooks/useClientForm.js`
**Depends on**: None
**Reuses**: `useResourceForm` (já suporta `redirectTo` falsy = não navega, e `onSuccess` como callback extra — nenhuma mudança nele)
**Requirement**: LIVESEL-04, LIVESEL-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Chamado sem argumentos, comportamento idêntico a hoje (navega pra `/clientes` no sucesso)
- [ ] Chamado com `{ redirectTo: null, onSuccess }`, NÃO navega e chama o `onSuccess` recebido com o cliente criado
- [ ] Gate check passa: `cd factory_project_frontend && npx vitest run src/modules/client --silent`

**Tests**: unit
**Gate**: quick

---

### T3: `useVehicleForm` ganha overrides de `redirectTo`/`onSuccess` [P]

**What**: Mesma mudança do T2, no hook de veículo — já aceita `clientId` pré-preenchido hoje, só falta os overrides de navegação/sucesso.
**Where**: `src/modules/vehicle/hooks/useVehicleForm.js`
**Depends on**: None
**Reuses**: mesmo padrão do T2
**Requirement**: LIVESEL-08, LIVESEL-10

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Chamado com só `{ clientId }` (como hoje), comportamento idêntico a hoje
- [ ] Chamado com `{ clientId, redirectTo: null, onSuccess }`, NÃO navega e chama o `onSuccess` recebido com o veículo criado
- [ ] Gate check passa: `cd factory_project_frontend && npx vitest run src/modules/vehicle --silent`

**Tests**: unit
**Gate**: quick

---

### T4: `ClientQuickCreateModal`

**What**: Modal com os campos mínimos de cliente (tipo PF/PJ, nome+sobrenome+CPF ou razão social+CNPJ, estado, cidade, telefone), reaproveitando `clientSchema`/`clientDefaults`/`toClientPayload` sem alteração.
**Where**: `src/modules/client/components/ClientQuickCreateModal.jsx`
**Depends on**: T2
**Reuses**: `Modal.jsx`, `useClientForm` (com overrides do T2), cascata estado→cidade já implementada em `ClientCreate.jsx`
**Requirement**: LIVESEL-04, LIVESEL-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Renderiza exatamente os campos do spec (AC4), nada a mais
- [ ] Submete via `ClientService.createClient` (igual ao cadastro completo), chama `onCreated(client)` e fecha no sucesso
- [ ] Erro de validação (campo vazio, CPF/CNPJ mal formatado) aparece embaixo do campo certo
- [ ] Erro do backend (ex. CPF duplicado) aparece embaixo do campo certo, modal continua aberto
- [ ] Fechar sem salvar não deixa nenhum efeito colateral
- [ ] Gate check passa: `cd factory_project_frontend && npx vitest run src/modules/client --silent`

**Tests**: unit
**Gate**: quick

---

### T5: `VehicleQuickCreateModal`

**What**: Modal com os campos mínimos de veículo (cliente pré-preenchido e travado, marca→modelo em cascata, ano, ano modelo, placa, combustível), reaproveitando `vehicleSchema`/`vehicleDefaults` sem alteração.
**Where**: `src/modules/vehicle/components/VehicleQuickCreateModal.jsx`
**Depends on**: T3
**Reuses**: `Modal.jsx`, `useVehicleForm({ clientId })` (com overrides do T3), cascata marca→modelo já usada em `VehicleCreate.jsx` (`useManufacturerOptions`/`useModelOptionsByManufacturer`)
**Requirement**: LIVESEL-08, LIVESEL-09, LIVESEL-10

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Renderiza exatamente os campos do spec (AC8), com `client_id` pré-preenchido e não editável
- [ ] Recusa abrir (ou loga aviso) se chamado sem `clientId` — defesa, já que quem abre normalmente é o `VehicleLiveSelect` desabilitado nesse caso (AC9)
- [ ] Submete via `VehicleService.createVehicle`, chama `onCreated(vehicle)` e fecha no sucesso
- [ ] Erros de validação/backend aparecem embaixo do campo certo, mesmo padrão do T4
- [ ] Gate check passa: `cd factory_project_frontend && npx vitest run src/modules/vehicle --silent`

**Tests**: unit
**Gate**: quick

---

### T6: `ClientLiveSelect` composto

**What**: Junta `LiveSelect` + `ClientQuickCreateModal`, pronto pra substituir o `SelectField` de Cliente nas páginas.
**Where**: `src/modules/client/components/ClientLiveSelect.jsx`
**Depends on**: T1, T4
**Reuses**: `useClientOptions` (fonte de dados já existente), `LiveSelect`, `ClientQuickCreateModal`
**Requirement**: LIVESEL-01, LIVESEL-02, LIVESEL-03, LIVESEL-04, LIVESEL-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Filtra por nome/razão social OU documento (CPF/CNPJ), case-insensitive
- [ ] Sem match, mostra "Cadastrar novo cliente" que abre o modal do T4
- [ ] Modal criado com sucesso seleciona o cliente novo automaticamente e fecha
- [ ] Lista vazia (base nova) mostra direto o atalho de criar, sem mensagem de "nenhum resultado"
- [ ] Gate check passa: `cd factory_project_frontend && npx vitest run src/modules/client --silent`

**Tests**: unit
**Gate**: quick

---

### T7: `VehicleLiveSelect` composto

**What**: Junta `LiveSelect` + `VehicleQuickCreateModal`, com filtro por `clientId` centralizado (mesma lógica client-side hoje repetida em cada página).
**Where**: `src/modules/vehicle/components/VehicleLiveSelect.jsx`
**Depends on**: T1, T5
**Reuses**: `useVehicleOptions`, `LiveSelect`, `VehicleQuickCreateModal`
**Requirement**: LIVESEL-06, LIVESEL-07, LIVESEL-08, LIVESEL-09, LIVESEL-10

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Filtra as opções pelo `clientId` recebido antes de aplicar o filtro de texto
- [ ] Filtro de texto bate contra placa OU marca+modelo, case-insensitive
- [ ] Sem `clientId`, campo fica desabilitado com `disabledHint` (não mostra atalho de criar)
- [ ] Com `clientId` e sem match, mostra "Cadastrar novo veículo" que abre o modal do T5 já com o cliente certo
- [ ] Modal criado com sucesso seleciona o veículo novo automaticamente e fecha
- [ ] Gate check passa: `cd factory_project_frontend && npx vitest run src/modules/vehicle --silent`

**Tests**: unit
**Gate**: quick

---

### T8: Wire `OrderCreate.jsx` [P]

**What**: Troca os `SelectField` de Cliente/Veículo por `ClientLiveSelect`/`VehicleLiveSelect`; adiciona o efeito "trocar cliente limpa veículo".
**Where**: `src/modules/order/pages/OrderCreate.jsx`
**Depends on**: T6, T7
**Reuses**: nada novo
**Requirement**: LIVESEL-01 a LIVESEL-10 (ponta a ponta nesta página)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Campo Cliente é `ClientLiveSelect`, campo Veículo é `VehicleLiveSelect` com `clientId` do campo Cliente
- [ ] Trocar o cliente selecionado limpa o veículo já selecionado
- [ ] `OrderCreate.test.jsx` atualizado cobrindo os 2 pontos acima, suíte existente continua passando
- [ ] Gate check passa: `cd factory_project_frontend && npx vitest run src/modules/order --silent`

**Tests**: unit (component, matches `OrderCreate.test.jsx` existing depth)
**Gate**: quick

**Commit**: `feat(order): replace client/vehicle selects with live search in OrderCreate`

---

### T9: Wire `OrderEdit.jsx` [P]

**What**: Mesma troca do T8, na tela de edição de OS.
**Where**: `src/modules/order/pages/OrderEdit.jsx`
**Depends on**: T6, T7
**Reuses**: nada novo

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Mesmos 2 pontos do T8
- [ ] `OrderEdit.test.jsx` atualizado, suíte existente continua passando
- [ ] Gate check passa: `cd factory_project_frontend && npx vitest run src/modules/order --silent`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(order): replace client/vehicle selects with live search in OrderEdit`

---

### T10: Wire `BudgetCreate.jsx` [P]

**What**: Mesma troca do T8, na criação de orçamento. Esta página não tem teste próprio hoje — cria um novo.
**Where**: `src/modules/budget/pages/BudgetCreate.jsx`
**Depends on**: T6, T7
**Reuses**: nada novo

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Mesmos 2 pontos do T8
- [ ] `BudgetCreate.test.jsx` criado (não existia), mesmo padrão de profundidade de `OrderCreate.test.jsx`
- [ ] Gate check passa: `cd factory_project_frontend && npx vitest run src/modules/budget --silent`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(budget): replace client/vehicle selects with live search in BudgetCreate`

---

### T11: Wire `BudgetEdit.jsx` [P]

**What**: Mesma troca do T8, na edição de orçamento.
**Where**: `src/modules/budget/pages/BudgetEdit.jsx`
**Depends on**: T6, T7
**Reuses**: nada novo

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Mesmos 2 pontos do T8
- [ ] `BudgetEdit.test.jsx` atualizado, suíte existente continua passando
- [ ] Gate check passa: `cd factory_project_frontend && npx vitest run src/modules/budget --silent`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(budget): replace client/vehicle selects with live search in BudgetEdit`

---

### T12: Wire `AppointmentCreate.jsx` [P]

**What**: Mesma troca do T8, na criação de agendamento. Esta página não tem teste próprio hoje — cria um novo.
**Where**: `src/modules/appointment/pages/AppointmentCreate.jsx`
**Depends on**: T6, T7
**Reuses**: nada novo

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Mesmos 2 pontos do T8 (campo se chama "Cliente Proprietário" nesta tela, mesma troca)
- [ ] `AppointmentCreate.test.jsx` criado (não existia), mesmo padrão de profundidade de `AppointmentDetail.test.jsx`
- [ ] Gate check passa: `cd factory_project_frontend && npx vitest run src/modules/appointment --silent`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(appointment): replace client/vehicle selects with live search in AppointmentCreate`

---

### T13: Wire `AppointmentDetail.jsx` [P]

**What**: Mesma troca do T8, na tela de edição de agendamento.
**Where**: `src/modules/appointment/pages/AppointmentDetail.jsx`
**Depends on**: T6, T7
**Reuses**: nada novo

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Mesmos 2 pontos do T8
- [ ] `AppointmentDetail.test.jsx` atualizado, suíte existente continua passando
- [ ] Gate check passa (ÚLTIMA task — gate completo): `cd factory_project_frontend && npx vitest run --silent && npm run lint && npm run format:check`

**Tests**: unit
**Gate**: full (última task do feature)

**Commit**: `feat(appointment): replace client/vehicle selects with live search in AppointmentDetail`

---

## Parallel Execution Map

```
Phase 1 (Parallel):
  T1 [P], T2 [P], T3 [P]

Phase 2 (mixed — two independent chains, each chain sequential):
  T2 done → T4 ──→ T6 (needs T1 too)
  T3 done → T5 ──→ T7 (needs T1 too)

Phase 3 (Parallel, after T6+T7):
  T8 [P], T9 [P], T10 [P], T11 [P], T12 [P], T13 [P]
```

**3 phases total → per the skill, sub-agent delegation is NOT mandatory (threshold is >3). Default to inline execution unless the user asks for sub-agents anyway given Phase 3's 6 tasks.**

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1: `LiveSelect` | 1 component | ✅ Granular |
| T2: `useClientForm` overrides | 1 hook, additive params only | ✅ Granular |
| T3: `useVehicleForm` overrides | 1 hook, additive params only | ✅ Granular |
| T4: `ClientQuickCreateModal` | 1 component | ✅ Granular |
| T5: `VehicleQuickCreateModal` | 1 component | ✅ Granular |
| T6: `ClientLiveSelect` | 1 component | ✅ Granular |
| T7: `VehicleLiveSelect` | 1 component | ✅ Granular |
| T8-T13: page wiring | 1 file change each | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | None | ✅ Match |
| T2 | None | None | ✅ Match |
| T3 | None | None | ✅ Match |
| T4 | T2 | T2→T4 | ✅ Match |
| T5 | T3 | T3→T5 | ✅ Match |
| T6 | T1, T4 | T1→T6, T4→T6 | ✅ Match |
| T7 | T1, T5 | T1→T7, T5→T7 | ✅ Match |
| T8 | T6, T7 | T6,T7→T8 | ✅ Match |
| T9 | T6, T7 | T6,T7→T9 | ✅ Match |
| T10 | T6, T7 | T6,T7→T10 | ✅ Match |
| T11 | T6, T7 | T6,T7→T11 | ✅ Match |
| T12 | T6, T7 | T6,T7→T12 | ✅ Match |
| T13 | T6, T7 | T6,T7→T13 | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | `LiveSelect` | unit | unit | ✅ OK |
| T2 | `useClientForm` | unit | unit | ✅ OK |
| T3 | `useVehicleForm` | unit | unit | ✅ OK |
| T4 | `ClientQuickCreateModal` | unit | unit | ✅ OK |
| T5 | `VehicleQuickCreateModal` | unit | unit | ✅ OK |
| T6 | `ClientLiveSelect` | unit | unit | ✅ OK |
| T7 | `VehicleLiveSelect` | unit | unit | ✅ OK |
| T8-T13 | page wiring | unit | unit | ✅ OK |

No ❌ violations.
