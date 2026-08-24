# Component Catalog

All components consume prop types from `src/props/components/`. Preview: `pnpm preview`.

---

## Layout

### AppShell / Sidebar / Topbar

**Prop types:** `AppShellProp`, `SidebarProp`, `TopbarProp`  
**Import:** `@godxjp/ui/layout`

Slot-based app chrome for admin products:

```tsx
<AppShell
  sidebar={<Sidebar sections={sections} activeId="dashboard" />}
  topbar={<Topbar start={<Logo mark="godx" label={product.name} />} />}
>
  <PageContainer title="Dashboard">...</PageContainer>
</AppShell>
```

Do not rebuild sidebar or topbar chrome inside product previews or apps. Compose the shell slots, then put product content in the `children` slot.

### PageContainer

**Prop type:** `PageContainerProp`  
**Import:** `@godxjp/ui/layout`

| Prop            | Vocabulary        | Required          |
| --------------- | ----------------- | ----------------- |
| `title`         | `TitleProp`       | ✅                |
| `subtitle`      | `SubtitleProp`    |                   |
| `extra`         | `ExtraProp`       |                   |
| `footer`        | `FooterProp`      |                   |
| `breadcrumb`    | `BreadcrumbProp`  |                   |
| `headerLoading` | local (`boolean`) | default `false`   |
| `density`       | `PageDensityProp` | default `default` |
| `children`      | `ChildrenProp`    |                   |

Every admin page **must** use PageContainer.

## Mobile-first

All UI is **mobile-first**: base layout targets ~320–428px viewport; `sm` (640px+) adds horizontal layouts. See `packages/ui/src/tokens/base.css` and `.ui-page-*` in `src/styles/index.css`. Preview defaults to mobile viewport.

### Flex

`Flex` is the one layout primitive (the former `Stack`/`Inline` are removed). Default `direction="row"`; use `direction="col"` for vertical rhythm.

| Component | Prop       | Key props                                                               |
| --------- | ---------- | ----------------------------------------------------------------------- |
| `Flex`    | `FlexProp` | `direction: "row" \| "col"`, `gap: GapProp`, `align`, `justify`, `wrap` |

---

## Foundation

### Button

**Prop type:** `ButtonProp`  
**Import:** `@godxjp/ui/general`

| Prop       | Vocabulary          |
| ---------- | ------------------- |
| `variant`  | `ButtonVariantProp` |
| `size`     | `ButtonSizeProp`    |
| `asChild`  | `AsChildProp`       |
| `disabled` | `DisabledProp`      |
| `onClick`  | `OnClickProp`       |

---

## Data Entry

| Component     | Prop type         | Key props                                          |
| ------------- | ----------------- | -------------------------------------------------- |
| `Input`       | `InputProp`       | extends native input                               |
| `Textarea`    | `TextareaProp`    | extends native textarea                            |
| `FormField`   | `FormFieldProp`   | `id`, `label`, `required`, `helper`, `error`       |
| `SearchInput` | `SearchInputProp` | `onSearchChange: OnSearchChangeProp`               |
| `Checkbox`    | `CheckboxProp`    | Radix checkbox; `Checkbox.Group` với `options`     |
| `Radio`       | `RadioGroupProp`  | `Radio.Group` single-select; `Radio.Root` compound |

---

## Data Display

| Component      | Prop type          | Key props                                |
| -------------- | ------------------ | ---------------------------------------- |
| `EmptyState`   | `EmptyStateProp`   | `icon`, `title`, `description`, `action` |
| `DataTable`    | `DataTableProp<T>` | `columns`, `density: TableDensityProp`   |
| `Descriptions` | `DescriptionsProp` | `items[]`                                |
| `Badge`        | `BadgeProp`        | `status`, `tone: ToneProp`               |
| `Badge`        | `BadgeProp`        | shadcn badge variants                    |
| `Popover`      | Radix primitives   | floating content panel                   |
| `ScrollArea`   | Radix primitives   | scrollable regions                       |
| `Collapsible`  | Radix primitives   | expand/collapse sections                 |

---

## Feedback

