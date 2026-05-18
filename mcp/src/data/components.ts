/**
 * Component catalog — hand-curated from `src/components/**` at the repo
 * root. The MCP server bundles this list so consumers don't need to
 * ship the framework source. To regenerate after a primitive is added /
 * removed, run the catalog audit script:
 *
 *   pnpm --filter @godxjp/ui-mcp regen:components
 *
 * Each entry carries:
 *   - `name`        — canonical primitive name (matches the React export)
 *   - `group`       — one of the six canonical groups + `composites` + `shell`
 *   - `tagline`     — one-line elevator pitch
 *   - `props`       — most-used props with type + description
 *   - `example`     — copy-paste-ready JSX snippet
 *   - `docPath`     — relative path under `docs/reference/`
 *   - `storyPath`   — relative path under `src/stories/`
 *   - `rules`       — cardinal rules the consumer should know
 *                    when reaching for this primitive
 */

export type ComponentGroup =
  | "general"
  | "layout"
  | "data-display"
  | "data-entry"
  | "feedback"
  | "navigation"
  | "composites"
  | "shell"
  | "providers";

export interface ComponentProp {
  name: string;
  type: string;
  required?: boolean;
  description: string;
  defaultValue?: string;
}

export interface ComponentEntry {
  name: string;
  group: ComponentGroup;
  tagline: string;
  props: ComponentProp[];
  example: string;
  docPath?: string;
  storyPath: string;
  rules: number[];
}

