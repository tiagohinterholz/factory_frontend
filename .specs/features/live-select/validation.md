# Live Select (Cliente/Veículo) Validation

**Date**: 2026-10-23
**Spec**: `.specs/features/live-select/spec.md`
**Diff range**: `stable..HEAD` (working tree, uncommitted — one prior `docs(specs)` commit on this branch is docs-only, confirmed)
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

| Task                             | Status                          | Notes                                                                                                                                                                                                                                |
| -------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| T1 `LiveSelect`                  | ✅ Done                         | `src/modules/core/components/LiveSelect.jsx` — Combobox `immediate`, `getSearchText` default `option.name`, create-shortcut gated on `onCreateNew && filtered.length === 0`. 7/7 tests pass (`LiveSelect.test.jsx`).                 |
| T2 `useClientForm` overrides     | ✅ Done                         | `src/modules/client/hooks/useClientForm.js:10` — `{ redirectTo = "/clientes", onSuccess } = {}`, default identical to pre-feature hardcoded value. 2/2 tests pass.                                                                   |
| T3 `useVehicleForm` overrides    | ✅ Done                         | `src/modules/vehicle/hooks/useVehicleForm.js:10` — `{ clientId, redirectTo = "/veiculos", onSuccess } = {}`, default identical to pre-feature value. 2/2 tests pass.                                                                 |
| T4 `ClientQuickCreateModal`      | ✅ Done                         | `src/modules/client/components/ClientQuickCreateModal.jsx` — exact field set (PF/PJ toggle, nome/sobrenome/CPF or razão social/CNPJ, estado→cidade, telefone), no extra fields. 6/6 tests pass.                                      |
| T5 `VehicleQuickCreateModal`     | ✅ Done                         | `src/modules/vehicle/components/VehicleQuickCreateModal.jsx` — marca→modelo, ano, ano modelo, placa, combustível; `client_id` locked from prop; defensive no-`clientId` refusal + `console.warn`. 7/7 tests pass.                    |
| T6 `ClientLiveSelect`            | ✅ Done                         | `src/modules/client/components/ClientLiveSelect.jsx` — filters by name+document, create shortcut, auto-select on create, empty-list behavior. 4/4 tests pass.                                                                        |
| T7 `VehicleLiveSelect`           | ✅ Done                         | `src/modules/vehicle/components/VehicleLiveSelect.jsx` — filters by `clientId` then by plate/marca+modelo text, disabled+hint without `clientId`, create shortcut, auto-select on create. 5/5 tests pass.                            |
| T8 Wire `OrderCreate.jsx`        | ✅ Done                         | Both fields swapped, "trocar cliente limpa veículo" wired (`setValue("vehicle_id","")`) — **but see Discrimination Sensor**: the new test for this exact behavior does not discriminate (survives removal of the clear call).        |
| T9 Wire `OrderEdit.jsx`          | ✅ Done, with flagged deviation | Swapped; `withSelectedOption`/`relatedVehicle` fallback removed (see dedicated section below). Loading guard simplified to `if (loading)` only — verified safe (controlled component, no longer uncontrolled-`<select>` BUG-1 race). |
| T10 Wire `BudgetCreate.jsx`      | ✅ Done                         | New `BudgetCreate.test.jsx` created as required (page had no test before). Same weak-assertion pattern as T8 for the clear-vehicle test.                                                                                             |
| T11 Wire `BudgetEdit.jsx`        | ✅ Done, with flagged deviation | Same as T9 — `withSelectedOption`/`relatedClient`/`relatedVehicle` removed; BUG-1 comment and guard removed (verified safe, see below).                                                                                              |
| T12 Wire `AppointmentCreate.jsx` | ✅ Done                         | New `AppointmentCreate.test.jsx` created as required. Same weak-assertion pattern.                                                                                                                                                   |
| T13 Wire `AppointmentDetail.jsx` | ✅ Done, with flagged deviation | Same as T9/T11 for client/vehicle (OS `withSelectedOption` fallback kept — order list fallback is untouched and correctly still uses it).                                                                                            |

