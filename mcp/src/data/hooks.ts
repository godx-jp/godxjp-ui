/**
 * React hooks shipped by @godxjp/ui — `@godxjp/ui/hooks` sub-path.
 * Consumer agents read this to know which utilities exist before
 * reaching for raw `useEffect` / `useState` / external lib.
 */

export interface HookEntry {
  name: string;
  module: string;
  tagline: string;
  signature: string;
  /** When to use. */
  useCase: string;
  /** Copy-paste example. */
  example: string;
  /** Pitfalls / gotchas. */
  gotchas?: string[];
}

export const HOOKS: HookEntry[] = [
  {
    name: "useBreakpoint",
    module: "@godxjp/ui/hooks",
    tagline:
      "Reactive breakpoint detector. Returns the current breakpoint name (`xs | sm | md | lg | xl | xxl`) from the live viewport.",
    signature:
      'function useBreakpoint(): Breakpoint  // "xs" | "sm" | "md" | "lg" | "xl" | "xxl"',
    useCase:
      "Branch UI based on viewport (e.g. show Drawer on xs, Sheet on md+). Cardinal rule 24 mandates this over `window.innerWidth` — SSR-safe + handles orientation changes.",
    example: `import { useBreakpoint, matchBreakpoint } from "@godxjp/ui/hooks"

function ResponsiveActions() {
  const bp = useBreakpoint()
  if (matchBreakpoint(bp, "md")) {
    // md and up — show inline action bar
    return <Flex gap="default"><Button>...</Button></Flex>
  }
  // xs/sm — collapse into a dropdown
  return <DropdownMenu>...</DropdownMenu>
}`,
    gotchas: [
      "First render returns the initial breakpoint from `getComputedStyle(:root).--breakpoint-*`. No `window` access during SSR.",
      "Don't use for layout values like `grid-cols-N` — Tailwind `sm:` variants handle that at CSS time, no JS re-render.",
    ],
  },
  {
    name: "matchBreakpoint",
    module: "@godxjp/ui/hooks",
    tagline:
      'Pure compare — `matchBreakpoint(currentBp, target)` returns true if `current ≥ target` (mobile-first inclusion).',
    signature:
      'function matchBreakpoint(current: Breakpoint, target: Breakpoint): boolean',
    useCase: "Conditional branching paired with `useBreakpoint`.",
    example: `const bp = useBreakpoint()
const isWideEnoughForTwoColumns = matchBreakpoint(bp, "sm")`,
  },
  {
    name: "useFormatters",
    module: "@godxjp/ui/hooks",
    tagline:
      "Bundle of locale + timezone-aware formatters (`formatDate`, `formatTime`, `formatDateTime`, `formatRelative`, `formatNumber`, `formatCurrency`) bound to the current `<GodxConfigProvider>` config.",
    signature:
      'function useFormatters(): { formatDate, formatTime, formatDateTime, formatRelative, formatNumber, formatCurrency }',
    useCase:
      "ALL date / number formatting in app code. Don't reach for `Intl.DateTimeFormat` directly — that bypasses the user's `setLocale` / `setTimezone` overrides.",
    example: `import { useFormatters } from "@godxjp/ui/hooks"

function OrderRow({ order }) {
  const fmt = useFormatters()
  return (
    <Flex gap="default">
      <Typography.Text>{fmt.formatDate(order.createdAt)}</Typography.Text>
      <Typography.Text>{fmt.formatCurrency(order.total, { currency: "JPY" })}</Typography.Text>
      <Typography.Text color="secondary">{fmt.formatRelative(order.createdAt)}</Typography.Text>
    </Flex>
  )
}`,
    gotchas: [
      "Re-renders when the user changes locale / timezone via `useGodxConfig` setters — your component picks up the new values automatically.",
      "Requires <GodxConfigProvider> in the tree — throws if missing.",
    ],
  },
  {
    name: "useGodxConfig",
    module: "@godxjp/ui/preferences",
    tagline:
      "Read + mutate the app-wide locale / timezone / currency. Returns `{ locale, timezone, currency, setLocale, setTimezone, setCurrency, headers, reset }`.",
    signature:
      'function useGodxConfig(): { locale, timezone, currency, setLocale, setTimezone, setCurrency, setGodxConfig, reset, headers }',
    useCase:
      "User preferences UI (language picker, timezone selector). `headers()` returns an `Accept-Language` + `X-Timezone` header object for wiring into an axios / fetch client.",
    example: `import { useGodxConfig } from "@godxjp/ui/preferences"

function LanguagePicker() {
  const { locale, setLocale } = useGodxConfig()
  return (
    <Select value={locale} onValueChange={setLocale} options={[
      { value: "ja",    label: "日本語" },
      { value: "en-US", label: "English (US)" },
      { value: "vi",    label: "Tiếng Việt" },
    ]} />
  )
}`,
    gotchas: [
      "Set `storage=\"localStorage\"` (or `\"cookie\"` or `\"both\"`) on <GodxConfigProvider> so the user's override persists.",
      "`headers()` reads through a module-level holder so axios interceptors stay fresh as the user changes locale.",
    ],
  },
  {
    name: "useTweaks",
    module: "@godxjp/ui/hooks",
    tagline:
      "Read + mutate the Tweaks state (`theme`, `accent`, `density`, `fontSize`). Drives the 4 theme axes.",
    signature:
      'function useTweaks(): { theme, accent, density, fontSize, setTheme, setAccent, setDensity, setFontSize }',
    useCase:
      "Tweaks panel (user-facing preferences) — change the axis values, the framework writes them to `<html data-*>` automatically.",
    example: `import { useTweaks } from "@godxjp/ui/hooks"

function ThemePicker() {
  const { theme, setTheme } = useTweaks()
  return (
    <SegmentedControl
      value={theme}
      onValueChange={setTheme}
      items={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]}
    />
  )
}`,
  },
  {
    name: "useTablePagination",
    module: "@godxjp/ui/components/composites",
    tagline:
      "Pagination state slice for DataTable. Returns `{ current, pageSize, total, onChange, onPageSizeChange, ... }`. Persists to localStorage if `tableKey` set.",
    signature:
      "function useTablePagination(options): TablePaginationVariantConfig",
    useCase:
      "When you don't want DataTable to manage its own pagination state (e.g. URL-driven page params, server-side filtering).",
    example: `const pagination = useTablePagination({
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  total: data?.total ?? 0,
  onChange: (page) => router.push({ ...query, page }),
})

<DataTable columns={cols} data={data?.rows} pagination={pagination} />`,
  },
  {
    name: "useTableSelection",
    module: "@godxjp/ui/components/composites",
    tagline:
      "Row selection state slice. `{ selectedRowKeys, onSelectedRowKeysChange, getCheckboxDisabled }`.",
    signature: "function useTableSelection<T>(options): TableSelectionConfig<T>",
    useCase: "Multi-row checkbox column with controlled state — for batch actions.",
    example: `const selection = useTableSelection({
  getRowKey: (row) => row.id,
  getCheckboxDisabled: (row) => row.original.locked,
})

<DataTable columns={cols} data={rows} selection={selection}
  batchActions={{
    selectedRowKeys: selection.selectedRowKeys,
    onSelectedRowKeysChange: selection.onSelectedRowKeysChange,
    actions: <Button variant="destructive">削除</Button>,
  }}
/>`,
  },
  {
    name: "useTableViews",
    module: "@godxjp/ui/components/composites",
    tagline:
      "Saved-view state slice — the saved-filter / saved-sort tabs above the table.",
    signature: "function useTableViews(options): TableViewsConfig",
    useCase:
      "When users want to save 'Active orders' / 'Pending refunds' / etc. as one-click view tabs. Persisted per `tableKey`.",
    example: `const views = useTableViews({
  defaultItems: [
    { key: "all", label: "All" },
    { key: "active", label: "Active", filters: [{ key: "status", value: "active" }] },
  ],
  saveable: true,
})

<DataTable columns={cols} data={rows} views={views} />`,
  },
  {
    name: "useTableState",
    module: "@godxjp/ui/components/composites",
    tagline:
      "Bundle hook — `useTablePagination` + `useTableSelection` + `useTableViews` + sort/filter/column-visibility in one call. Persists everything to localStorage.",
    signature:
      "function useTableState<T>(options): { pagination, selection, views, sort, filters, columnVisibility }",
    useCase:
      "DataTable with full state persistence — sort + filter + columns + pagination + saved views all in one bundle, keyed by `tableKey`.",
    example: `const state = useTableState<Order>({
  tableKey: "orders-v1",
  defaultPageSize: 20,
  defaultSort: { key: "createdAt", direction: "desc" },
})

<DataTable<Order> tableKey="orders-v1" columns={cols} data={data} {...state} />`,
  },
  {
    name: "useRowGutter",
    module: "@godxjp/ui",
    tagline:
      "Read the active `<Row>` gutter for the current breakpoint. Pass-through helper for custom layouts inside a Row.",
    signature: "function useRowGutter(): [number, number]",
    useCase: "Rare — when authoring a custom child of `<Row>` that needs to know the gutter for math.",
    example: `const [colGap, rowGap] = useRowGutter()`,
  },
];