| Component   | Prop type           | Key props                                                                    |
| ----------- | ------------------- | ---------------------------------------------------------------------------- |
| `Alert`     | `AlertProp`         | `tone` (colour), `variant` (measure), slots, `onDismiss`, `Alert.QueryError` |
| `Banner`    | `BannerProp`        | page-level `Alert` (`variant="banner"`); same tones/slots/dismiss            |
| `Dialog`    | `DialogConfirmProp` | `mode: form \| confirm`, `Dialog.Confirm` preset                             |
| `Sheet`     | Radix primitives    | slide-in panel (mobile filters, detail flyouts)                              |
| `Skeleton*` | `SkeletonRowsProp`  | loading placeholders                                                         |

---

## Query

Async data lifecycle helpers (TanStack Query). **Not visual components.**

| Component               | Prop type                   | Key props                                                                               |
| ----------------------- | --------------------------- | --------------------------------------------------------------------------------------- |
| `DataState`             | `DataStateProp<T>`          | `query`, `skeleton`, `empty`, `isEmpty`, `showRetry`, `onRetry`, render-prop `children` |
| `AlertMutationFeedback` | `AlertMutationFeedbackProp` | `mutation`, `onRetry`, `pending` — inline `useMutation` error                           |
| `InfiniteQueryState`    | `InfiniteQueryStateProp`    | `flatten`, `loadMore`, `showLoadMore` — infinite scroll / timeline                      |
| `PrefetchLink`          | `PrefetchLinkProp`          | `queryKey`, `queryFn`, `prefetchOn`, `staleTime`                                        |

Import: `@godxjp/ui/query` (re-exported from `@godxjp/ui/admin`).

**`DataState`** — one `useQuery` = one content block (list, detail). Not whole page when filters stay visible.

**`InfiniteQueryState`** — `useInfiniteQuery` + Load more. CRM timeline, activity feeds. Offset pagination lists → `DataState` + `DataTable.Pagination`.

**`PrefetchLink`** — hover/focus prefetch before navigate to detail.

**`AlertMutationFeedback`** — blocking mutation errors (simulator). Small saves → toast.

**`ButtonRefetch`** — `PageContainer extra` refresh pattern (MediaListPage).

**`Alert.QueryError`** — manual error when not using DataState (audit results region).

Auto retry: `useQuery({ retry, retryDelay })`. Manual retry: default `refetch()`.

---

## Navigation

| Component        | Prop type          | Key props                                                                                                                      |
| ---------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `FilterBar`      | `ToolbarProp`      | typed model: `search`, `filters`, `chips`, `onChipRemove`, `resultCount`, `actions`, `loading`, `disabled`, `error`, `onClear` |
| `FilterBarGroup` | `ToolbarGroupProp` | `label: LabelProp`, `controlId: IdProp`                                                                                        |
| `Toolbar`        | `ToolbarProp`      | back-compat alias of `FilterBar`                                                                                               |
| `ToolbarGroup`   | `ToolbarGroupProp` | back-compat alias of `FilterBarGroup`                                                                                          |
| `Tabs`           | Radix primitives   | —                                                                                                                              |
| `DropdownMenu`   | Radix primitives   | —                                                                                                                              |

---

## Adding a new component

1. Check `PROPS-REGISTRY.md` — concept may already exist
2. Add vocabulary types if needed → `src/props/vocabulary/`
3. Add `{Name}Prop` → `src/props/components/{group}.prop.ts`
4. Register in `src/props/registry.ts`
5. Implement component importing prop type (no inline interfaces)
6. Add isolated, composition and journey frames following
   [FRAME-COVERAGE-STANDARD.md](./FRAME-COVERAGE-STANDARD.md)
7. Register every applicable prop/state/responsive/a11y dimension in the frame coverage ledger;
   missing coverage is `UNTESTED`, never pass
8. Run `pnpm check:frame-axe` (real-Chromium axe over every `/frame/**`) — a new frame must ship
   with **zero** violations; see [FRAME-A11Y-CI.md](./FRAME-A11Y-CI.md) for how to run it and the
   categories of violations already root-caused for other components
9. Update this doc