**13/13 tasks functionally complete.** Two cross-cutting issues found independently of task-by-task completion (see Discrimination Sensor and Flagged Deviation sections) — both are quality/regression concerns, not missing work.

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y)                                                                                                   | Spec-defined outcome                                                                                                                                                      | `file:line` + assertion                                                                                                                                                                                                                                        | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LIVESEL-01: clica no campo Cliente → abre lista com todos os clientes + filtro no topo                                      | Combobox opens on click/focus, shows all loaded options                                                                                                                   | `src/modules/core/components/LiveSelect.test.jsx:12-20` — `user.click(combobox)` then `findByRole("option", {name:"Ana Silva"})` and `"Bruno Souza"` both found                                                                                                | ✅ PASS                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| LIVESEL-02: digita no filtro → só nome/razão social OU documento, case-insensitive                                          | Substring match, case-insensitive, name OR document                                                                                                                       | `src/modules/client/components/ClientLiveSelect.test.jsx:21-36` — types `"222.555"` (Bruno's CPF fragment), asserts Bruno found, Ana absent                                                                                                                    | ✅ PASS                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| LIVESEL-03: nenhum cliente bate → mostra "Cadastrar novo cliente"                                                           | Create-shortcut option appears, labeled exactly                                                                                                                           | `ClientLiveSelect.test.jsx:38-50` — types non-matching text, finds option named "Cadastrar novo cliente"                                                                                                                                                       | ✅ PASS                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| LIVESEL-04: aciona criar cliente → abre modal com campos mínimos, sem perder formulário-pai                                 | Modal opens inline (no navigation), exact field set                                                                                                                       | `ClientQuickCreateModal.test.jsx:54-69` — asserts all 7 required fields present AND `queryByText("E-mail")`/`"Endereço"` absent                                                                                                                                | ✅ PASS                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| LIVESEL-05: modal cliente submetido com sucesso → cria via API, fecha modal, seleciona no campo-pai, atualiza lista         | Create → `onCreated(client)` → parent `onChange(id)` → modal closes; list refetch via existing cache invalidation (`clientKeys.all`, pre-existing code, not newly tested) | `ClientLiveSelect.test.jsx:66-112` — `onChange` called with `"99"`, dialog closes                                                                                                                                                                              | ✅ PASS (list-refresh leg relies on pre-existing, previously-verified invalidate wiring — not a new-code gap)                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| LIVESEL-06: clica no campo Veículo → lista filtrada pelo cliente já selecionado + filtro texto                              | Options filtered by `clientId` first                                                                                                                                      | `src/modules/vehicle/components/VehicleLiveSelect.test.jsx:40-54` — `clientId={9}`, only that client's vehicle shown                                                                                                                                           | ✅ PASS                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| LIVESEL-07: nenhum veículo do cliente bate → "Cadastrar novo veículo"                                                       | Create-shortcut, exact label                                                                                                                                              | `VehicleLiveSelect.test.jsx:81-95`                                                                                                                                                                                                                             | ✅ PASS                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| LIVESEL-08: aciona criar veículo com cliente selecionado → modal com client_id travado + marca/modelo/ano/placa/combustível | Exact field set, no Cliente field rendered                                                                                                                                | `VehicleQuickCreateModal.test.jsx:62-79` — asserts field set AND `queryByText("Cliente")` absent                                                                                                                                                               | ✅ PASS                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| LIVESEL-09: aciona criar veículo sem cliente → impede ação, indica escolher cliente primeiro                                | Disabled, no create-shortcut, hint shown                                                                                                                                  | `VehicleLiveSelect.test.jsx:72-79` — `input` disabled, `placeholder="Escolha um cliente primeiro"`                                                                                                                                                             | ✅ PASS                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| LIVESEL-10: modal veículo submetido com sucesso → cria via API, fecha, seleciona no campo-pai, atualiza lista               | Same shape as LIVESEL-05                                                                                                                                                  | `VehicleLiveSelect.test.jsx:97-139` — `onChange` called with `"55"`, dialog closes                                                                                                                                                                             | ✅ PASS                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Edge case: lista vazia → mostra direto o atalho, sem "nenhum resultado"                                                     | No "no results" message, create shortcut shown directly                                                                                                                   | `ClientLiveSelect.test.jsx:52-64`                                                                                                                                                                                                                              | ✅ PASS (Client). ⚠️ No equivalent direct test at `VehicleLiveSelect` layer for an empty vehicle list — mechanism is shared/identical code path through `LiveSelect`, so low-risk, but evidence-or-zero means this specific combination isn't independently cited. **Spec-precision gap (trivial).**                                                                                                                                                                                                                                                  |
| Edge case: trocar cliente DEPOIS de escolher veículo → limpa veículo                                                        | `vehicle_id` form value reset to `""`                                                                                                                                     | `src/modules/order/pages/OrderCreate.test.jsx:253-268` and equivalents in `OrderEdit.test.jsx`, `BudgetCreate.test.jsx`, `BudgetEdit.test.jsx`, `AppointmentCreate.test.jsx`, `AppointmentDetail.test.jsx` — all assert `expect(vehicleInput).toHaveValue("")` | ⚠️ **Spec-precision gap** — production code is correct (verified by reading all 6 diffs: every page calls `setValue("vehicle_id", "")` / `resetChildren("vehicle_id", ...)` on client change), but the _test_ assertion is not discriminating — see Discrimination Sensor mutation 2 below. The blank display is equally explained by `VehicleLiveSelect`'s own `clientId` filtering (the previously-selected vehicle belongs to the old client, so it's filtered out of options and would display blank even if the clear side-effect were deleted). |
| Edge case: criação falha no modal → erro aparece no modal, não fecha                                                        | Field-level error, modal stays open                                                                                                                                       | `ClientQuickCreateModal.test.jsx:103-140`, `VehicleQuickCreateModal.test.jsx:100-136` — both validation and backend-field-error cases                                                                                                                          | ✅ PASS                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Edge case: fecha modal sem salvar → sem efeito colateral                                                                    | `onClose` called, `onCreated` not called, no side effects                                                                                                                 | `ClientQuickCreateModal.test.jsx:142-152`, `VehicleQuickCreateModal.test.jsx:138-146`                                                                                                                                                                          | ✅ PASS                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

**Status**: ⚠️ Gaps present — 1 real spec-precision gap (the "trocar cliente limpa veículo" assertion family is confounded, not actually proving the claimed mechanism) + 1 trivial evidence gap (vehicle empty-list case not independently cited). All 10 numbered LIVESEL ACs pass with precise, non-vague assertions.

---

## Discrimination Sensor

