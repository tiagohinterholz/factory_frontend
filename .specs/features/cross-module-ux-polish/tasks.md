# Cross-Module UX Polish Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Spec**: `.specs/features/cross-module-ux-polish/spec.md`
**Design**: skipped (see spec's Design phase note — pure reuse of existing patterns)
**Status**: Draft

---

## Test Coverage Matrix

> Generated from codebase sampling. Guidelines found: none (no `AGENTS.md`/`CLAUDE.md`/testing section in `README.md` for either repo) — strong defaults applied, floored by existing test depth sampled below.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Frontend: new `*LiveSelect` wrapper component (`ProductCategoryLiveSelect`, `ProductSubcategoryLiveSelect`) | unit | Mirrors `ManufacturerLiveSelect.test.jsx`/`ModelLiveSelect.test.jsx` depth: renders options, fires `onChange`, opens create modal, disabled-until-parent-chosen state where applicable | `src/modules/**/components/*LiveSelect.test.jsx` | `npm test` |
| Frontend: form page swapping a field to LiveSelect/adding a button (VehicleModelCreate/Edit, Vehicle edit, Product create/edit, WorkService create, PurchaseOrder create/edit) | unit | 1:1 to the story's own ACs — field renders as the new component, pre-fill on edit still works, button disabled/enabled/navigates correctly | `src/modules/**/pages/*.test.jsx` | `npm test` |
| Frontend: listing/display logic (ProductList columns, ProductItemForm option labels, budget/order line rendering) | unit | All branches named in the story's ACs (brand present/absent, subcategory present/absent, qty boundary values) | `src/modules/**/pages/*.test.jsx`, `src/modules/core/components/*.test.jsx` | `npm test` |
| Frontend: global structural test for icon-only buttons | unit (structural, repo-wide) | Already enforces title/aria-label on every icon-only button/link in `src/modules/**/*.jsx` — no new test needed, existing `icon-tooltips.test.js` just needs to keep passing | `src/test/icon-tooltips.test.js` | `npm test` |
| Frontend: new standalone Financial Subcategory pages (Create/Edit/List) | unit | Mirrors `ProductSubcategoryCreate.test.jsx`/`Edit`/`List` depth (if present) or, if the Product subcategory module has no dedicated tests today, same depth as `FinancialCategoryCreate.test.jsx`/`Edit` (sampled at Task 12's start) | `src/modules/financial-subcategory/pages/*.test.jsx` | `npm test` |
| Backend: `PurchaseOrderRepository.get_filtered` `search` param | unit/integration (pytest, DB-backed) | Key query paths: numeric id match, name icontains match, empty search no-op — mirrors existing `test_repository.py` style | `apps/purchases/tests/test_repository.py` | `HOST_DB=localhost PORT_DB=5433 pytest apps/purchases -q` |
| Backend: `PurchaseOrderListView.get` `search` query param wiring | integration (pytest, APIClient) | Happy path (digits → id match, text → name match) + no-param unaffected, mirrors `test_views.py` | `apps/purchases/tests/test_views.py` | `HOST_DB=localhost PORT_DB=5433 pytest apps/purchases -q` |

## Parallelism Assessment

> Generated from codebase — confirm before Execute.

| Test Type | Parallel-Safe? | Isolation Model | Evidence |
| --- | --- | --- | --- |
| Frontend Vitest (all) | Yes | Vitest's default worker-pool isolation per file; no shared backing store — components render against mocked hooks/query clients per test file | Sampled `ManufacturerLiveSelect.test.jsx`, `PurchaseOrderEdit.test.jsx`: each mocks its own hooks module-locally, no shared DB/global fixture |
| Backend pytest (purchases) | No | Shared Postgres test DB per `test_repository.py`/`test_views.py` — Django's test-DB transaction wrapping is per-test but the suite as sampled runs sequentially against one DB connection, consistent with how the rest of `apps/` is run in this project (`pytest apps -q`, no `-n auto` seen in CI/local commands used earlier this session) | Prior sessions in this project always ran `pytest apps -q` single-process against `localhost:5433` |

## Gate Check Commands

> Generated from codebase — confirm before Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick (frontend) | After any single frontend task | `npm test -- <path-to-test-file>` |
| Full (frontend) | After a phase completes | `npm run lint && npm run format:check && npm test` |
| Quick (backend) | After the UXP-14 backend task | `HOST_DB=localhost PORT_DB=5433 pytest apps/purchases -q` |
| Full (backend) | After the UXP-14 phase completes | `HOST_DB=localhost PORT_DB=5433 pytest apps -q && flake8 apps --max-line-length=79 --count && isort apps --check-only` |
| Build | After the final phase (whole feature) | `npm run build` (frontend) — backend has no separate build step |

---

## Execution Plan

### Phase 1: Vehicle module (Sequential)

```
T1 → T2
```

### Phase 2: Product module + subcategory foundation (Sequential, feeds Phase 1's sibling work)

```
T3 → T4 → T5 → T6 ─┬→ T7
                     ├→ T8
                     └→ T9
T6 → T10
```

### Phase 3: Service module (Sequential, standalone)

```
T11
```

### Phase 4: Purchase module (Sequential — each step needs the previous field wired)

```
T12 → T13 → T14 → T15
```

### Phase 5: Budget/Order module (Sequential — shared component, one file at a time)

```
T16 → T17 → T18
```

### Phase 6: Financial subcategory module (Sequential — new pages depend on each other's routes)

```
T19 → T20 → T21 → T22
```

---

## Task Breakdown

### T1: Create `ProductCategoryLiveSelect` wrapper + quick-create modal

**What**: New `ProductCategoryLiveSelect.jsx` + `ProductCategoryQuickCreateModal.jsx`, mirroring `ManufacturerLiveSelect.jsx`/`ManufacturerQuickCreateModal.jsx` exactly (same props shape: `label`, `value`, `onChange`, `error`).
**Where**: `src/modules/productcategory/components/ProductCategoryLiveSelect.jsx`, `src/modules/productcategory/components/ProductCategoryQuickCreateModal.jsx`
**Depends on**: None
**Reuses**: `src/modules/vehicle/components/ManufacturerLiveSelect.jsx`, `ManufacturerQuickCreateModal.jsx`, `src/modules/core/components/LiveSelect.jsx`
**Requirement**: UXP-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Component renders `LiveSelect` wired to `useProductCategoryOptions()`, with `onCreateNew` opening the modal
- [ ] Modal posts a name-only create, calls `onChange(String(created.id))` on success
- [ ] Gate check passes: `npm test -- src/modules/productcategory/components/ProductCategoryLiveSelect.test.jsx`
- [ ] Test count: 4+ tests pass (renders options, selects existing, create-new flow, error prop forwarded)

**Tests**: unit
**Gate**: quick

---

### T2: Swap ProductSubcategory "Categoria" to `ProductCategoryLiveSelect`

**What**: Replace the plain `SelectField` in ProductSubcategory create/edit with T1's component.
**Where**: `src/modules/productsubcategory/pages/ProductSubcategoryCreate.jsx`, `src/modules/productsubcategory/pages/ProductSubcategoryEdit.jsx`
**Depends on**: T1
**Reuses**: T1's `ProductCategoryLiveSelect`

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Both pages render `ProductCategoryLiveSelect` instead of `SelectField` for "Categoria"
- [ ] Edit page pre-selects the existing category correctly
- [ ] Inline "cadastrar novo" creates and selects a category without navigating away
- [ ] Gate check passes: `npm test -- src/modules/productsubcategory`
- [ ] Test count: existing tests + 2 new assertions (inline create, pre-fill) pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(productsubcategory): use LiveSelect for categoria field`

---

### T3: Swap VehicleModel "Marca" to `ManufacturerLiveSelect`

**What**: Replace the plain `SelectField` in VehicleModel create/edit with the already-existing `ManufacturerLiveSelect`.
**Where**: `src/modules/vehiclemodel/pages/VehicleModelCreate.jsx`, `src/modules/vehiclemodel/pages/VehicleModelEdit.jsx`
**Depends on**: None
**Reuses**: `src/modules/vehicle/components/ManufacturerLiveSelect.jsx` (zero new code)
**Requirement**: UXP-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Both pages render `ManufacturerLiveSelect` for "Marca"
- [ ] Edit page pre-selects the existing manufacturer correctly
- [ ] Inline "cadastrar novo" creates and selects a manufacturer without navigating away
- [ ] Gate check passes: `npm test -- src/modules/vehiclemodel`
- [ ] Test count: existing tests + 2 new assertions pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(vehiclemodel): use LiveSelect for marca field`

---

### T4: Vehicle edit — add "ver cliente" button

**What**: Add the Eye-icon button beside `ClientLiveSelect` on the vehicle edit page, copying `WorkServiceDetail.jsx`'s button markup/behavior, pointed at `/clientes/:id`.
**Where**: `src/modules/vehicle/pages/VehicleDetail.jsx`
**Depends on**: None
**Reuses**: `src/modules/workservice/pages/WorkServiceDetail.jsx`'s Eye-button block (lines ~72-91)
**Requirement**: UXP-06

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Button renders beside "Cliente Proprietário", disabled when `clientId` is empty
- [ ] Clicking it navigates to `/clientes/${clientId}`
- [ ] Button has `title`/`aria-label` (keeps `icon-tooltips.test.js` green)
- [ ] Gate check passes: `npm test -- src/modules/vehicle src/test/icon-tooltips.test.js`
- [ ] Test count: existing tests + 2 new assertions (disabled state, navigation) pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(vehicle): add view-client button next to cliente field`

---

### T5: Product edit — add "ver fornecedor" button

**What**: Add the same Eye-icon button beside `SupplierLiveSelect` on `ProductDetail.jsx`.
**Where**: `src/modules/product/pages/ProductDetail.jsx`
**Depends on**: None
**Reuses**: Same `WorkServiceDetail.jsx` button block as T4
**Requirement**: UXP-07

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Button renders beside "Fornecedor", disabled when empty, navigates to `/fornecedores/:id`
- [ ] Has `title`/`aria-label`
- [ ] Gate check passes: `npm test -- src/modules/product/pages/ProductDetail.test.jsx src/test/icon-tooltips.test.js`
- [ ] Test count: existing tests + 2 new assertions pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(product): add view-supplier button next to fornecedor field`

---

### T6: Create `ProductSubcategoryLiveSelect` wrapper (filtered by category) + quick-create modal

**What**: New wrapper, same shape as T1 but filtered by a `categoryId` prop (options from `useProductSubcategoryOptionsByCategory(categoryId)`), disabled until a category is chosen — mirrors `ModelLiveSelect`'s "disabled until manufacturer chosen" pattern exactly.
**Where**: `src/modules/productsubcategory/components/ProductSubcategoryLiveSelect.jsx`, `src/modules/productsubcategory/components/ProductSubcategoryQuickCreateModal.jsx`
**Depends on**: T1 (reuses `ProductCategoryLiveSelect` pattern as the direct template; also needs T2 merged first since both touch `productsubcategory/`)
**Reuses**: `src/modules/vehicle/components/ModelLiveSelect.jsx`, `ModelQuickCreateModal.jsx`
**Requirement**: UXP-03 (AC2-4)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Component disabled with hint text when `categoryId` is empty
- [ ] Options refresh when `categoryId` changes
- [ ] Inline create modal accepts a pre-filled `categoryId`
- [ ] Gate check passes: `npm test -- src/modules/productsubcategory/components/ProductSubcategoryLiveSelect.test.jsx`
- [ ] Test count: 5+ tests (disabled state, options refresh on category change, create flow, pre-filled category in modal, error prop)

**Tests**: unit
**Gate**: quick

---

### T7: Product form — swap "Categoria" to `ProductCategoryLiveSelect` [P]

**What**: Replace Product create/edit's plain `SelectField` "Categoria" with T1's component.
**Where**: `src/modules/product/pages/ProductCreate.jsx`, `src/modules/product/pages/ProductDetail.jsx`
**Depends on**: T6
**Reuses**: T1's `ProductCategoryLiveSelect`
**Requirement**: UXP-03 (AC1)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Both pages render `ProductCategoryLiveSelect` for "Categoria"
- [ ] Gate check passes: `npm test -- src/modules/product/pages`
- [ ] Test count: existing + 1 new assertion pass

**Tests**: unit
**Gate**: quick

---

### T8: Product form — swap "Subcategoria" to `ProductSubcategoryLiveSelect`, wire category-change clearing [P]

**What**: Replace "Subcategoria" with T6's component; on category change, clear subcategory value if it no longer belongs.
**Where**: `src/modules/product/pages/ProductCreate.jsx`, `src/modules/product/pages/ProductDetail.jsx`
**Depends on**: T6, T7 (same files)
**Reuses**: T6's `ProductSubcategoryLiveSelect`
**Requirement**: UXP-03 (AC2, AC3, AC4)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] "Subcategoria" disabled until "Categoria" has a value
- [ ] Changing category clears a now-invalid subcategory selection (Edge Case in spec)
- [ ] Inline create on subcategory pre-fills the already-chosen category
- [ ] Gate check passes: `npm test -- src/modules/product/pages`
- [ ] Test count: existing + 3 new assertions (disabled, clear-on-change, pre-filled create) pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(product): use LiveSelect for categoria and subcategoria fields`

---

### T9: Fix "unidade de medida" datalist object/string mismatch [P]

**What**: Normalize `unitOfMeasureOptions` to plain strings (e.g. `.map(o => o.name)`) before passing into `FormField`'s `datalist` prop.
**Where**: `src/modules/product/pages/ProductCreate.jsx`, `src/modules/product/pages/ProductDetail.jsx`, `src/modules/product/constants/product.js` (only if normalizing at the source is cleaner than at each call site — pick one, don't do both)
**Depends on**: None (independent of T1-T8, grouped in this phase only for file-adjacency)
**Reuses**: `src/modules/core/components/FormField.jsx`'s existing string-based `datalist` rendering
**Requirement**: UXP-17

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Datalist renders plain unit-name strings, no `[object Object]`
- [ ] "Marca"'s datalist (the reference pattern) is unaffected
- [ ] Gate check passes: `npm test -- src/modules/product`
- [ ] Test count: existing + 1 new assertion (datalist option values are strings) pass

**Tests**: unit
**Gate**: quick

**Commit**: `fix(product): normalize unidade de medida datalist to strings`

---

### T10: Product listing — "Categoria / Sub-categoria" column + "Nome (Marca)" column [P]

**What**: Change the "Subcategoria" column to render `"{category.name} / {subcategory.name}"` with header "Categoria / Sub-categoria"; change the "Produto" column to render `"{name} ({brand})"` when brand is present.
**Where**: `src/modules/product/pages/ProductList.jsx`
**Depends on**: T6 (file-adjacency only, no real dependency — could run parallel to T7/T8/T9 since it's a different concern in the same module)
**Reuses**: existing column accessor pattern already in the file
**Requirement**: UXP-08, UXP-09

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Column header reads "Categoria / Sub-categoria"; cell shows combined path, falls back to "-" if no subcategory
- [ ] "Produto" column shows "{name} ({brand})" when brand present, plain "{name}" when absent
- [ ] Gate check passes: `npm test -- src/modules/product/pages/ProductList.test.jsx`
- [ ] Test count: existing + 4 new assertions (both columns, both branches each) pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(product): show category/subcategory path and brand in product list`

---

### T11: WorkService "Fornecedor" → `SupplierLiveSelect`, remove old add-supplier button

**What**: Replace `SelectField` with `SupplierLiveSelect` in WorkService create/edit; delete the "Cadastrar novo fornecedor" Plus button + its navigate-away handler from `WorkServiceCreate.jsx`.
**Where**: `src/modules/workservice/pages/WorkServiceCreate.jsx`, `src/modules/workservice/pages/WorkServiceDetail.jsx` (only the Fornecedor field; the Eye "ver fornecedor" button on Detail stays — it's being kept, not removed)
**Depends on**: None
**Reuses**: `src/modules/supplier/components/SupplierLiveSelect.jsx` (already proven on Product's form)
**Requirement**: UXP-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Both pages render `SupplierLiveSelect` for "Fornecedor"
- [ ] The old Plus button and its `navigate("/fornecedores/novo")` handler are gone from `WorkServiceCreate.jsx`
- [ ] Inline "cadastrar novo fornecedor" works without losing other form field values (verify via a test that fills another field first, then creates a supplier inline, then asserts the other field's value survived)
- [ ] Gate check passes: `npm test -- src/modules/workservice`
- [ ] Test count: existing (minus the now-removed button's tests, if any) + 2 new assertions pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(workservice): use LiveSelect for fornecedor, remove navigate-away add button`

---

### T12: PurchaseOrder "Fornecedor" → `SupplierLiveSelect` + "ver fornecedor" button (create + edit)

**What**: Replace `SelectField` with `SupplierLiveSelect` in both PurchaseOrderCreate and PurchaseOrderEdit; add the Eye "ver fornecedor" button beside it on both, disabled when empty/when order isn't "aberto" (edit only).
**Where**: `src/modules/purchase/pages/PurchaseOrderCreate.jsx`, `src/modules/purchase/pages/PurchaseOrderEdit.jsx`
**Depends on**: None
**Reuses**: `SupplierLiveSelect`, the Eye-button block from T4/T5
**Requirement**: UXP-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Both pages render `SupplierLiveSelect`; Edit keeps the existing disabled-when-not-"aberto" rule
- [ ] Eye button present on both, disabled when no supplier chosen, navigates to `/fornecedores/:id`
- [ ] Gate check passes: `npm test -- src/modules/purchase/pages/PurchaseOrderCreate.test.jsx src/modules/purchase/pages/PurchaseOrderEdit.test.jsx src/test/icon-tooltips.test.js`
- [ ] Test count: existing + 4 new assertions (2 pages × field + button) pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(purchase): use LiveSelect for fornecedor and add view-supplier button`

---

### T13: PurchaseOrderEdit — filter item picker by selected supplier, auto-fill + lock "Custo unit."

**What**: Swap the item picker's `useProductOptions()` (all products) for a supplier-filtered source (reuse `useSupplierRelations`/`getProductBySupplier(supplierId)`); make "Custo unit." auto-populate from the picked product's `unit_price` and render read-only.
**Where**: `src/modules/purchase/pages/PurchaseOrderEdit.jsx`
**Depends on**: T12 (needs the `SupplierLiveSelect`'s controlled value already wired)
**Reuses**: `src/modules/supplier/hooks/useSupplierRelations.js`, `src/modules/supplier/services/supplier.js`'s `getProductBySupplier`
**Requirement**: UXP-13

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Item picker disabled with hint when no supplier chosen
- [ ] Item picker only lists the selected supplier's products
- [ ] "Custo unit." auto-fills on product pick, is not editable (`readOnly`/`disabled` input), and updates when the picked product changes
- [ ] Gate check passes: `npm test -- src/modules/purchase/pages/PurchaseOrderEdit.test.jsx`
- [ ] Test count: existing + 4 new assertions (disabled state, filtered options, auto-fill, read-only) pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(purchase): filter items by supplier and lock auto-filled unit cost`

---

### T14: PurchaseOrderEdit — add `title`/`aria-label` to remove-item button

**What**: Add `title="Remover item"` + matching `aria-label` to the Trash2 remove button in the item list.
**Where**: `src/modules/purchase/pages/PurchaseOrderEdit.jsx`
**Depends on**: T13 (same file, sequenced to avoid merge conflicts)
**Reuses**: n/a — one-line attribute addition
**Requirement**: UXP-15

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Button has `title`/`aria-label`
- [ ] Gate check passes: `npm test -- src/test/icon-tooltips.test.js` (this is the actual enforcement — the structural test now passes for this file without a carve-out)
- [ ] Test count: `icon-tooltips.test.js` passes with no missing entries

**Tests**: unit (structural, already exists — no new test file needed per the matrix)
**Gate**: quick

**Commit**: `fix(purchase): add accessible label to remove-item button`

---

### T15: PurchaseOrderList — search by fornecedor or id (frontend filter field + backend param)

**What**: Add a "Buscar por fornecedor ou nº do pedido" text field to `filterFields`, wired to a new `search` query param; add the matching backend support.
**Where**:
  - Frontend: `src/modules/purchase/pages/PurchaseOrderList.jsx`
  - Backend: `apps/purchases/views/purchase_order_view.py` (`PurchaseOrderListView.get`), `apps/purchases/repositories/purchase_order_repository.py` (`get_filtered`)
**Depends on**: None (independent of T12-T14; grouped in this phase for module-adjacency)
**Reuses**: existing `ListFilters`/`applyFilters` pattern on the frontend; existing `get_filtered(business_id, status, supplier_id)` signature on the backend (adds one param, doesn't replace it)
**Requirement**: UXP-14

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Backend: `get_filtered` accepts `search=None`; when all-digits, filters `id=int(search)`; otherwise filters `supplier__corporate_name__icontains=search`; `None`/empty leaves the queryset untouched
- [ ] Backend: `PurchaseOrderListView.get` reads `params.get("search")` and forwards it
- [ ] Frontend: new filter field sends `search` as a query param via the existing `applyFilters`/`getPurchaseOrders(params)` flow
- [ ] Gate check passes (backend): `HOST_DB=localhost PORT_DB=5433 pytest apps/purchases -q`
- [ ] Gate check passes (frontend): `npm test -- src/modules/purchase/pages/PurchaseOrderList.test.jsx`
- [ ] Test count: backend existing + 3 new (id match, name match, empty no-op) in `test_repository.py`; +1 in `test_views.py` for param wiring; frontend existing + 1 new assertion

**Tests**: unit/integration (backend), unit (frontend)
**Gate**: full (backend — touches a shared repository method used elsewhere in the view); quick (frontend)

**Commit**: `feat(purchases): add search by supplier name or id to purchase order list`

---

### T16: `ProductItemForm` — show brand in option labels and search text

**What**: Prepend `"{brand} - "` to the option label when `product.brand` is present; include `brand` in `searchText`.
**Where**: `src/modules/core/components/ProductItemForm.jsx`
**Depends on**: None
**Reuses**: existing option-building logic in the same file
**Requirement**: UXP-10

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Label format matches spec example exactly: `"Pirelli - Pneu 175/68 (R$ 800,00) · estoque 2"` when branded, unchanged format when not
- [ ] Searching by brand text matches the option
- [ ] Gate check passes: `npm test -- src/modules/core/components/ProductItemForm.test.jsx`
- [ ] Test count: existing + 3 new assertions (branded label, unbranded label unchanged, brand search) pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(core): show brand in product item picker label and search`

---

### T17: `ProductItemForm` — enforce stock-based quantity upper bound

**What**: Add `amount > product.stock_quantity` to the existing validation (alongside the current `< 1`/non-integer check), surfaced via the same `setError` pattern.
**Where**: `src/modules/core/components/ProductItemForm.jsx`
**Depends on**: T16 (same file)
**Reuses**: existing `setError`/validation block
**Requirement**: UXP-16

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Quantity above `stock_quantity` is rejected with a clear message; exactly `stock_quantity` succeeds; `0`/negative/non-integer still rejected as before
- [ ] Zero-stock products remain visible in the picker (not filtered out)
- [ ] Gate check passes: `npm test -- src/modules/core/components/ProductItemForm.test.jsx`
- [ ] Test count: existing + 3 new assertions (over-stock rejected, exact-stock accepted, zero-stock still listed) pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(core): cap product item quantity at available stock`

---

### T18: Order/Budget line list — show unit price alongside line total

**What**: Render the per-unit price next to the existing quantity/total in each product line row.
**Where**: `src/modules/order/pages/OrderEdit.jsx`, `src/modules/budget/pages/BudgetEdit.jsx`
**Depends on**: T16, T17 (same `ProductItemForm`-adjacent data shape; sequenced to avoid overlapping assumptions about the line item's stored fields)
**Reuses**: existing `formatMoney`/line-rendering helpers in both files
**Requirement**: UXP-11

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Both pages' line rows show unit price AND `item.total`, even when quantity is 1
- [ ] Gate check passes: `npm test -- src/modules/order/pages/OrderEdit.test.jsx src/modules/budget/pages/BudgetEdit.test.jsx`
- [ ] Test count: existing + 2 new assertions (one per page) pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(order,budget): show unit price alongside line total`

---

### T19: Create standalone Financial Subcategory List page

**What**: New `FinancialSubcategoryList.jsx` mirroring `ProductSubcategoryList.jsx`: lists all subcategories via the existing `GET /subcategorias-financeiro/` (`FinancialEntrySubcategoryListView`), shows parent category name, links back to it, has a delete action calling the existing `DELETE /subcategorias-financeiro/:id/`.
**Where**: `src/modules/financial-category/pages/FinancialSubcategoryList.jsx`, route registration (wherever `productsubcategory`'s routes are registered, same file)
**Depends on**: None
**Reuses**: `src/modules/productsubcategory/pages/ProductSubcategoryList.jsx` as the direct template
**Requirement**: UXP-12 (AC1)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Page lists every subcategory with its category name and a link to the category
- [ ] Delete action works and refetches the list
- [ ] New route is reachable (e.g. `/subcategorias-financeiro`)
- [ ] Gate check passes: `npm test -- src/modules/financial-category/pages/FinancialSubcategoryList.test.jsx`
- [ ] Test count: 4+ tests (renders rows, shows category link, delete removes a row, empty state)

**Tests**: unit
**Gate**: quick

---

### T20: Create standalone Financial Subcategory Create page

**What**: New `FinancialSubcategoryCreate.jsx` mirroring `ProductSubcategoryCreate.jsx`, with "Categoria" as the already-existing `FinancialCategoryLiveSelect`, posting to `POST /subcategorias-financeiro/`.
**Where**: `src/modules/financial-category/pages/FinancialSubcategoryCreate.jsx`
**Depends on**: T19 (shares route registration block)
**Reuses**: `src/modules/financial-category/components/FinancialCategoryLiveSelect.jsx` (already exists, zero new component), `ProductSubcategoryCreate.jsx` as template
**Requirement**: UXP-12 (AC2)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Form renders `FinancialCategoryLiveSelect` for "Categoria" + a name field
- [ ] Submitting calls the existing create endpoint and redirects to the new list (T19)
- [ ] Gate check passes: `npm test -- src/modules/financial-category/pages/FinancialSubcategoryCreate.test.jsx`
- [ ] Test count: 3+ tests (renders, submits, validation error surfaced)

**Tests**: unit
**Gate**: quick

---

### T21: Create standalone Financial Subcategory Edit page

**What**: New `FinancialSubcategoryEdit.jsx` mirroring `ProductSubcategoryEdit.jsx`: loads via existing `GET /subcategorias-financeiro/:id/`, allows renaming and re-pointing "Categoria" via `FinancialCategoryLiveSelect`, saves via existing `PUT /subcategorias-financeiro/:id/`.
**Where**: `src/modules/financial-category/pages/FinancialSubcategoryEdit.jsx`
**Depends on**: T19, T20 (shares route registration + form field patterns)
**Reuses**: `ProductSubcategoryEdit.jsx` as template, `FinancialCategoryLiveSelect`
**Requirement**: UXP-12 (AC3)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Form pre-fills name + category correctly
- [ ] Rename and category re-point both save correctly via the existing PUT endpoint
- [ ] Gate check passes: `npm test -- src/modules/financial-category/pages/FinancialSubcategoryEdit.test.jsx`
- [ ] Test count: 4+ tests (pre-fill, rename, re-point category, validation error)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(financial-category): add standalone subcategory list/create/edit pages`

---

### T22: Remove the old inline subcategory widget from `FinancialCategoryEdit.jsx`

**What**: Delete the inline "nova subcategoria" mini-form + the plain `<ul>`/delete-only subcategory list from the category edit page; replace with a link to the new standalone list (T19), scoped to that category (e.g. `?category_id=`) if the list page supports a filter, otherwise a plain link to `/subcategorias-financeiro`.
**Where**: `src/modules/financial-category/pages/FinancialCategoryEdit.jsx`
**Depends on**: T19, T20, T21 (the replacement UI must exist before the old one is removed)
**Reuses**: n/a — deletion + one link
**Requirement**: UXP-12 (AC5)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Inline create widget and delete-only list are gone from this page
- [ ] A link to the standalone subcategory list/create is present instead
- [ ] Gate check passes: `npm test -- src/modules/financial-category`
- [ ] Test count: existing tests updated (old inline-widget assertions removed, replaced with link-presence assertion) pass, no net loss in assertion count

**Tests**: unit
**Gate**: full (closes out the Financial subcategory module — run `npm run lint && npm run format:check && npm test` here)

**Commit**: `refactor(financial-category): replace inline subcategory widget with standalone module link`

---

## Parallel Execution Map

```
Phase 1 (Vehicle — Sequential):
  T3 ──→ T4

Phase 2 (Product — mostly Sequential, one parallel branch):
  T1 ──→ T2 ──→ T6 ──┬→ T7 ──→ T8
                       ├→ T9  [P]
                       └→ T10 [P]
  (T5 has no dependency on this chain — runs any time in Phase 2)

Phase 3 (Service — standalone):
  T11

Phase 4 (Purchase — Sequential + one independent branch):
  T12 ──→ T13 ──→ T14
  T15 [P] (independent of T12-T14, same phase for module-adjacency)

Phase 5 (Budget/Order — Sequential):
  T16 ──→ T17 ──→ T18

Phase 6 (Financial subcategory — Sequential):
  T19 ──→ T20 ──→ T21 ──→ T22
```

**Parallelism constraint:** A task marked `[P]` must have ALL of these:
- No unfinished dependencies
- Required test type is parallel-safe (per the **Parallelism Assessment** above — all frontend tests are)
- No shared mutable state with other `[P]` tasks in the same phase

`[P]` is ordering information only — it tells the executing agent these tasks have no inter-task dependency and can be done in any order within the phase. It is NOT a directive to spawn a sub-agent per task.

**How phase-based execution works:** This feature has 6 phases (> 3) — per the skill's Sub-Agent Delegation rule, the orchestrator will offer to dispatch one sub-agent per phase (sequential) before Execute begins. The user must accept before any sub-agent is spawned.

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1: Create ProductCategoryLiveSelect + modal | 2 files, 1 concept (category live-select) | ✅ Granular |
| T2: Swap ProductSubcategory categoria field | 2 files, 1 field swap | ✅ Granular |
| T3: Swap VehicleModel marca field | 2 files, 1 field swap, zero new code | ✅ Granular |
| T4: Vehicle ver-cliente button | 1 file, 1 button | ✅ Granular |
| T5: Product ver-fornecedor button | 1 file, 1 button | ✅ Granular |
| T6: Create ProductSubcategoryLiveSelect + modal | 2 files, 1 concept | ✅ Granular |
| T7: Product categoria field swap | 2 files, 1 field | ✅ Granular |
| T8: Product subcategoria field swap + clear-on-change | 2 files, 1 field + its one coupled behavior | ✅ Granular |
| T9: Unidade de medida datalist bugfix | 2-3 files, 1 bug | ✅ Granular |
| T10: Product list 2 columns | 1 file, 2 closely-related display changes in the same table | ⚠️ OK — cohesive (same file, same "what does this row show" concern) |
| T11: WorkService fornecedor swap + button removal | 2 files, 1 field + its 1 directly-coupled removal (button exists only because LiveSelect didn't) | ⚠️ OK — cohesive, removal is a direct consequence of the swap |
| T12: PurchaseOrder fornecedor swap + view button | 2 files, 1 field + 1 button, same pattern as T4/T5 | ⚠️ OK — cohesive, mirrors a single established combo |
| T13: PurchaseOrder item filter + cost auto-fill | 1 file, 2 coupled behaviors (filter drives what auto-fill reads from) | ⚠️ OK — cohesive, genuinely coupled (cost auto-fill only makes sense once filtering exists) |
| T14: PurchaseOrder remove-item title | 1 file, 1 attribute | ✅ Granular |
| T15: PurchaseOrder search (frontend + backend) | 3 files, 1 concept across 2 layers | ⚠️ OK — cohesive, a single filter feature necessarily spans view+repo+UI |
| T16: ProductItemForm brand label | 1 file, 1 concept | ✅ Granular |
| T17: ProductItemForm stock bound | 1 file, 1 validation rule | ✅ Granular |
| T18: Order/Budget unit price display | 2 files, 1 concept applied twice (same component family) | ⚠️ OK — cohesive, identical change in two consuming pages |
| T19: Financial subcategory list page | 1-2 files, 1 page | ✅ Granular |
| T20: Financial subcategory create page | 1 file, 1 page | ✅ Granular |
| T21: Financial subcategory edit page | 1 file, 1 page | ✅ Granular |
| T22: Remove old inline widget | 1 file, 1 removal + 1 link | ✅ Granular |

No ❌ — every ⚠️ is a single cohesive concern spanning at most 2-3 files, not a "build the whole feature" task.

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | None | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | None | None (own Phase 1) | ✅ Match |
| T4 | None | None (own Phase 1) | ✅ Match |
| T5 | None | parallel, no arrow needed | ✅ Match |
| T6 | T1 (+T2 same files) | T2 → T6 | ✅ Match |
| T7 | T6 | T6 → T7 | ✅ Match |
| T8 | T6, T7 | T7 → T8 | ✅ Match |
| T9 | None | T6 →[P] T9 (phase-adjacency only) | ✅ Match |
| T10 | T6 (file-adjacency only) | T6 →[P] T10 | ✅ Match |
| T11 | None | standalone Phase 3 | ✅ Match |
| T12 | None | standalone start of Phase 4 | ✅ Match |
| T13 | T12 | T12 → T13 | ✅ Match |
| T14 | T13 | T13 → T14 | ✅ Match |
| T15 | None | [P], independent of T12-T14 | ✅ Match |
| T16 | None | standalone start of Phase 5 | ✅ Match |
| T17 | T16 | T16 → T17 | ✅ Match |
| T18 | T16, T17 | T17 → T18 | ✅ Match |
| T19 | None | standalone start of Phase 6 | ✅ Match |
| T20 | T19 | T19 → T20 | ✅ Match |
| T21 | T19, T20 | T20 → T21 | ✅ Match |
| T22 | T19, T20, T21 | T21 → T22 | ✅ Match |

All ✅ — no mismatches.

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | New LiveSelect wrapper component | unit | unit | ✅ OK |
| T2 | Form page field swap | unit | unit | ✅ OK |
| T3 | Form page field swap | unit | unit | ✅ OK |
| T4 | Form page button | unit | unit | ✅ OK |
| T5 | Form page button | unit | unit | ✅ OK |
| T6 | New LiveSelect wrapper component | unit | unit | ✅ OK |
| T7 | Form page field swap | unit | unit | ✅ OK |
| T8 | Form page field swap | unit | unit | ✅ OK |
| T9 | Form page bugfix | unit | unit | ✅ OK |
| T10 | Listing/display logic | unit | unit | ✅ OK |
| T11 | Form page field swap + removal | unit | unit | ✅ OK |
| T12 | Form page field swap + button | unit | unit | ✅ OK |
| T13 | Form page logic (filter + auto-fill) | unit | unit | ✅ OK |
| T14 | Icon-only button attribute | unit (structural, pre-existing) | unit | ✅ OK |
| T15 | Repository + view (backend) + filter field (frontend) | unit/integration (backend), unit (frontend) | unit/integration (backend), unit (frontend) | ✅ OK |
| T16 | Listing/display logic (shared component) | unit | unit | ✅ OK |
| T17 | Domain validation logic (shared component) | unit | unit | ✅ OK |
| T18 | Listing/display logic | unit | unit | ✅ OK |
| T19 | New page | unit | unit | ✅ OK |
| T20 | New page | unit | unit | ✅ OK |
| T21 | New page | unit | unit | ✅ OK |
| T22 | Page removal + link | unit | unit | ✅ OK |

All ✅ — no violations. No task defers its tests to a later task.

---

## Tools and Skills for Execution

No project MCPs or skills beyond `tlc-spec-driven` itself are needed for any task — every task is a direct code edit/addition following an existing in-repo template (no external API research, no new library). This will be confirmed with the user before Execute per the skill's process (step 6 of Tasks).