export const COMPONENTS: ComponentEntry[] = [
  // ─── general ────────────────────────────────────────────────────
  {
    name: "Button",
    group: "general",
    tagline:
      "Canonical action primitive. 6 variants × 4 sizes. Loading state, icon slots, Slot-based asChild for routing wrap.",
    props: [
      { name: "variant", type: '"primary" | "secondary" | "outline" | "ghost" | "destructive" | "link"', description: "Visual treatment.", defaultValue: '"primary"' },
      { name: "size", type: "SizeWithXSProp", description: '"x-small" | "small" | "default" | "large".', defaultValue: '"default"' },
      { name: "block", type: "boolean", description: "Stretch to fill parent width (mobile submit pattern)." },
      { name: "loading", type: "boolean", description: "Show spinner + disable interaction." },
      { name: "startContent", type: "ReactNode", description: "Left icon slot." },
      { name: "endContent", type: "ReactNode", description: "Right icon slot." },
      { name: "asChild", type: "boolean", description: "Radix Slot — wrap a Link / RouterLink without nesting." },
    ],
    example: `<Button variant="primary" size="default" startContent={<Save size={14} />}>
  保存
</Button>

<Button variant="ghost" asChild>
  <Link to="/settings">設定</Link>
</Button>`,
    docPath: "data-entry/Button.md",
    storyPath: "general/Button.stories.tsx",
    rules: [14, 23],
  },
  {
    name: "Typography",
    group: "general",
    tagline:
      "Headings / paragraph / text / link primitives. `Typography.Title size={1..5}`, `Typography.Text`, `Typography.Paragraph`, `Typography.Link`.",
    props: [
      { name: "size (Title)", type: "1 | 2 | 3 | 4 | 5", description: "Heading level (h1–h5)." },
      { name: "color", type: "TypographyColor", description: "default | secondary | success | warning | attention | info | destructive." },
      { name: "strong", type: "boolean", description: "Bold weight." },
      { name: "truncate", type: '"ellipsis" | { lines: number }', description: "Single-line or multi-line truncation." },
    ],
    example: `<Typography.Title size={2}>ワークスペース設定</Typography.Title>
<Typography.Paragraph>変更は即座に反映されます。</Typography.Paragraph>
<Typography.Text color="secondary">更新日: 2026-05-19</Typography.Text>`,
    storyPath: "general/Typography.stories.tsx",
    rules: [23],
  },

  // ─── layout ─────────────────────────────────────────────────────
  {
    name: "Flex",
    group: "layout",
    tagline: "Flexbox container with prop-driven config (Ant-style).",
    props: [
      { name: "vertical", type: "boolean", description: "Column instead of row." },
      { name: "gap", type: "FlexGap", description: "number | small | default | large." },
      { name: "justify", type: "FlexJustify", description: "start | end | center | space-between | space-around | space-evenly." },
      { name: "align", type: "AlignProp", description: "start | end | center | stretch | baseline." },
      { name: "wrap", type: "boolean", description: "Allow wrapping." },
    ],
    example: `<Flex vertical gap="default" align="stretch">
  <Input placeholder="名前" />
  <Input placeholder="メール" />
  <Button type="submit">送信</Button>
</Flex>`,
    storyPath: "layout/Flex.stories.tsx",
    rules: [23, 24],
  },
  {
    name: "Grid",
    group: "layout",
    tagline: "CSS Grid container. `cols` number or template string. Mobile-first gap.",
    props: [
      { name: "cols", type: "number | string", description: 'Equal columns OR full grid-template-columns string.' },
      { name: "gap", type: "GridGap", description: "number | small | default | large." },
    ],
    example: `<Grid cols={3} gap="default">
  <Card title="売上">¥120,000</Card>
  <Card title="利益">¥45,000</Card>
  <Card title="顧客">+12</Card>
</Grid>`,
    storyPath: "layout/Grid.stories.tsx",
    rules: [23, 24],
  },
  {
    name: "Row / Col",
    group: "layout",
    tagline: "24-column responsive grid (Ant-style). `gutter` rebound per breakpoint.",
    props: [
      { name: "gutter", type: "number | [h,v] | { xs, sm, md, lg, xl, xxl }", description: "Pixel gap, optionally per breakpoint." },
      { name: "xs / sm / md / lg / xl", type: "number", description: "Column span at that breakpoint (1-24)." },
    ],
    example: `<Row gutter={{ xs: 8, md: 16 }}>
  <Col xs={24} md={8}><Card>One</Card></Col>
  <Col xs={24} md={8}><Card>Two</Card></Col>
  <Col xs={24} md={8}><Card>Three</Card></Col>
</Row>`,
    storyPath: "layout/Grid.stories.tsx",
    rules: [23, 24],
  },

  // ─── data-display ───────────────────────────────────────────────
  {
    name: "Card",
    group: "data-display",
    tagline:
      "Surface container. Title + subtitle + body + footer slots, accent / band decorations, padding scale, hoverable.",
    props: [
      { name: "title", type: "ReactNode", description: "Header title." },
      { name: "subtitle", type: "ReactNode", description: "Sub-text under title." },
      { name: "kicker", type: "ReactNode", description: "Small uppercase kicker above title." },
      { name: "extra", type: "ReactNode", description: "Right-aligned action slot in header." },
      { name: "padding", type: "PaddingProp", description: "tight | default | cozy | none." },
      { name: "tone", type: "CardTone", description: "default | muted | outline-only." },
      { name: "accent", type: "CardAccent", description: "Edge accent + 'featured' ring." },
      { name: "band", type: "CardBand", description: "Top-edge color strip." },
      { name: "actions", type: "ReactNode", description: "Right-aligned footer action bar." },
      { name: "hoverable", type: "boolean", description: "Hover lift + border tint." },
    ],
    example: `<Card
  title="プロフィール"
  subtitle="他のメンバーに公開される情報です。"
  actions={
    <>
      <Button variant="ghost">キャンセル</Button>
      <Button variant="primary">保存</Button>
    </>
  }
>
  {/* form fields */}
</Card>`,
    docPath: "data-display/Card.md",
    storyPath: "data-display/Card.stories.tsx",
    rules: [22, 23],
  },
  {
    name: "Table",
    group: "data-display",
    tagline:
      "Slim primitive. Columns × rows + interaction features per cell/row (sort, resize, expand, edit, tree, group, sticky). NO chrome — use DataTable composite for toolbar/views/batch/pagination.",
    props: [
      { name: "columns", type: "TableColumn<T>[]", required: true, description: "TanStack ColumnDef array. `meta.sticky` for responsive sticky columns." },
      { name: "data", type: "T[]", required: true, description: "Row data." },
      { name: "rowKey", type: "string | (row) => string", required: true, description: "Stable row identity." },
      { name: "density", type: "DensityProp", description: "compact | default | comfortable." },
      { name: "bordered", type: "boolean", description: "Inner border lines." },
      { name: "selection", type: "TableSelectionConfig", description: "Checkbox column + selected row keys." },
      { name: "sortable", type: "TableSortState | boolean", description: "Controlled multi-sort." },
      { name: "expandable / tree / groupBy / editing / sticky", type: "configs", description: "Optional features." },
    ],
    example: `<Table
  columns={[
    { accessorKey: "name", header: "氏名", meta: { sticky: { side: "left", from: "md" } } },
    { accessorKey: "role", header: "役職" },
    { accessorKey: "status", header: "状態",
      cell: ({ row }) => row.original.status === "active"
        ? <Badge variant="success" dot>稼働中</Badge>
        : <Badge variant="neutral" dot>休職</Badge>
    },
  ]}
  data={employees}
  rowKey="id"
/>`,
    docPath: "data-display/Table.md",
    storyPath: "data-display/Table.stories.tsx",
    rules: [22, 23, 34],
  },
  {
    name: "Badge",
    group: "data-display",
    tagline: "Status pill (numeric or short word). Semantic color via `variant`, visual treatment via `appearance`.",
    props: [
      { name: "variant", type: '"primary" | "success" | "warning" | "info" | "destructive" | "attention" | "neutral" | "outline"', description: "Semantic color slot. Use `destructive` (NOT `error` — Tag migration v5.0)." },
      { name: "appearance", type: '"soft" | "solid" | "outline"', description: "Visual treatment.", defaultValue: '"soft"' },
      { name: "dot", type: "boolean", description: "Show colored dot before label.", defaultValue: "true" },
    ],
    example: `<Badge variant="success" dot>承認済</Badge>
<Badge variant="destructive" appearance="solid">却下</Badge>
<Badge variant="neutral" dot={false}>下書き</Badge>`,
    docPath: "data-display/Badge.md",
    storyPath: "data-display/Badge.stories.tsx",
    rules: [23],
  },
  {
    name: "Tag",
    group: "data-display",
    tagline: "Label chip (closable, removable). Distinct from Badge — multiple in a row, often deletable.",
    props: [
      { name: "color", type: "TagPresetColor | string", description: "Preset hue OR any CSS color." },
      { name: "bordered", type: "boolean", description: "Show outline.", defaultValue: "true" },
      { name: "closable", type: "boolean", description: "Render × button." },
      { name: "onClose", type: "(e) => void", description: "Called when × clicked." },
      { name: "icon", type: "ReactNode", description: "Leading icon." },
    ],
    example: `<Tag color="primary" closable onClose={() => removeTag(id)}>
  React
</Tag>`,
    docPath: "data-display/Tag.md",
    storyPath: "data-display/Tag.stories.tsx",
    rules: [23],
  },
  {
    name: "Avatar",
    group: "data-display",
    tagline: "Profile picture with initials fallback. Circle / square. Size = token or pixel number.",
    props: [
      { name: "alt", type: "string", description: "Display name — first 2 initials are the fallback." },
      { name: "size", type: '"xs" | "sm" | "default" | "lg" | "xl" | number', description: "Token or pixel size." },
      { name: "shape", type: '"circle" | "square"', description: "Geometric form.", defaultValue: '"circle"' },
      { name: "src", type: "string", description: "Image URL. Falls back to initials on load error." },
    ],
    example: `<Avatar size="lg" alt="山田 太郎" />
<Avatar size={56} alt="Hanako" src="/avatar.jpg" />`,
    storyPath: "data-display/Avatar.stories.tsx",
    rules: [23],
  },
  {
    name: "Separator",
    group: "data-display",
    tagline: "Horizontal or vertical divider. Radix-backed for ARIA semantics.",
    props: [
      { name: "orientation", type: "OrientationProp", description: "horizontal | vertical." },
      { name: "decorative", type: "boolean", description: "If true, role=none (not announced)." },
    ],
    example: `<Separator />
<Separator orientation="vertical" />`,
    storyPath: "data-display/Separator.stories.tsx",
    rules: [3, 23],
  },

  // ─── data-entry ─────────────────────────────────────────────────
  {
    name: "Input",
    group: "data-entry",
    tagline: "Text input. `prefix` / `suffix` slots, `status` for validation, `addonBefore` / `addonAfter` for connected groups.",
    props: [
      { name: "value / onChange", type: "string / (e) => void", description: "Controlled value (or use `defaultValue`)." },
      { name: "size", type: "InputSize (= SizeProp)", description: "small | default | large." },
      { name: "status", type: "InputStatus (= StatusProp)", description: "default | success | warning | error. Use `error` for form validation." },
      { name: "prefix / suffix", type: "ReactNode", description: "Icon slot inside the input box." },
      { name: "addonBefore / addonAfter", type: "ReactNode", description: "Connected group (e.g. URL prefix, currency)." },
    ],
    example: `<Input
  placeholder="https://"
  prefix={<Globe size={14} />}
  addonBefore="https://"
  addonAfter=".com"
/>`,
    docPath: "data-entry/Input.md",
    storyPath: "data-entry/Input.stories.tsx",
    rules: [14, 23],
  },
  {
    name: "InputNumber",
    group: "data-entry",
    tagline: "Numeric input with stepper. `min` / `max` / `step`, `precision`, `formatter` / `parser` for currency.",
    props: [
      { name: "value / onValueChange", type: "number | null / (n) => void", description: "Radix-style controlled state." },
      { name: "min / max / step", type: "number", description: "Numeric bounds + increment." },
      { name: "precision", type: "number", description: "Decimal places." },
      { name: "formatter / parser", type: "(value) => string / string", description: "Custom display (currency, units)." },
    ],
    example: `<InputNumber
  defaultValue={1000}
  min={0} max={10000} step={100}
  formatter={(v) => \`¥\${v.toLocaleString()}\`}
  parser={(v) => Number(v.replace(/[^0-9]/g, ""))}
/>`,
    storyPath: "data-entry/InputNumber.stories.tsx",
    rules: [23],
  },
  {
    name: "Select",
    group: "data-entry",
    tagline: "Single-select dropdown (Radix). `options` array. `searchable` for cmdk filter.",
    props: [
      { name: "options", type: "Array<{ value, label, disabled? }> | OptionGroup[]", required: true, description: "Option list, optionally grouped." },
      { name: "value / onValueChange", type: "string / (v) => void", description: "Controlled selection." },
      { name: "size", type: "InputSize", description: "small | default | large." },
      { name: "searchable", type: "boolean", description: "cmdk-powered keyboard search." },
      { name: "loading", type: "boolean", description: "Show loading row (searchable mode)." },
    ],
    example: `<Select
  options={[
    { value: "ja", label: "日本語" },
    { value: "en-US", label: "English" },
  ]}
  value={locale}
  onValueChange={setLocale}
/>`,
    storyPath: "data-entry/Select.stories.tsx",
    rules: [3, 23],
  },
  {
    name: "Form",
    group: "data-entry",
    tagline:
      "react-hook-form + zod wrapper. `defaultValues` + `resolver` + `onSubmit` — children = inline `<FormField>` per row.",
    props: [
      { name: "form", type: "UseFormReturn<T>", description: "Pass `useForm()` return for external control." },
      { name: "defaultValues / resolver / mode", type: "configs", description: "Shorthand for internal useForm." },
      { name: "onSubmit", type: "(values: T) => void | Promise<void>", description: "Submit handler (handleSubmit-wrapped)." },
      { name: "layout", type: 'FormLayout', description: "vertical (default) | horizontal | inline. Mobile-first." },
      { name: "loading", type: "LoadingProp", description: "Cascade loading to every FormField — true=spinner, {kind:'skeleton'}=skeleton." },
    ],
    example: `<Form<RegistrationValues>
  resolver={zodResolver(registrationSchema)}
  defaultValues={{ name: "", email: "", age: 18, agree: true }}
  onSubmit={(values) => api.register(values)}
>
  <FormField name="name" label="氏名" required>
    <Input placeholder="山田 太郎" />
  </FormField>
  <FormField name="email" label="メールアドレス" required>
    <Input type="email" />
  </FormField>
  <Button type="submit" variant="primary">登録</Button>
</Form>`,
    storyPath: "data-entry/Form.stories.tsx",
    rules: [3, 23, 34],
  },
  {
    name: "FormField",
    group: "data-entry",
    tagline:
      "Form-wired Field. Reads value/onChange/error from <Form> via useController, clones child with the right adapter (Input/Checkbox/Switch/Select/Slider/Cascader/TreeSelect/Transfer/etc.).",
    props: [
      { name: "name", type: "FieldPath<T>", required: true, description: "Schema field path." },
      { name: "label / description / required / optional", type: "Field-style props", description: "Label + help + status badges." },
      { name: "loading", type: "LoadingProp", description: "Per-field override of Form-level loading." },
      { name: "children", type: "ReactElement", required: true, description: "Single data-entry primitive (Input/Select/Checkbox/...)." },
    ],
    example: `<FormField name="phone" label="電話番号" required description="ハイフン無しで入力">
  <Input placeholder="08012345678" />
</FormField>`,
    storyPath: "data-entry/Form.stories.tsx",
    rules: [23, 34],
  },
  {
    name: "Checkbox",
    group: "data-entry",
    tagline: "Boolean toggle (Radix). Label as children. Use `CheckboxGroup` for multi-select.",
    props: [
      { name: "checked / onCheckedChange", type: "boolean / (next) => void", description: "Radix-style." },
      { name: "children", type: "ReactNode", description: "Label text (clickable area extends to it)." },
    ],
    example: `<Checkbox checked={agree} onCheckedChange={setAgree}>
  利用規約に同意する
</Checkbox>`,
    storyPath: "data-entry/Checkbox.stories.tsx",
    rules: [3, 23],
  },
  {
    name: "Switch",
    group: "data-entry",
    tagline: "Boolean toggle, slider style (Radix). Use in settings / feature flags.",
    props: [
      { name: "checked / onCheckedChange", type: "boolean / (next) => void", description: "Radix-style." },
      { name: "disabled", type: "boolean", description: "Lock state." },
    ],
    example: `<Switch checked={notifEnabled} onCheckedChange={setNotifEnabled} />`,
    storyPath: "data-entry/Switch.stories.tsx",
    rules: [3, 23],
  },
  {
    name: "DatePicker / DateField / DateRangePicker / TimeField",
    group: "data-entry",
    tagline:
      "React Aria-backed date/time inputs. Locale-aware (via GodxConfigProvider), keyboard-complete, IME-friendly.",
    props: [
      { name: "value / onChange", type: "DateValue | TimeValue", description: "@internationalized/date values." },
      { name: "label / description", type: "ReactNode", description: "Inline label." },
      { name: "minValue / maxValue", type: "DateValue", description: "Bounds." },
    ],
    example: `<DateField label="生年月日" defaultValue={parseDate("2000-01-01")} />
<TimeField label="出勤時刻" defaultValue={new Time(9, 0)} />`,
    storyPath: "data-entry/DatePicker.stories.tsx",
    rules: [3, 14, 23],
  },

  // ─── feedback ───────────────────────────────────────────────────
  {
    name: "Alert",
    group: "feedback",
    tagline: "Inline notice banner. 5 semantic colors × outlined/banner variants.",
    props: [
      { name: "color", type: "FeedbackColorProp", description: "default | info | success | warning | destructive." },
      { name: "variant", type: '"outlined" | "banner"', description: "Card style or full-width banner." },
      { name: "title / description", type: "ReactNode", description: "Two-line stack." },
      { name: "actions", type: "ReactNode", description: "Right-aligned action slot." },
      { name: "closable / onClose", type: "boolean / fn", description: "× button." },
    ],
    example: `<Alert color="warning" title="3 件の打刻漏れがあります"
  description="本日中に確認してください。"
  actions={<Button size="small">確認する</Button>}
  closable onClose={dismiss}
/>`,
    storyPath: "feedback/Alert.stories.tsx",
    rules: [23],
  },
  {
    name: "Dialog / Modal",
    group: "feedback",
    tagline: "Radix Dialog wrapped with title/footer slots. `Modal` is convenience preset.",
    props: [
      { name: "open / onOpenChange", type: "boolean / (b) => void", description: "Radix-style." },
      { name: "title / description / footer", type: "ReactNode", description: "Header / body / footer slots." },
      { name: "size", type: "SizeProp", description: "Width preset." },
    ],
    example: `<Dialog open={open} onOpenChange={setOpen}
  title="プロジェクトを削除"
  footer={
    <>
      <Button variant="ghost" onClick={() => setOpen(false)}>キャンセル</Button>
      <Button variant="destructive" onClick={confirmDelete}>削除</Button>
    </>
  }
>
  この操作は取り消せません。
</Dialog>`,
    storyPath: "feedback/Dialog.stories.tsx",
    rules: [3, 23],
  },
  {
    name: "Sheet / Drawer",
    group: "feedback",
    tagline: "Side panel (Radix Dialog). 4 sides. Wider than Modal — for settings, filters, details.",
    props: [
      { name: "open / onOpenChange", type: "boolean / fn", description: "Radix-style." },
      { name: "side", type: "SideProp", description: "top | right | bottom | left." },
      { name: "title / description", type: "ReactNode", description: "Header." },
    ],
    example: `<Sheet open={open} onOpenChange={setOpen} side="right" title="フィルター">
  {/* filter form */}
</Sheet>`,
    storyPath: "feedback/Drawer.stories.tsx",
    rules: [3, 23],
  },
  {
    name: "Toaster / toast",
    group: "feedback",
    tagline: "Sonner-backed toast notifications. Mount Toaster once in app root, call `toast.success(...)` anywhere.",
    props: [
      { name: "position", type: '"top-right" | "top-center" | "bottom-right" | ...', description: "Stack anchor." },
    ],
    example: `// App root
<GodxConfigProvider><App /><Toaster position="top-right" /></GodxConfigProvider>

// Anywhere
toast.success("保存しました")
toast.error("通信エラー", { description: "もう一度お試しください" })`,
    storyPath: "providers/Toaster.stories.tsx",
    rules: [14, 23],
  },
  {
    name: "Skeleton",
    group: "feedback",
    tagline: "Loading placeholder block. Use during initial data fetch (NOT during save — that's a spinner).",
    props: [
      { name: "className", type: "string", description: "Set width/height via Tailwind (h-9, w-full, rounded-md)." },
    ],
    example: `<Skeleton className="h-9 w-full rounded-md" />
<Skeleton className="h-4 w-32 rounded-sm" />`,
    storyPath: "feedback/Skeleton.stories.tsx",
    rules: [23],
  },
  {
    name: "Spinner",
    group: "feedback",
    tagline: "Small inline circular loader. Use for active work (saving, revalidating).",
    props: [
      { name: "size", type: "IconSizeProp", description: "sm | md | lg." },
      { name: "tone", type: "SpinnerTone", description: "Semantic color." },
    ],
    example: `<Spinner size="sm" aria-label="読み込み中" />`,
    storyPath: "feedback/Spin.stories.tsx",
    rules: [23],
  },

  // ─── navigation ─────────────────────────────────────────────────
  {
    name: "Tabs",
    group: "navigation",
    tagline: "Radix Tabs. Line or pills variant, horizontal/vertical, lazy mount.",
    props: [
      { name: "items", type: "Array<{ value, label, content, disabled? }>", required: true, description: "Tab list." },
      { name: "value / onValueChange", type: "string / fn", description: "Controlled active tab." },
      { name: "variant", type: '"line" | "pills"', description: "Visual." },
      { name: "orientation", type: "OrientationProp", description: "horizontal | vertical." },
    ],
    example: `<Tabs items={[
  { value: "profile", label: "プロフィール", content: <ProfileForm /> },
  { value: "security", label: "セキュリティ", content: <SecurityForm /> },
]} />`,
    storyPath: "navigation/Tabs.stories.tsx",
    rules: [3, 23],
  },
  {
    name: "Menu / DropdownMenu",
    group: "navigation",
    tagline: "Sidebar menu (sections + items + nested) / floating context menu (Radix DropdownMenu).",
    props: [
      { name: "items", type: "MenuItem[]", description: "Sections + nested children." },
      { name: "activeId / onSelect", type: "string / fn", description: "Controlled selection." },
    ],
    example: `<Menu activeId={active} onSelect={setActive} items={[
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "settings", label: "Settings", icon: Settings, children: [
    { id: "team", label: "Team" },
    { id: "billing", label: "Billing" },
  ]},
]} />`,
    storyPath: "navigation/Menu.stories.tsx",
    rules: [3, 14, 23],
  },
  {
    name: "Pagination",
    group: "navigation",
    tagline:
      "Page navigator. 3 variants — default (numbered) / simple (prev/next) / embedded (within toolbar). Justify matches FlexJustify.",
    props: [
      { name: "current / total / pageSize", type: "number", description: "Pagination state." },
      { name: "onChange / onPageSizeChange", type: "fn", description: "Page or page size change." },
      { name: "variant", type: '"default" | "simple" | "embedded"', description: "Feature mode." },
      { name: "justify", type: "PaginationJustify", description: "start | center | end | space-between." },
      { name: "showSizeChanger / showTotal / showFirstLast", type: "boolean", description: "Adjective toggles." },
    ],
    example: `<Pagination current={page} pageSize={20} total={1234}
  onChange={(p) => setPage(p)} showSizeChanger />`,
    storyPath: "navigation/Pagination.stories.tsx",
    rules: [23],
  },

  // ─── composites ─────────────────────────────────────────────────
  {
    name: "DataTable",
    group: "composites",
    tagline:
      "Packaged Table. Pairs slim <Table> primitive with hook-based state slices (useTablePagination, useTableSelection, useTableViews, useTableState). Adds toolbar / view tabs / batch action band / filter chips / pagination / column manager Sheet / save-view Dialog.",
    props: [
      { name: "columns / data / rowKey", type: "(forwards to Table)", required: true, description: "" },
      { name: "toolbar", type: "TableToolbarConfig", description: "search / filter / columns toggle / primary action." },
      { name: "views", type: "TableViewsConfig", description: "Saved view tabs (active + dropdown)." },
      { name: "batchActions", type: "TableBatchActionsConfig<T>", description: "Action bar shown when rows selected." },
      { name: "pagination", type: "TablePaginationVariantConfig", description: "Numbered / load-more / cursor (kintai)." },
      { name: "tableKey", type: "string", description: "Persist state (sort, filters, columns) to localStorage." },
    ],
    example: `<DataTable
  tableKey="employees-v1"
  columns={EMPLOYEE_COLUMNS}
  data={employees}
  rowKey="id"
  toolbar={{ search: { value: q, onValueChange: setQ }, primaryAction: { label: "新規追加" } }}
  pagination={{ current: page, pageSize: 20, total: total, onChange: setPage }}
  batchActions={{
    selectedRowKeys: selected,
    onSelectedRowKeysChange: setSelected,
    actions: <Button variant="destructive">削除</Button>,
  }}
/>`,
    docPath: "composites/DataTable.md",
    storyPath: "composites/DataTable.stories.tsx",
    rules: [3, 22, 23, 31, 34],
  },

  // ─── shell ──────────────────────────────────────────────────────
  {
    name: "AppShell",
    group: "shell",
    tagline:
      "Root chrome layout. Grid: sidebar / topbar / main / footer. Slot-based — every service composes this.",
    props: [
      { name: "sidebar", type: "ReactNode", description: "<Sidebar> instance." },
      { name: "topbar", type: "ReactNode", description: "<Topbar> + switchers." },
      { name: "footer", type: "ReactNode", description: "Footer band." },
      { name: "sidebarCollapsed", type: "boolean", description: "Collapse sidebar (icon-only mode)." },
    ],
    example: `<AppShell
  sidebar={<Sidebar activeId={active} onSelect={setActive} sections={SECTIONS} />}
  topbar={<Topbar product={product} project={project} onSearchOpen={...} />}
>
  <PageContent title="Dashboard">…</PageContent>
</AppShell>`,
    docPath: "shell/AppShell.md",
    storyPath: "shell/AppShell.stories.tsx",
    rules: [19, 22, 23, 28],
  },
  {
    name: "PageContent",
    group: "shell",
    tagline: "Main column inside AppShell. Title / subtitle / breadcrumb / extra slot + padded body.",
    props: [
      { name: "title / subtitle / breadcrumb / extra", type: "ReactNode", description: "Header slots." },
      { name: "padding", type: "PaddingProp", description: "tight | default | cozy | none." },
    ],
    example: `<PageContent
  title="Dashboard"
  subtitle="Workspace activity"
  extra={<Button variant="primary">New issue</Button>}
>
  {/* page body */}
</PageContent>`,
    storyPath: "shell/PageContent.stories.tsx",
    rules: [22, 23],
  },
  {
    name: "Sidebar",
    group: "shell",
    tagline: "Left nav rail. Sections + nested items + optional product chip + footer slot. Collapsible to icon-only.",
    props: [
      { name: "sections", type: "SidebarSection[]", required: true, description: "Section groups + items." },
      { name: "activeId / onSelect", type: "string / fn", description: "Controlled active." },
      { name: "collapsed", type: "boolean", description: "Icon-only mode." },
      { name: "product", type: "ProductDescriptor", description: "Top product chip (with ProductSwitcher trigger)." },
      { name: "brand", type: "ReactNode", description: "Override product with custom brand block." },
    ],
    example: `<Sidebar
  activeId={active}
  onSelect={setActive}
  sections={[
    { label: "Workspace", items: [{ id: "dash", label: "Dashboard", icon: LayoutDashboard }] },
  ]}
  product={ACTIVE_PRODUCT}
/>`,
    storyPath: "shell/Sidebar.stories.tsx",
    rules: [22, 23, 27],
  },
  {
    name: "CommandPalette",
    group: "shell",
    tagline: "⌘K / Ctrl+K global command launcher (cmdk). Groups + items + keyboard shortcuts.",
    props: [
      { name: "commands", type: "CommandItem[]", required: true, description: "Groupable command list." },
      { name: "open / onOpenChange", type: "boolean / fn", description: "Controlled (or use built-in ⌘K hotkey)." },
    ],
    example: `<CommandPalette open={open} onOpenChange={setOpen} commands={[
  { id: "new-issue", label: "新規Issue作成", shortcut: ["⌘", "I"], onSelect: () => …},
]} />`,
    storyPath: "shell/CommandPalette.stories.tsx",
    rules: [14, 23],
  },

  // ─── providers ──────────────────────────────────────────────────
  {
    name: "GodxConfigProvider",
    group: "providers",
    tagline:
      "Root provider — locale, timezone, currency. Carries them to React Aria's I18nProvider so DatePicker / TimeField / formatters all pick up the locale.",
    props: [
      { name: "defaultLocale", type: "string", description: 'BCP 47 — "ja", "en-US", "vi", "fil".' },
      { name: "defaultTimezone", type: "string", description: 'IANA — "Asia/Tokyo", "America/New_York".' },
      { name: "defaultCurrency", type: "string", description: "ISO 4217 — JPY, USD." },
      { name: "storage", type: '"localStorage" | "cookie" | "both"', description: "Persist user override." },
    ],
    example: `<GodxConfigProvider defaultLocale="ja" defaultTimezone="Asia/Tokyo" defaultCurrency="JPY">
  <App />
  <Toaster position="top-right" />
</GodxConfigProvider>`,
    storyPath: "providers/GodxConfigProvider.stories.tsx",
    rules: [4, 14],
  },
];

export function findComponent(name: string): ComponentEntry | undefined {
  const normalized = name.trim().toLowerCase();
  return COMPONENTS.find((c) => c.name.toLowerCase() === normalized);
}

export function componentsByGroup(group: ComponentGroup): ComponentEntry[] {
  return COMPONENTS.filter((c) => c.group === group);
}