| #   | File:line                                                               | Description                                                                                                                              | Killed?                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `src/modules/core/components/LiveSelect.jsx:42`                         | Changed `showCreateShortcut = Boolean(onCreateNew) && filtered.length === 0` → `Boolean(onCreateNew)` (shortcut shows even with matches) | ✅ Killed — `LiveSelect.test.jsx` "mostra o atalho de criação só quando onCreateNew está definido E nada bate" fails as expected                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2   | `src/modules/order/pages/OrderCreate.jsx` (ClientLiveSelect `onChange`) | Removed `setValue("vehicle_id", "")` from the client-change handler (the exact side-effect the spec's edge case requires)                | ❌ **Survived** — `OrderCreate.test.jsx` still 4/4 green. The "trocar cliente limpa veículo" test only checks the _displayed_ text of the vehicle combobox, which independently goes blank because `VehicleLiveSelect` filters its options by the (new) `clientId` and the old vehicle doesn't belong to the new client — so the display blanks out whether or not the clear side-effect exists. This is the same test pattern repeated across all 6 wired pages (`OrderEdit`, `BudgetCreate`, `BudgetEdit`, `AppointmentCreate`, `AppointmentDetail`), so this is a **systemic** weak-test family, not a one-off. |
| 3   | `src/modules/vehicle/hooks/useVehicleForm.js:10`                        | Changed default `redirectTo` from `"/veiculos"` to `"/clientes"` (the exact regression risk flagged in design.md's Risks table)          | ✅ Killed — `useVehicleForm.test.jsx` "chamado com só { clientId }... navega pra /veiculos" fails as expected                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

All 3 mutations reverted; `git diff --stat` confirmed clean on the 3 touched files before moving on (`LiveSelect.jsx` untracked-file content re-verified by direct read; `OrderCreate.jsx` and `useVehicleForm.js` diff-stat matched pre-mutation state exactly).

**Sensor depth**: lightweight (3 mutations)
**Result**: 2/3 killed, 1 survived → **the surviving mutant is a real finding**, not a sensor false negative. Fix task recommended (see Ranked Gaps).

---

## Flagged Deviation Investigation: loss of `withSelectedOption` on the 3 Edit pages

**What `withSelectedOption` did and why it existed** (confirmed via `git show stable:src/api/dto.js` and commit `bde4f70` "fix(options): garante a opção selecionada nos `<select>` de edição"):

> "O select dos formulários de edição podia vir vazio quando o registro vinculado não estava na lista de opções — cache com staleTime alto (registro criado agora) ou filtro em cascata que corta o valor. Aí um 'salvar' apagava a FK sem o usuário perceber."

This is a **different** and more serious failure mode than the implementer's deviation note suggests at first read: the original native `<select>` was _uncontrolled_ (bound via RHF `register()`), so if the linked client/vehicle's `<option>` wasn't mounted, RHF's internal field value itself could end up wrong/empty, and submitting would **silently erase the FK**. `withSelectedOption(options, selectedId, fallbackOption)` prepended a synthetic option built from the detail payload (`relatedClient`/`relatedVehicle`) whenever the linked id was missing from the fetched list, specifically to prevent that data loss. (A separate, narrower bug — BUG-1, commit `6709644` — was about `form.reset` racing the first page-load before options mounted; that one is now structurally eliminated by the controlled-component rewrite, confirmed by the simplified `if (loading)` guards in `OrderEdit.jsx`/`BudgetEdit.jsx`.)

**Empirical confirmation of the implementer's claim** (traced directly in code, not taken on faith):

- `LiveSelect.jsx:41` — `const selected = options.find((option) => String(option.id) === String(value ?? "")) ?? null`
- `LiveSelect.jsx:66` — `displayValue={() => selected?.name ?? ""}`
- `LiveSelect.jsx:56` — `<Combobox value={value ?? ""} onChange={handleChange} ...>` — the Combobox is **controlled**: its `value` is whatever the parent page's RHF `watch("client_id")`/`watch("vehicle_id")` holds, completely independent of whether that id is present in `options`.

So: if the linked id isn't in the fetched options list, `selected` is `null`, the input **displays blank**, but the underlying RHF field value is untouched — confirmed directly (not just by the implementer's rewritten tests) by the data flow above. On submit, `handleSubmit` reads the RHF state, not the display text, so the id is preserved. The implementer's claim is accurate: this is a real but purely cosmetic regression, and the old catastrophic failure mode (FK erased on save) is gone for a different, structural reason (controlled vs. uncontrolled component), not because the fallback mechanism was replaced with an equivalent.

**Severity assessment — likelihood is understated by the implementer's framing.** The implementer characterized the trigger as "stale options cache" (implying a transient few-minutes window, since `useClientOptions`/`useVehicleOptions` use `staleTime: 5 * 60_000`). Investigating the backend (`apps/core/repositories/base_repository.py:59-60`, `apps/customers/services/client_service.py:83` `anonymize()`, `apps/core/repositories/base_repository.py:94-98` `delete()`) shows a **second, permanent** trigger that the implementer did not mention:

- `BaseRepository.get_all()` auto-filters `is_active=True` whenever the model has that field — this backs the `GET /clientes/`/`GET /veiculos/` list endpoints that `useClientOptions`/`useVehicleOptions` consume.
- `BaseRepository.delete()` is a **soft delete** (`is_active = False`), not a real row delete — this is what `ClientDetail`/`VehicleDetail`'s "Excluir" action does, and client anonymization (LGPD) also sets `is_active = False`.
- Deleting/anonymizing a client or vehicle does **not** cascade-null the FK on existing Orders/Budgets/Appointments — those records keep pointing at the now-inactive row.

