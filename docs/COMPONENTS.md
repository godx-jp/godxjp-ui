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
  topbar={<Topbar product={product} />}
>
  <PageContainer title="Dashboard">...</PageContainer>
</AppShell>
```

Do not rebuild sidebar or topbar chrome inside product previews or apps. Compose the shell slots, then put product content in the `children` slot.

### PageContainer

**Prop type:** `PageContainerProp`  
**Import:** `@godxjp/ui/layout`

| Prop         | Vocabulary        | Required          |
| ------------ | ----------------- | ----------------- |
| `title`      | `TitleProp`       | ✅                |
| `subtitle`   | `SubtitleProp`    |                   |
| `extra`      | `ExtraProp`       |                   |
| `footer`     | `FooterProp`      |                   |
| `breadcrumb` | `BreadcrumbProp`  |                   |
| `density`    | `PageDensityProp` | default `default` |
| `children`   | `ChildrenProp`    |                   |

Every admin page **must** use PageContainer.

## Mobile-first

All UI is **mobile-first**: base layout targets ~320–428px viewport; `sm` (640px+) adds horizontal layouts. See `packages/ui/src/tokens/base.css` and `.ui-page-*` in `src/styles/index.css`. Preview defaults to mobile viewport.

### Stack / Inline

| Component | Prop         | Key props             |
| --------- | ------------ | --------------------- |
| `Stack`   | `StackProp`  | `gap: GapProp`        |
| `Inline`  | `InlineProp` | `gap: GapProp` subset |

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
| `SearchInput` | `SearchInputProp` | `onDebouncedChange: OnSearchChangeProp`            |
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

| Component   | Prop type           | Key props                                                         |
| ----------- | ------------------- | ----------------------------------------------------------------- |
| `Alert`     | `AlertProp`         | `variant`, compound slots, `onDismiss`, `Alert.QueryError` preset |
| `Dialog`    | `DialogConfirmProp` | `mode: form \| confirm`, `Dialog.Confirm` preset                  |
| `Sheet`     | Radix primitives    | slide-in panel (mobile filters, detail flyouts)                   |
| `Skeleton*` | `SkeletonRowsProp`  | loading placeholders                                              |

---

## Query

Async data lifecycle helpers (TanStack Query). **Not visual components.**

| Component            | Prop type                | Key props                                                                               |
| -------------------- | ------------------------ | --------------------------------------------------------------------------------------- |
| `DataState`          | `DataStateProp<T>`       | `query`, `skeleton`, `empty`, `isEmpty`, `showRetry`, `onRetry`, render-prop `children` |
| `MutationFeedback`   | `MutationFeedbackProp`   | `mutation`, `onRetry`, `pending` — inline `useMutation` error                           |
| `InfiniteQueryState` | `InfiniteQueryStateProp` | `flatten`, `loadMore`, `showLoadMore` — infinite scroll / timeline                      |
| `PrefetchLink`       | `PrefetchLinkProp`       | `queryKey`, `queryFn`, `prefetchOn`, `staleTime`                                        |

Import: `@godxjp/ui/query` (re-exported from `@godxjp/ui/admin`).

**`DataState`** — one `useQuery` = one content block (list, detail). Not whole page when filters stay visible.

**`InfiniteQueryState`** — `useInfiniteQuery` + Load more. CRM timeline, activity feeds. Offset pagination lists → `DataState` + `DataTable.Pagination`.

**`PrefetchLink`** — hover/focus prefetch before navigate to detail.

**`MutationFeedback`** — blocking mutation errors (simulator). Small saves → toast.

**`QueryRefetchButton`** — `PageContainer extra` refresh pattern (MediaListPage).

**`Alert.QueryError`** — manual error when not using DataState (audit results region).

Auto retry: `useQuery({ retry, retryDelay })`. Manual retry: default `refetch()`.

---

## Navigation

| Component      | Prop type         | Key props                          |
| -------------- | ----------------- | ---------------------------------- |
| `FilterBar`    | `FilterBarProp`   | `onClear: OnClearFiltersProp`      |
| `FilterGroup`  | `FilterGroupProp` | `label: LabelProp`                 |
| `Tabs`         | Radix primitives  | —                                  |
| `DropdownMenu` | Radix primitives  | —                                  |
| `PageHeader`   | `PageHeaderProp`  | **deprecated** — use PageContainer |

---

## Adding a new component

1. Check `PROPS-REGISTRY.md` — concept may already exist
2. Add vocabulary types if needed → `src/props/vocabulary/`
3. Add `{Name}Prop` → `src/props/components/{group}.prop.ts`
4. Register in `src/props/registry.ts`
5. Implement component importing prop type (no inline interfaces)
6. Add preview example -> `examples/{group}/{Name}.preview.tsx`
7. Update this doc
