# Cross-Module UX Polish Specification

## Problem Statement

A backlog of 20 small, independent UX inconsistencies accumulated across Vehicle, Product, Service, Purchase, Budget/Order and Financial screens — mostly places where a plain `<select>` or a bare text column was never upgraded to the `LiveSelect` pattern (already proven and shipped in `live-select`/`client-vehicle-supplier-product-ux`) or never got the "view linked entity" button that other forms already have. Fixing these in one pass keeps every entity-picker field and every "view related record" affordance consistent across the app, instead of each screen drifting on its own.

Codebase research (done before writing this spec) found that **3 of the original 20 items are already fully implemented** (service NF panel on the order page, fiscal notes list filters/PDF/XML actions, and financial-entry tag free-text-with-autocomplete) — they are dropped from scope below, not built again. The remaining 17 are real gaps, confirmed file-by-file against the current code.

## Goals

- [ ] Every entity-reference field that has a matching `LiveSelect` precedent elsewhere in the app uses it consistently (Manufacturer, ProductCategory, ProductSubcategory, Supplier).
- [ ] Every form that links to another entity via a single FK offers the same "view linked entity" button the Services form already has, wherever the request asks for it.
- [ ] Financial category/subcategory management stops being a cramped inline widget and becomes a first-class module like Product's, with zero new backend endpoints (all already exist).
- [ ] Purchase order item entry can no longer record a logically wrong unit cost or a product the selected supplier doesn't sell.
- [ ] Budget/Order product line entry can no longer commit more quantity than the product has in stock.

## Out of Scope

| Feature                                                                                       | Reason                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Service NF-e panel mirroring the product NF panel on the Order detail page (original item 17) | Already built and wired — `ServiceFiscalNotePanel.jsx` is structurally identical to `FiscalNotePanel.jsx` and already renders conditionally on `OrderEdit.jsx`.                                                                                                                                                                                              |
| Fiscal notes list: filter by client/OS + print/download XML/PDF (original item 18)            | Already built — `FiscalNotes.jsx` already has Tipo/Status/Cliente/date-range filters and PDF/XML download actions with proper `title`s.                                                                                                                                                                                                                      |
| Financial entry tags: "select live" to add a new tag (original item 20)                       | `TagInput.jsx` already lets you type any name and press Enter/comma to add it as a new tag, with `<datalist>` autocomplete from existing tags — functionally the same capability (add-new-inline), just a chips widget instead of a `LiveSelect` dropdown. Replacing a working, more specialized widget with a generic one would be a regression, not a fix. |
| Any new backend model, permission, or migration                                               | Everything needed already exists server-side except one query param (see UXP-14) — this is overwhelmingly a frontend feature.                                                                                                                                                                                                                                |
| Reservation/allocation of stock across open Budgets/Orders                                    | Confirmed with user: stock caps use the product's live `stock_quantity` only, not stock minus other open documents — the system has no reservation concept today and this feature doesn't add one.                                                                                                                                                           |
| Changing a Purchase Order's `fornecedor` after items were already added                       | Narrow edge case, not part of the original request; existing items are left as-is if it happens (see Edge Cases).                                                                                                                                                                                                                                            |

---

## Assumptions & Open Questions