So the actual trigger is not "cache is a few minutes old" — it's "**any** historical Order/Budget/Appointment whose linked client or vehicle has since been soft-deleted or anonymized" — a normal, supported, permanent condition, not a transient race. Opening that record's Edit page will **permanently** show a blank Cliente/Veículo field (never resolves, since the record will never reappear in the active-only options list). This is exactly the scenario `withSelectedOption` was purpose-built to solve (per commit `bde4f70`'s own description), and all 3 Edit pages (`OrderEdit`, `BudgetEdit`, `AppointmentDetail`) already have the data needed to fix it cheaply: `relatedClient`/`relatedVehicle` are still fetched from the detail payload and used elsewhere on the same pages (e.g. `OrderEdit.jsx:172` `<WhatsAppButton phone={relatedClient?.phone}>`, `AppointmentDetail.jsx:223-232` `RelatedDataCard` labels) — they were simply disconnected from the live-select fields when `withSelectedOption` was removed.

**Verdict: real regression needing a fix task — not an acceptable trade-off.** Reasoning:

1. The triggering condition (soft-deleted/anonymized client or vehicle still referenced by historical documents) is a normal, already-supported operation in this codebase, not a hypothetical edge case.
2. The code being removed was deliberately built in direct response to this exact scenario (commit `bde4f70`) — removing it without a replacement is a feature regression, even though the consequence is now cosmetic rather than data-destroying.
3. Orders/Budgets/Appointments are the system's core financial/operational documents (per project memory: "v1 scope is financial control") — losing the ability to see which client/vehicle a historical, possibly-invoiced record belongs to is a real usability regression for exactly the kind of back-office/audit review this system is meant to support.
4. The fix is small and well-scoped: add an optional prop to `LiveSelect` (e.g. `extraOption={{ id, name }}`) that is merged into `options` for display purposes whenever `value` matches `extraOption.id` and it's absent from the fetched list — i.e., port `withSelectedOption`'s exact logic into the composite layer — then thread `relatedClient`/`relatedVehicle` (already available) through `ClientLiveSelect`/`VehicleLiveSelect` on the 3 Edit pages only. No change needed to the 3 Create pages (no linked record exists yet) or to the generic `LiveSelect` contract beyond the new optional prop.

---

## Code Quality

| Principle                                                                    | Status                                                                                                                    |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Minimum code                                                                 | ✅                                                                                                                        |
| Surgical changes                                                             | ✅ — scope matches the 13 tasks exactly                                                                                   |
| No scope creep                                                               | ✅                                                                                                                        |
| Matches patterns                                                             | ✅ — reuses `Modal.jsx`, existing schemas, `FilterSelect.jsx` Tailwind classes, Headless UI `Combobox` per design doc     |
| Spec-anchored outcome check (asserted values match spec)                     | ⚠️ — 1 test family (trocar cliente limpa veículo) asserts the right-looking outcome via a confounded mechanism; see above |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅                                                                                                                        |
| Every test maps to a spec requirement — no unclaimed tests                   | ✅                                                                                                                        |
| Documented guidelines followed                                               | none in repo (`CLAUDE.md`/`AGENTS.md` absent) — strong defaults applied, consistent with tasks.md's own note              |

---

## Edge Cases

- [x] Lista vazia → atalho direto, sem "nenhum resultado" (Client: tested; Vehicle: shared mechanism, not independently tested — trivial gap)
- [x] Trocar cliente limpa veículo — **production behavior correct in all 6 pages (manually verified in diff)**, but **test coverage for this specific behavior is not discriminating** (see Sensor #2)
- [x] Erro de validação/backend no modal → erro no modal, não fecha
- [x] Fechar modal sem salvar → sem efeito colateral
- [ ] "Registro vinculado ausente da lista de opções continua visível" (pre-existing `withSelectedOption` guarantee) — **regressed on the 3 Edit pages**, not an explicit spec edge case but a real functional loss (see Flagged Deviation section)

---

## Gate Check

- **Gate command**: `cd factory_project_frontend && npx vitest run --silent && npm run lint && npm run format:check`
- **Result**: vitest 488/488 passed, 0 failed; lint 0 errors; **format:check FAILED** — 6 files need formatting:
  - `.specs/features/client-vehicle-supplier-product-ux/design.md`
  - `.specs/features/client-vehicle-supplier-product-ux/spec.md`
  - `.specs/features/client-vehicle-supplier-product-ux/tasks.md`
  - `.specs/features/live-select/design.md`
  - `.specs/features/live-select/spec.md`
  - `.specs/features/live-select/tasks.md`
  - All 6 are pre-existing spec/doc files from the earlier `docs(specs)` commit already on this branch, not touched by any of T1-T13's code changes. No application source file fails formatting. Trivial fix: `npx prettier --write` on those 6 files.
- **Test count before feature**: not independently measured (no pre-feature baseline run performed by this Verifier); the diff adds 2 new page-test files (`AppointmentCreate.test.jsx`, `BudgetCreate.test.jsx`) plus net-new test files for every new component/hook — consistent with the Test Coverage Matrix's expectations, no evidence of deleted/weakened pre-existing tests.
- **Test count after feature**: 488 passed, 96 test files, all green.
- **Skipped tests**: none observed.
- **Failures**: `npm run format:check` only, scoped to pre-existing docs, not code.

---

## Fix Plans

### Fix 1: Restore "show linked-but-missing client/vehicle" fallback on the 3 Edit pages

- **Root cause**: `withSelectedOption` was removed from `OrderEdit.jsx`, `BudgetEdit.jsx`, `AppointmentDetail.jsx` when swapping to `ClientLiveSelect`/`VehicleLiveSelect`, and neither composite has an equivalent mechanism. A soft-deleted/anonymized (but still FK-referenced) client or vehicle will permanently display blank on these 3 pages' live-select fields, even though the underlying `client_id`/`vehicle_id` form value (and therefore the save) stays correct.
- **Fix task**: Add an optional `extraOption` (or `pinnedOption`) prop to `LiveSelect` — `{ id, name }`, merged into the options list used for `selected`/display lookup (and ideally into `filtered` too) whenever `String(extraOption.id) === String(value)` and it's not already present, mirroring `withSelectedOption`'s exact semantics. Thread `relatedClient`/`relatedVehicle` (already fetched by `useOrderEditForm`/`useBudgetEditForm`-equivalent/`useAppointmentEditForm`) through `ClientLiveSelect`/`VehicleLiveSelect` on the 3 Edit pages only.
- **Verify**: Re-add (in spirit) the removed "mantém o cliente/veículo vinculados no select quando o cache de opções não os tem" test, but assert on the **displayed label**, not just the submitted payload — e.g. `expect(clientInput).toHaveValue("Ana Lima")` with an empty `/clientes/` mock, same shape as the pre-feature `OrderEdit.test.jsx`/`BudgetEdit.test.jsx` tests that were rewritten away in this diff.
- **Priority**: Major

### Fix 2: Strengthen the "trocar cliente limpa veículo" test family (6 pages)

- **Root cause**: The assertion `expect(vehicleInput).toHaveValue("")` is satisfied by `VehicleLiveSelect`'s own `clientId`-based option filtering even if the actual clear side-effect (`setValue("vehicle_id", "")` / `resetChildren(...)`) is removed — confirmed by Discrimination Sensor mutation #2 surviving in `OrderCreate.test.jsx`. The production code is correct (manually verified), but this test family doesn't prove it.
- **Fix task**: In each of the 6 affected tests (`OrderCreate.test.jsx`, `OrderEdit.test.jsx`, `BudgetCreate.test.jsx`, `BudgetEdit.test.jsx`, `AppointmentCreate.test.jsx`, `AppointmentDetail.test.jsx`), additionally submit the form after the client switch and assert the API payload's `vehicle_id` is empty/absent — directly testing the RHF field value rather than the (confounded) display text.
- **Verify**: Re-run Discrimination Sensor mutation #2 (remove the clear call) against the strengthened tests — confirm it now fails.
- **Priority**: Minor (production behavior is already correct; this is a test-quality/regression-safety-net gap)

### Fix 3: `prettier --write` the 6 pre-existing spec doc files

- **Root cause**: Markdown formatting drift in `.specs/features/live-select/*.md` and `.specs/features/client-vehicle-supplier-product-ux/*.md`, predating Execute.
- **Fix task**: `npx prettier --write .specs/features/live-select/*.md .specs/features/client-vehicle-supplier-product-ux/*.md`, then re-run `npm run format:check`.
- **Priority**: Cosmetic

---

## Requirement Traceability Update

| Requirement                                                       | Previous Status                                | New Status                                |
| ----------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------- |
| LIVESEL-01                                                        | Pending                                        | ✅ Verified                               |
| LIVESEL-02                                                        | Pending                                        | ✅ Verified                               |
| LIVESEL-03                                                        | Pending                                        | ✅ Verified                               |
| LIVESEL-04                                                        | Pending                                        | ✅ Verified                               |
| LIVESEL-05                                                        | Pending                                        | ✅ Verified                               |
| LIVESEL-06                                                        | Pending                                        | ✅ Verified                               |
| LIVESEL-07                                                        | Pending                                        | ✅ Verified                               |
| LIVESEL-08                                                        | Pending                                        | ✅ Verified                               |
| LIVESEL-09                                                        | Pending                                        | ✅ Verified                               |
| LIVESEL-10                                                        | Pending                                        | ✅ Verified                               |
| Edge case: trocar cliente limpa veículo                           | Pending                                        | ⚠️ Needs Fix (test, not production code)  |
| (unlisted) "registro vinculado ausente da lista continua visível" | n/a (pre-existing guarantee, not a LIVESEL AC) | ❌ Needs Fix (regression on 3 Edit pages) |

---

## Summary

**Overall**: ⚠️ Issues — functionally complete and spec-compliant for all 10 numbered ACs, but with one real (cosmetic, non-data-loss) regression that should get a fix task, one systemic weak-test family caught by the discrimination sensor, and a trivial doc-formatting gate failure.

**Spec-anchored check**: 10/10 numbered LIVESEL ACs matched spec outcome; 2 spec-precision/evidence gaps flagged (empty-vehicle-list not independently tested; "trocar cliente limpa veículo" test confounded)

**Sensor**: 2/3 mutations killed, 1 survived (systemic across 6 pages)

**Gate**: 488 passed, 0 failed (vitest); lint clean; format:check failed (6 pre-existing doc files, no app code)

**What works**: `LiveSelect`, `ClientLiveSelect`/`VehicleLiveSelect`, both quick-create modals, and all 6 page wirings are functionally correct and well-tested against the spec's 10 ACs and 4 edge cases. The `useClientForm`/`useVehicleForm` regression risk flagged in design.md's Risks table was correctly mitigated (defaults unchanged, confirmed by a killed mutation).

**Issues found**:

1. `withSelectedOption` fallback lost on 3 Edit pages → real, if cosmetic, regression for soft-deleted/anonymized clients/vehicles still referenced by historical records (Fix 1, Major).
2. "Trocar cliente limpa veículo" tests across 6 pages don't actually discriminate the clear behavior from unrelated filtering (Fix 2, Minor — production code itself is correct).
3. `format:check` fails on 6 pre-existing spec doc files (Fix 3, Cosmetic).

**Next steps**: Route Fix 1 and Fix 2 as fix tasks before closing the feature; Fix 3 can be folded into either or done standalone with `prettier --write`. No changes needed to the 10 numbered ACs' implementation itself.

---

## Round 2 Re-verification (2026-10-23)

**Verifier**: independent sub-agent (different pass, author ≠ verifier), re-deriving all evidence from scratch — none of Round 1's findings taken on faith.

### Gap 1 re-check (missing-option fallback, was Major)

**Merge logic read directly** — `src/modules/core/components/LiveSelect.jsx:39-42`:

```js
const allOptions =
  extraOption && !options.some((option) => String(option.id) === String(extraOption.id))
    ? [extraOption, ...options]
    : options
```

Correct: string-compared id presence check, prepends only when absent — no duplicate-entry risk when the id IS in `options`, and falls back to the extra option's own `{id, name}` for display when absent. `selected`/`displayValue`/`filtered` all derive from `allOptions`, so the fallback also participates correctly in search/selection, not just initial display.

**Wiring read directly** in all 3 edit pages — confirmed `extraClientOption`/`extraVehicleOption` built from `relatedClient`/`relatedVehicle` (via `idOf()` + a `clientLabel`/`vehicleLabel` degrade-to-`#id` helper) and passed as `extraOption={...}` to `ClientLiveSelect`/`VehicleLiveSelect`:

- `src/modules/order/pages/OrderEdit.jsx:164-171,239,249`
- `src/modules/budget/pages/BudgetEdit.jsx:165-172,259,269`
- `src/modules/appointment/pages/AppointmentDetail.jsx:100-107,176,189`

`ClientLiveSelect.jsx:35` and `VehicleLiveSelect.jsx:52` both thread `extraOption` straight through to `LiveSelect` unchanged — no transformation bug possible at that layer.

**Targeted tests run**: `npx vitest run src/modules/core/components/LiveSelect.test.jsx src/modules/order/pages/OrderEdit.test.jsx` → **2 files, 31 tests, all passed**.

**Scratch mutation (BudgetEdit.jsx — the page NOT covered by the implementer's own new `OrderEdit.test.jsx` fallback test)**: reverted the `extraOption={extraClientOption}` / `extraOption={extraVehicleOption}` props (left everything else, including `extraClientOption`/`extraVehicleOption` construction, in place — isolates exactly the wiring). Ran `npx vitest run src/modules/budget/pages/BudgetEdit.test.jsx`:

**Result: 16/16 tests still PASSED.** The mutation is NOT caught. Restored via full-file rewrite from a pre-mutation backup; `diff` against the backup confirmed byte-identical; `git status --short` before/after matched exactly (no residual).

**New finding (not in Round 1, confirmed independently here)**: the implementer's fix itself is correct and complete — read directly, all 3 edit pages wire `extraOption` identically and the merge logic is sound. But **only `OrderEdit.test.jsx` got a discriminating "desativado/anonimizado" test for this fix** (`grep` for `extraOption|relatedClient|relatedVehicle|withSelectedOption|desativad|anonimiz` across `OrderEdit.test.jsx`/`BudgetEdit.test.jsx`/`AppointmentDetail.test.jsx` only matches in `OrderEdit.test.jsx`). `BudgetEdit.test.jsx`'s only related test (`"mantém o client_id/vehicle_id no submit mesmo quando o cache de opções não traz o registro vinculado"`, line 89) asserts the **submit payload**, not the **displayed label** — and that assertion is satisfied by RHF's own controlled `value` regardless of `extraOption`, so it was never going to catch this regression (confirmed: it's exactly the test present before AND after the mutation, and it kept passing). `AppointmentDetail.test.jsx` has no related test at all. **If `extraOption` wiring were ever accidentally dropped from `BudgetEdit.jsx` or `AppointmentDetail.jsx` in a future change, no test in the suite would catch it** — the same "regression-safety-net" shape of problem Round 1 flagged for Gap 2, now recurring for Gap 1's own fix, on 2 of the 3 pages it was meant to protect.

**Verdict: production fix verified correct and complete across all 3 pages (direct code inspection) — but test-coverage evidence is NOT complete across all 3 pages, only 1 of 3 (`OrderEdit`).** This is a genuine residual gap per the task's own evidence bar ("closed, evidence across all 3 edit pages").

### Gap 2 re-check (weak clear-vehicle tests, was Minor)

**Zod schema check** — all three confirmed `vehicle_id` is required, not optional:

- `src/modules/order/domain/schema.js:19` — `vehicle_id: requiredId("Selecione o veículo")`
- `src/modules/budget/domain/schema.js:12` — `vehicle_id: requiredId("Selecione o veículo")`
- `src/modules/appointment/domain/schema.js:9` — `vehicle_id: requiredId("Selecione o veículo")`
- `requiredId` (`src/modules/core/schemas/br-fields.js:17`) = `z.string().trim().min(1, message)` — empty string fails validation, `handleSubmit` never invokes the submit callback, so "assert the payload's `vehicle_id` is empty" is indeed structurally impossible. The stated reasoning holds for all 3 pages/schemas.

**New assertions read** in all 6 tests (`OrderCreate.test.jsx`, `OrderEdit.test.jsx`, `BudgetCreate.test.jsx`, `BudgetEdit.test.jsx`, `AppointmentCreate.test.jsx`, `AppointmentDetail.test.jsx`) — each now has a `"...realmente limpa o vehicle_id do form, não só o texto exibido"` test asserting both `expect(<service>).not.toHaveBeenCalled()` and `expect(await screen.findByText("Selecione o veículo")).toBeInTheDocument()` after switching client without reselecting vehicle.

**Scratch mutation (`AppointmentCreate.jsx` — not `OrderCreate.jsx`, which the implementer already mutation-tested)**: removed `resetChildren("vehicle_id", "order_id")` from the client `ClientLiveSelect`'s `onChange` handler (`src/modules/appointment/pages/AppointmentCreate.jsx:58-61`), leaving `setValue("client_id", value)` only. Ran `npx vitest run src/modules/appointment/pages/AppointmentCreate.test.jsx`:

**Result: 1 failed, 4 passed (5 tests).** The failing test was exactly `"trocar o cliente proprietário realmente limpa o vehicle_id do form, não só o texto exibido"` — the new, strengthened assertion. Confirms it genuinely discriminates: the older, weaker display-only test in the same file (`"trocar o cliente proprietário depois de escolher o veículo limpa o veículo"`) **still passed** under the same mutation, reproducing exactly the confounding Round 1 identified (display blanks out via `VehicleLiveSelect`'s own `clientId` filter regardless of the clear side-effect) — while the new test is immune to that confound and correctly fails. Restored `AppointmentCreate.jsx` from a pre-mutation backup; `diff` confirmed byte-identical; `git status --short` matched the pre-mutation baseline exactly.

**Verdict: Gap 2 closed.** Reasoning is factually correct (all 3 schemas), and the new assertions are proven — not just claimed — to discriminate the real clear-effect from the confounding display filter.

### Regression gate

- `npx vitest run --silent` → **96 test files, 497 tests, all passed**, 0 failed, 0 skipped.
- `npm run lint` → exit code 0, no errors/warnings output.
- `npm run format:check` → `All matched files use Prettier code style!` (the 6 pre-existing `.specs/**/*.md` files from Round 1's Gap 3 are now clean, confirmed `prettier --write` was applied to them as claimed).

All mutations injected during this pass (`BudgetEdit.jsx` extraOption removal, `AppointmentCreate.jsx` clear-effect removal) were reverted before the gate run; the gate run above is on the clean, unmutated tree. `git status --short` immediately before the gate run matched the tree's state at the start of this Round 2 pass exactly (same modified/untracked file list, no stray changes).

### Round 2 Summary

**Gap 1**: production code genuinely fixed and correct on all 3 edit pages (verified by direct reading, not just tests) — but test-coverage evidence for that fix is incomplete: only `OrderEdit.test.jsx` has a discriminating test; `BudgetEdit.test.jsx` and `AppointmentDetail.test.jsx` do not, and a scratch mutation proved `BudgetEdit.test.jsx`'s 16 tests don't catch the wiring being silently dropped. **New finding, not closed per the round's own evidence bar.**

**Gap 2**: closed. Reasoning verified true for all 3 schemas; new assertions proven to discriminate via a scratch mutation on a page the implementer didn't already test (`AppointmentCreate.jsx`).

**Gap 3** (format:check, Cosmetic, Round 1): closed, confirmed via full gate run.

**Regression gate**: 497/497 passed, lint clean, format:check clean.

**Overall: FAIL** — not because any production behavior is wrong (all 3 edit pages correctly show the fallback and correctly clear the vehicle on client change), but because the task's explicit bar for closing Gap 1 — discriminating test evidence across all 3 edit pages — is only met for 1 of 3. Recommended minimal fix: port the `OrderEdit.test.jsx` "desativado/anonimizado" test pattern (empty `/clientes/`+`/veiculos/` mocks, assert `combobox` still shows the linked name) into `BudgetEdit.test.jsx` and `AppointmentDetail.test.jsx`.

---

## Round 3 Re-verification (2026-10-23)

**Verifier**: independent sub-agent, final pass (round 3 of max 3), re-deriving all evidence from scratch — none of Round 2's findings taken on faith.

### Gap 1 final re-check (missing-option fallback test coverage, Round 2's one open item)

Since Round 2, the orchestrator directly edited `BudgetEdit.test.jsx` and `AppointmentDetail.test.jsx`, renaming/rewriting each file's existing submit-payload test into `"cliente/veículo vinculados mas desativados (fora da lista de opções) continuam visíveis e no submit"`, adding two display-value assertions (`clientInput`/`vehicleInput` combobox values) before the pre-existing submit-payload assertion.

**Assertion correctness, verified against each page's actual label logic (not assumed):**

- `BudgetEdit.jsx:160-164` — `clientLabel = client?.display_name || "Cliente #" + idOf(client)`; `vehicleLabel = (manufacturer || model) ? "${manufacturer} ${model} (${plate})" : "Veículo #" + idOf(vehicle)`. Test's `budget.client = {display_name: "Ana Lima"}` → `"Ana Lima"`; `budget.vehicle = {manufacturer:"VW", model:"Gol", plate:"ABC1D23"}` → `"VW Gol (ABC1D23)"`. Both match the test's expected values exactly.
- `AppointmentDetail.jsx:87-91` — `clientLabel` identical shape; `vehicleLabel = (model || manufacturer) ? "${manufacturer} ${model} ${year}".trim() : "Veículo #" + idOf(vehicle)` (no plate in this page's format, unlike BudgetEdit). Test's override `vehicle: {manufacturer:"WV", model:"Gol"}` (no year) → `"WV Gol ".trim()` = `"WV Gol"`, matching the test's expected value exactly — confirms the test author correctly used AppointmentDetail's distinct (no-plate) label format rather than copy-pasting BudgetEdit's plate-including format.
- Traced `relatedClient`/`relatedVehicle` source for `BudgetEdit.jsx` to `useBudgetEditForm.js:140-141` (`relatedClient: meta.client`, `relatedVehicle: meta.vehicle`) — confirms these map directly from the raw detail-payload nested objects, matching the mock shapes used in both test files' overrides.

**Targeted run**: `npx vitest run src/modules/budget/pages/BudgetEdit.test.jsx src/modules/appointment/pages/AppointmentDetail.test.jsx --silent` → **2 files, 26 tests, all passed.**

**Discrimination check (the exact gap from Round 2), repeated on both files this time:**

- `BudgetEdit.jsx`: scratch-edited lines 259/269, replacing `extraOption={extraClientOption}` / `extraOption={extraVehicleOption}` with `extraOption={undefined}`. Ran `BudgetEdit.test.jsx` alone → **1 failed, 15 passed** — the failure is exactly the new/edited test (`clientInput`/`vehicleInput` display-value assertions time out, both still expected `"Ana Lima"`/`"VW Gol (ABC1D23)"` but got blank). Reverted both lines; `git diff` on the file shows zero occurrences of `extraOption={undefined}` afterward — clean.
- `AppointmentDetail.jsx`: same scratch mutation on lines 176/189. Ran `AppointmentDetail.test.jsx` alone → **1 failed, 9 passed** — same failure mode, same target test (`"Ana Lima"`/`"WV Gol"` assertions). Reverted; `git diff` confirmed zero occurrences of `extraOption={undefined}` afterward — clean.

Both files now genuinely discriminate the exact regression Round 2 proved `BudgetEdit.test.jsx` missed. **Gap 1 is closed on all 3 edit pages** — production code (verified in Round 2 by direct reading, re-confirmed here) and test coverage (newly closed here) both hold.

### Full regression gate

- `npx vitest run --silent` → **96 test files, 497 tests, all passed**, 0 failed, 0 skipped — same count as Round 2's gate (497), confirming no tests were lost or weakened by the orchestrator's direct edits.
- `npm run lint` → exit clean, no errors/warnings output.
- `npm run format:check` → `All matched files use Prettier code style!` — confirms the orchestrator's `prettier --write` on `validation.md` (and everything else) left the repo format-clean.

All scratch mutations (`BudgetEdit.jsx` and `AppointmentDetail.jsx` `extraOption` removal) were reverted before this gate run; `git status --short` and `git diff` on both files were checked immediately after reverting and matched the pre-mutation state (only the pre-existing, legitimate uncommitted feature changes remain — no residual `extraOption={undefined}`).

### Round 3 Summary

**Gap 1**: closed on all 3 edit pages — `OrderEdit.test.jsx` (closed since Round 1/2), and now `BudgetEdit.test.jsx` + `AppointmentDetail.test.jsx` (closed this round), each with a discriminating test proven via scratch mutation to fail when the `extraOption` wiring is removed, and with display-value assertions independently verified against each page's own label-formatting logic (not copy-pasted between pages — `AppointmentDetail`'s no-plate format vs. `BudgetEdit`'s with-plate format were each checked separately).

**Gap 2** (weak clear-vehicle tests, Minor, Round 1): closed since Round 2, re-confirmed here by an unchanged, still-passing full gate.

**Gap 3** (format:check, Cosmetic, Round 1): closed since Round 2, re-confirmed here (`format:check` clean, including the now-formatted `validation.md` itself).

**Regression gate**: 497/497 passed (same count as Round 2 — no tests lost), lint clean, format:check clean.

**Overall: PASS** — all 3 gaps found across Rounds 1-2 are now closed with direct evidence (code reading + passing tests + scratch-mutation discrimination proof), the full gate is green, and no regressions were introduced by the orchestrator's direct test edits. The feature is ready to commit.

---

## Requirement Traceability Update (Round 3, final)

| Requirement                                                       | Round 2 Status                          | Final Status                             |
| ----------------------------------------------------------------- | --------------------------------------- | ---------------------------------------- |
| LIVESEL-01 through LIVESEL-10                                     | ✅ Verified (unchanged since Round 1)   | ✅ Verified                              |
| Edge case: trocar cliente limpa veículo                           | ✅ Verified (closed Round 2)            | ✅ Verified                              |
| (unlisted) "registro vinculado ausente da lista continua visível" | ❌ Needs Fix (test coverage incomplete) | ✅ Verified — closed on all 3 edit pages |

**Final feature verdict: PASS.** All numbered LIVESEL ACs, both edge cases, and the unlisted-but-real missing-option fallback guarantee are verified with discriminating evidence across Rounds 1-3.