| Assumption / decision                                            | Chosen default                                                                                                                                                                                                                                 | Rationale                                                                                                                                                                                                                                                                                                                                                                                 | Confirmed?                                                                                  |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| "View linked entity" button behavior                             | Navigates to `/fornecedores/:id` or `/clientes/:id` in the same tab, leaving the current form (same as the existing Services→Fornecedor button)                                                                                                | User confirmed: consistency with the one precedent that already exists beats a new interaction pattern.                                                                                                                                                                                                                                                                                   | y                                                                                           |
| Purchase order "custo unit." auto-fill source                    | `product.unit_price` (sale price)                                                                                                                                                                                                              | User confirmed — no separate cost-price field exists on Product.                                                                                                                                                                                                                                                                                                                          | y                                                                                           |
| Budget/Order quantity cap basis                                  | Raw `product.stock_quantity`, no cross-document reservation                                                                                                                                                                                    | User confirmed — matches the system's current no-reservation behavior.                                                                                                                                                                                                                                                                                                                    | y                                                                                           |
| Financial subcategory module scope                               | Full standalone Create/Edit/List pages mirroring `productsubcategory`'s module exactly (own routes, list with parent-category link, rename support)                                                                                            | User confirmed. Verified this needs **zero new backend work** — `FinancialEntrySubcategoryListView`/`DetailView` already expose list-all (with search on `name`/`category__name`), get-by-id, update and delete; only `FinancialEntryCategoryLiveSelect` (already built) needs reuse in the new subcategory forms.                                                                        | y                                                                                           |
| Purchase order list "busca por fornecedor ou id" — matching rule | A single `search` query param: exact match if the typed text is all digits (treated as the PO's own `id`), otherwise `supplier__corporate_name__icontains`                                                                                     | `PurchaseOrderListView.get()` today only accepts `status`/`supplier_id` (exact FK), no free-text search — this is the one real backend touch in the feature (`apps/purchases/views/purchase_order_view.py`, `apps/purchases/repositories/purchase_order_repository.py` in `factory_project`). Rule chosen to match how "busca" fields behave elsewhere in the app (id-or-name heuristic). | n — reasonable default, not separately asked since it's a small, low-risk mechanical choice |
| Changing Purchase Order `fornecedor` after items exist           | Allowed; existing line items are left untouched (the item picker simply re-filters for _new_ adds going forward)                                                                                                                               | Not part of the original 20 items; retroactively clearing/validating existing lines is a bigger behavior change than asked for. Logged as an assumption per the Out-of-Scope table rather than silently dropped.                                                                                                                                                                          | n — declined gray area, default chosen to avoid scope creep                                 |
| Out-of-stock product visibility in the Budget/Order picker       | Stays visible in the picker (so the user can see it exists / is tracked), but adding it shows the existing inline error pattern (`setError("...")`) if the typed quantity exceeds available stock, same as today's "quantidade inválida" error | Hiding it entirely would make an existing product look deleted; the picker already surfaces stock count in the option label, so an explicit error on over-quantity is more informative than hiding the row.                                                                                                                                                                               | n — reasonable default                                                                      |
| Product's `unidade de medida` item (original item 6)             | Not a select→datalist conversion (already done) — scoped down to just fixing the `unitOfMeasureOptions` object-vs-string mismatch against `FormField`'s `datalist` prop                                                                        | Code research showed the field already uses the exact datalist pattern requested; the only real defect is a latent type mismatch worth fixing while touching this file.                                                                                                                                                                                                                   | y (scope correction confirmed by nature of the finding, not a judgment call)                |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1 — LiveSelect rollout (proven pattern, highest consistency win, lowest risk)

#### UXP-01: VehicleModel "Marca" uses LiveSelect ⭐ MVP

**User Story**: As a user creating/editing a vehicle model, I want the "Marca" field to behave like every other manufacturer field in the app (searchable, with inline "cadastrar novo"), so I don't have to leave the form to register a brand that doesn't exist yet.

**Why P1**: `ManufacturerLiveSelect` already exists and is already proven on the Vehicle form — this is strictly wiring, zero new code beyond the swap.

**Acceptance Criteria**:

1. WHEN the user opens VehicleModel create or edit THEN the "Marca" field SHALL render as `ManufacturerLiveSelect` instead of `SelectField`.
2. WHEN the user picks "Cadastrar novo" inside it THEN the system SHALL open `ManufacturerQuickCreateModal` and, on success, select the newly created manufacturer.
3. WHEN editing an existing VehicleModel THEN its current manufacturer SHALL appear pre-selected, identical to today's behavior.

**Independent Test**: Open VehicleModel create, type a brand name that doesn't exist, use "Cadastrar novo", confirm it becomes selected without leaving the page.

---

#### UXP-02: ProductSubcategory "Categoria" uses LiveSelect

**User Story**: As a user creating a product subcategory, I want to search/create a category inline instead of scrolling a plain dropdown.

**Why P1**: Same proven pattern; the only new code is a thin `ProductCategoryLiveSelect` wrapper (mirrors `ManufacturerLiveSelect` exactly) plus its quick-create modal.

**Acceptance Criteria**:

1. WHEN the user opens ProductSubcategory create or edit THEN "Categoria" SHALL render as a new `ProductCategoryLiveSelect` component.
2. WHEN no matching category exists THEN the user SHALL be able to create one inline via a `ProductCategoryQuickCreateModal` (name-only form, same shape as `ManufacturerQuickCreateModal`).
3. WHEN a category is created inline THEN it SHALL be immediately selected in the field.

**Independent Test**: Create a new ProductSubcategory, create a brand-new Categoria inline mid-flow, save, confirm the subcategory is linked to the new category.

---

#### UXP-03: Product "Categoria" and "Subcategoria" use LiveSelect

**User Story**: As a user creating/editing a product, I want to search/create categories and subcategories inline, consistent with how Fornecedor already works on this same form.

**Why P1**: Reuses `ProductCategoryLiveSelect` from UXP-02 plus one new `ProductSubcategoryLiveSelect` (filtered by the chosen category, mirrors `ModelLiveSelect`'s "disabled until manufacturer chosen" pattern).

**Acceptance Criteria**:

1. WHEN the user opens Product create or edit THEN "Categoria" SHALL render as `ProductCategoryLiveSelect`.
2. WHEN "Categoria" has no value THEN "Subcategoria" (`ProductSubcategoryLiveSelect`) SHALL render disabled with hint text, same convention as `ModelLiveSelect` when no manufacturer is chosen.
3. WHEN "Categoria" changes to a different category THEN "Subcategoria"'s options SHALL refresh to that category's subcategories, and SHALL clear its current value if it no longer belongs to the new category.
4. WHEN no subcategory exists for the chosen category THEN the user SHALL be able to create one inline (reuses UXP-02's create modal, pre-filled with the already-chosen category).

**Independent Test**: Create a product, pick a category with no subcategories yet, create one inline without navigating away, confirm it saves correctly linked.

---

#### UXP-04: WorkService "Fornecedor" uses LiveSelect; remove the old "add supplier" button

**User Story**: As a user creating a service, I want to search/create a supplier inline instead of being sent to a separate "new supplier" page that discards my in-progress service form.

**Why P1**: Direct value: today's "+" button on WorkServiceCreate navigates away and loses form state — LiveSelect's inline create modal fixes that outright.

**Acceptance Criteria**:

1. WHEN the user opens WorkService create or edit THEN "Fornecedor" SHALL render as `SupplierLiveSelect` instead of `SelectField`.
2. WHEN the user picks "Cadastrar novo fornecedor" inside it THEN the system SHALL open `SupplierQuickCreateModal` without leaving the service form or losing any already-typed field.
3. WHEN WorkServiceCreate renders THEN the standalone "Cadastrar novo fornecedor" button that navigates to `/fornecedores/novo` SHALL no longer be present (redundant with LiveSelect's own inline create).

**Independent Test**: Start a new service, type some fields, add a brand-new supplier inline via the Fornecedor field, confirm the previously-typed fields are still there and the service saves with the new supplier.

---

#### UXP-05: PurchaseOrder "Fornecedor" uses LiveSelect (create + edit)

**User Story**: As a user creating a purchase order, I want the same searchable/inline-create supplier field every other form already has.

**Why P1**: Same proven swap; also unblocks UXP-13 (item filtering needs a reliably-selected supplier id, which LiveSelect's controlled value already gives for free).

**Acceptance Criteria**:

1. WHEN the user opens PurchaseOrderCreate THEN "Fornecedor" SHALL render as `SupplierLiveSelect`.
2. WHEN the user opens PurchaseOrderEdit (the item-adding screen) and the order is still "aberto" THEN "Fornecedor" SHALL also render as `SupplierLiveSelect`; when not "aberto" it SHALL remain disabled exactly as today.
3. WHEN the order is "aberto" THEN a "ver fornecedor" Eye-icon button SHALL sit beside the field, disabled when no supplier is chosen, navigating to `/fornecedores/:id` — same markup/behavior as `WorkServiceDetail.jsx`'s existing button (per the confirmed assumption).

**Independent Test**: Create a purchase order picking a brand-new supplier inline, confirm the "ver fornecedor" button becomes enabled and navigates correctly once a supplier is set.

---

### P2 — View buttons, listing/display clarity, financial subcategory module

#### UXP-06: Vehicle edit — "ver cliente" button

**User Story**: As a user editing a vehicle, I want a button next to "Cliente Proprietário" to jump to that client's record, same as Services already offers for its Fornecedor.

**Acceptance Criteria**:

1. WHEN the user opens Vehicle edit (`VehicleDetail.jsx`) THEN an Eye-icon button SHALL appear beside the `ClientLiveSelect` "Cliente Proprietário" field.
2. WHEN no client is selected THEN the button SHALL be disabled.
3. WHEN clicked with a client selected THEN the system SHALL navigate to `/clientes/:id`.

**Independent Test**: Open an existing vehicle's edit page, click "ver cliente", land on that client's page.

---

#### UXP-07: Product edit — "ver fornecedor" button

**User Story**: As a user editing a product, I want the same "ver fornecedor" affordance Services already has.

**Acceptance Criteria**:

1. WHEN the user opens Product edit (`ProductDetail.jsx`) THEN an Eye-icon button SHALL appear beside the `SupplierLiveSelect` "Fornecedor" field, disabled when empty, navigating to `/fornecedores/:id` when clicked — identical markup/behavior to `WorkServiceDetail.jsx`.

**Independent Test**: Open an existing product, click "ver fornecedor", land on that supplier's page.

---

#### UXP-08: Product listing shows "Categoria / Sub-categoria"

**User Story**: As a user scanning the product list, I want to see the full category path, not just the subcategory name floating with no context.

**Acceptance Criteria**:

1. WHEN the product list renders THEN the column currently showing only `item.subcategory.name` SHALL show `"{category.name} / {subcategory.name}"` (falling back to `"-"` only if the product has no subcategory at all, same as today).
2. WHEN the column header renders THEN its title SHALL change from "Subcategoria" to "Categoria / Sub-categoria".

**Independent Test**: Open the product list, confirm the column header and cell values both show the combined path for a product that has a subcategory.

---

#### UXP-09: Product listing shows "Nome (Marca)"

**User Story**: As a user scanning the product list, I want to see the brand next to the product name without opening each row.

**Acceptance Criteria**:

1. WHEN the product list renders a product with a non-empty `brand` THEN the "Produto" column SHALL show `"{name} ({brand})"`.
2. WHEN `brand` is empty/null THEN the column SHALL show just `{name}`, unchanged from today.

**Independent Test**: Confirm a product with a brand shows "X (Y)" and one without a brand shows unchanged "X".

---

#### UXP-10: Budget/Order product picker shows brand

**User Story**: As a user adding a product to a budget/OS, I want to see its brand in the picker so I can tell apart near-identical items (e.g. two tire brands), matching the example given: "Pirelli - Pneu 175/68 (R$ 800,00) - estoque: 2".

**Acceptance Criteria**:

1. WHEN `ProductItemForm` builds its option labels THEN a product with a non-empty `brand` SHALL render as `"{brand} - {name} ({price}) · estoque {qty}"`.
2. WHEN `brand` is empty THEN the label SHALL keep today's `"{name} ({price}) · estoque {qty}"` format.
3. WHEN the user searches the picker by brand name THEN it SHALL match (the existing `searchText` field, which already includes name/reference/sku, SHALL also include `brand`).

**Independent Test**: In Budget or Order edit, open the product picker, confirm a branded product's option reads "Marca - Nome (preço) · estoque N" and is findable by typing the brand.

---

#### UXP-11: Budget/Order line list shows unit price AND line total

**User Story**: As a user reviewing a budget/OS's product lines, I want to see both the per-unit price and the line's total, not just the total.

**Acceptance Criteria**:

1. WHEN a product line renders in `OrderEdit.jsx` or `BudgetEdit.jsx` THEN it SHALL show the per-unit price (`product.unit_price` or the line's own stored unit price, whichever the line item persists) alongside the existing quantity and the already-multiplied `item.total`.
2. WHEN the quantity is 1 THEN unit price and total SHALL both be visible even though they're numerically equal (no suppression logic).

**Independent Test**: Add 3 units of a R$100 product to a budget, confirm the line shows "R$ 100,00" (unit) and "R$ 300,00" (total) simultaneously, not just one.

---

#### UXP-12: Financial subcategory gets a standalone CRUD module

**User Story**: As a user managing financial categories, I want subcategory management to work exactly like product subcategories — its own create/edit/list pages reachable directly, with rename support — instead of a cramped create-only widget buried inside the category's edit page.

**Why P2**: Pure UX parity fix; zero new backend work since every needed endpoint already exists (`FinancialEntrySubcategoryListView`/`DetailView`).

**Acceptance Criteria**:

1. WHEN the user navigates to a new standalone subcategory list route THEN the system SHALL list every financial subcategory with its parent category name and a link back to that category — mirroring `ProductSubcategoryList.jsx` exactly.
2. WHEN the user opens a standalone "create subcategory" page THEN "Categoria" SHALL render as the already-existing `FinancialCategoryLiveSelect`, and saving SHALL call the existing `POST /subcategorias-financeiro/`.
3. WHEN the user opens a standalone "edit subcategory" page THEN the form SHALL load via the existing `GET /subcategorias-financeiro/:id/`, allow renaming and re-pointing the category, and save via the existing `PUT /subcategorias-financeiro/:id/`.
4. WHEN the user deletes a subcategory from the new list THEN it SHALL call the existing `DELETE /subcategorias-financeiro/:id/`.
5. WHEN `FinancialCategoryEdit.jsx`'s old inline "nova subcategoria" mini-widget is reached THEN it SHALL be removed in favor of a link to the new standalone create page (no duplicate, drifting UI for the same action).

**Independent Test**: From the new subcategory list, create one, rename it, move it to a different category, delete it — all without ever opening a category's edit page.

---

### P3 — Purchase order intelligence, stock guard, cleanups

#### UXP-13: PurchaseOrder item picker filters by supplier; "custo unit." auto-fills and locks

**User Story**: As a user adding items to a purchase order, I want to only see what the selected supplier actually sells, and I don't want to mistype the cost when the system already knows the price.

**Acceptance Criteria**:

1. WHEN a supplier is selected on PurchaseOrderEdit THEN the product picker SHALL only list products whose `supplier_id` matches the selected supplier (reusing `useSupplierRelations`/`getProductBySupplier`, not the unfiltered `useProductOptions()`).
2. WHEN no supplier is selected yet THEN the item picker SHALL be disabled with a hint, same convention as other supplier-gated fields in this feature.
3. WHEN a product is picked from the filtered list THEN "Custo unit." SHALL auto-populate with that product's `unit_price` and SHALL become read-only (per the confirmed assumption) — not editable free text.
4. WHEN the user changes the selected product in the add-item row THEN "Custo unit." SHALL update to the newly picked product's price, replacing any previous value.

**Independent Test**: Pick a supplier, confirm the item dropdown only shows that supplier's products, pick one, confirm cost auto-fills and the input cannot be typed into.

---

#### UXP-14: PurchaseOrder list — search by fornecedor or id

**User Story**: As a user looking for a specific purchase order, I want one search box that works whether I remember the order number or the supplier's name.

**Acceptance Criteria**:

1. WHEN the user types a purely numeric value into the new search field THEN the list SHALL filter to the purchase order whose `id` matches exactly.
2. WHEN the user types a non-numeric value THEN the list SHALL filter to purchase orders whose supplier's `corporate_name` contains it (case-insensitive).
3. WHEN the search field is empty THEN the list SHALL behave exactly as today (existing status/supplier filters unaffected).
4. **Backend**: `PurchaseOrderListView.get()` (`apps/purchases/views/purchase_order_view.py`) SHALL accept a new `search` query param and pass it to `PurchaseOrderRepository.get_filtered()`, which SHALL apply the id-or-name rule above.

**Independent Test**: Search by an order's numeric id, confirm only that order shows; clear and search by a partial supplier name, confirm matching orders show.

---

#### UXP-15: PurchaseOrder edit — remove-item button gets a title

**User Story**: As a keyboard/screen-reader user, I want every icon-only button in this screen to be labeled, not just the ones in the list view.

**Acceptance Criteria**:

1. WHEN the item-list remove (Trash2) button renders in `PurchaseOrderEdit.jsx` THEN it SHALL have `title="Remover item"` and a matching `aria-label`.

**Independent Test**: Hover the remove-item button, confirm a tooltip appears.

---

#### UXP-16: Budget/Order product picker enforces stock-based quantity bounds

**User Story**: As a user adding a product to a budget/OS, I don't want to be able to commit more units than physically exist in stock, or a negative/zero quantity.

**Acceptance Criteria**:

1. WHEN the user sets a quantity for a selected product THEN the system SHALL reject (via the existing inline error pattern, not a native HTML `min`/`max` alone) any value `< 1` or `> product.stock_quantity`.
2. WHEN `product.stock_quantity` is `0` THEN the product SHALL remain visible in the picker (per the confirmed assumption) but any attempt to add it SHALL show the error.
3. WHEN the existing generic "quantidade inteira maior que zero" check already in `ProductItemForm.jsx` runs THEN the new upper-bound check SHALL be additive to it, not a replacement — both conditions enforced together.

**Independent Test**: Try adding more units than a product's stock shows, confirm it's rejected with a clear message; add exactly the stocked amount, confirm it succeeds.

---

#### UXP-17: Fix Product "unidade de medida" datalist type mismatch

**User Story**: As a developer/user relying on the unit-of-measure autocomplete, I want the suggestion list to actually render correctly.

**Why P3**: Pure bugfix uncovered during research, not a new feature; low risk, small diff.

**Acceptance Criteria**:

1. WHEN `unitOfMeasureOptions` (currently an array of `{id, name}` objects) is passed into `FormField`'s `datalist` prop (which expects plain strings per `FormField.jsx`) THEN the values SHALL be normalized to plain strings before being passed, so suggestions render correctly in the datalist dropdown.

**Independent Test**: Open Product create, click into "Unidade de Medida", confirm the suggestion dropdown shows readable unit names (not `[object Object]` or blank entries).

---

## Edge Cases

- WHEN a `LiveSelect`'s inline "Cadastrar novo" modal is cancelled THEN the field SHALL keep its previous value, unchanged (existing `LiveSelect` behavior, not new — called out because every new wrapper in this feature must preserve it).
- WHEN a ProductSubcategory's parent category is changed on the Product form (UXP-03) after a subcategory was already chosen THEN the subcategory value SHALL clear if it doesn't belong to the new category (see UXP-03 AC3) — it SHALL NOT silently keep a mismatched subcategory selected.
- WHEN a PurchaseOrder's fornecedor is changed after items already exist (UXP-05/UXP-13) THEN existing line items SHALL be left untouched; only the item picker's filter for _new_ adds changes (see Out of Scope / Assumptions).
- WHEN a Budget/Order line item being edited already holds a quantity at the current stock ceiling THEN re-saving the same quantity SHALL succeed (the bound in UXP-16 is `> stock_quantity`, not `>=`, so the exact stock amount is always a valid value).
- WHEN the Purchase Order search (UXP-14) receives a value that's both all-digits and happens to also be a substring of some supplier's name (unlikely but possible, e.g. a supplier literally named "77 Peças") THEN the numeric-id branch SHALL take precedence (the rule is "if all digits → id match", not "try both").

---

## Requirement Traceability

| Requirement ID | Story                                                 | Phase | Status  |
| -------------- | ----------------------------------------------------- | ----- | ------- |
| UXP-01         | P1: VehicleModel Marca LiveSelect                     | Tasks | Pending |
| UXP-02         | P1: ProductSubcategory Categoria LiveSelect           | Tasks | Pending |
| UXP-03         | P1: Product Categoria/Subcategoria LiveSelect         | Tasks | Pending |
| UXP-04         | P1: WorkService Fornecedor LiveSelect                 | Tasks | Pending |
| UXP-05         | P1: PurchaseOrder Fornecedor LiveSelect               | Tasks | Pending |
| UXP-06         | P2: Vehicle ver cliente button                        | Tasks | Pending |
| UXP-07         | P2: Product ver fornecedor button                     | Tasks | Pending |
| UXP-08         | P2: Product list Categoria/Sub-categoria              | Tasks | Pending |
| UXP-09         | P2: Product list Nome (Marca)                         | Tasks | Pending |
| UXP-10         | P2: Budget/Order picker shows brand                   | Tasks | Pending |
| UXP-11         | P2: Budget/Order line unit price + total              | Tasks | Pending |
| UXP-12         | P2: Financial subcategory CRUD module                 | Tasks | Pending |
| UXP-13         | P3: PurchaseOrder supplier-filtered items + auto cost | Tasks | Pending |
| UXP-14         | P3: PurchaseOrder search by fornecedor/id             | Tasks | Pending |
| UXP-15         | P3: PurchaseOrder remove-item title                   | Tasks | Pending |
| UXP-16         | P3: Budget/Order stock-based qty bounds               | Tasks | Pending |
| UXP-17         | P3: Unidade de medida datalist bugfix                 | Tasks | Pending |

**Coverage:** 17 total, 17 mapped, 0 unmapped

**Design phase note:** Skipped per auto-sizing — every story reuses an existing, proven mechanism (`LiveSelect` + its wrapper template, the existing Eye-button pattern, the already-complete financial-subcategory backend endpoints, the existing inline-error pattern for validation). No new architecture or pattern is being introduced; Tasks will reference the exact files/components to copy from per story.

**Cross-repo note:** 16 of 17 stories are `factory_project_frontend`-only. UXP-14 alone also touches `factory_project` backend (`apps/purchases/views/purchase_order_view.py`, `apps/purchases/repositories/purchase_order_repository.py`) for the new `search` param.

---

## Success Criteria

- [ ] All 17 stories' acceptance criteria hold under manual verification (and automated tests added during Tasks/Execute).
- [ ] `npm run lint`, `npm run format:check`, and the Vitest suite all pass in `factory_project_frontend`.
- [ ] `pytest apps -q`, `flake8`, and `isort --check-only` all pass in `factory_project` for the UXP-14 backend change.
- [ ] No regression in any screen already using `LiveSelect`, the Eye-button pattern, or `ProductItemForm` (existing budget/order/vehicle/service tests continue to pass).
