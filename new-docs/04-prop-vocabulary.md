# 04 — Shared prop vocabulary

**Status:** Binding. The locked prop-name + prop-shape vocabulary
that every `@godxjp/ui` primitive consumes. Read before adding a
new prop to a primitive, before authoring a new primitive, and
before refactoring an existing primitive's API.

Per cardinal rule 23 every prop carries ONE concept; every prop
name maps to a row in this catalogue. Drift between primitives
(`scale` in one, `size` in another) is the most expensive
long-term debt this framework can ship — once the vocabulary
fractures it's almost impossible to repair without a major
breaking change. This doc is the source-of-truth that keeps the
vocabulary coherent.

This file mirrors **CLAUDE.md §23.B** verbatim. When the cardinal-
rules table grows, this doc grows with it.

## §A — The locked vocabulary

| Prop | Type | Concept | Used by |
|---|---|---|---|
| [`size`](#b--size) | `"x-small" \| "small" \| "default" \| "large" \| "x-large"` | Dimensional scale of the primitive itself | Button, Input, InputPassword, InputSearch, InputNumber, TimeInput, DateTimePicker, Avatar, Tag, Badge, IconButton, Spinner, SegmentedControl, Switch (planned), Card (planned) |
| [`variant`](#c--variant) | primitive-specific enum | Visual treatment (fill / outline / ghost / link) | Button, Badge, Tag, Alert |
| [`color`](#d--color) | `"primary" \| "success" \| "warning" \| "attention" \| "info" \| "destructive" \| "default"` | Semantic role | Tag, Badge, Alert, Statistic (delta), Dot, IconSquare |
| [`tone`](#e--tone) | `"default" \| "muted" \| "outline-only"` | Surface tint / background treatment | Card |
| [`accent`](#f--accent) | `"primary" \| "success" \| "warning" \| "attention" \| "info" \| "destructive" \| "featured"` | Edge indicator (3px left edge or full ring) | Card |
| [`padding`](#g--padding) | `"tight" \| "default" \| "cozy" \| "none"` | Internal spacing density | Card, Dialog (planned), Sheet (planned), Popover (planned) |
| [`density`](#h--density) | `"compact" \| "default" \| "comfortable"` | Page-level spacing — usually inherited via `[data-density]` axis; explicit prop only when overriding the axis | Table (explicit), inherited by every other primitive |
| [`shape`](#i--shape) | `"square" \| "circle"` | Geometric form (Avatar, IconButton) | Avatar, IconButton |
| [`status`](#j--status) | `"default" \| "success" \| "warning" \| "error"` | Form-field validation state | Input family, Field, Form |
| [`orientation`](#k--orientation) | `"horizontal" \| "vertical"` | Axis of stack / progression — replaces Ant's `mode` / `direction` / `tabPosition` axis | Tabs, Menu, Steps, Anchor, Separator |
| [`placement`](#l--placement) | `"top" \| "right" \| "bottom" \| "left"` (+ `"start"` / `"end"` when direction matters) | Positional anchor of a region relative to its host | Tabs (tab-bar), Steps (labels), Popover, Tooltip, DropdownMenu |
| [`current`](#m--current) | `boolean` per item OR `number \| string` for selection | "This item is the current one" (boolean → `aria-current`) OR "active index" (number → Radix selection) | Breadcrumb (boolean), Steps (number) |
| [`value` / `defaultValue` / `onValueChange`](#n--value-selection) | Radix-style controlled / uncontrolled selection | Selection state — NEVER `defaultSelectedKeys` / `activeKey` | Tabs, Select, AutoComplete, Cascader, Menu, Pagination |
| [`justify`](#o--justify) | `"start" \| "center" \| "end" \| "between"` | Horizontal content alignment — reused from Flex | Flex, Pagination, Row, Space |
| [`sticky`](#p--sticky) | `boolean` | Pin-on-scroll behaviour (CSS `position: sticky` semantics) | Anchor, Table (planned header), Topbar |
| [`offset`](#q--offset) | `number` (px) | Pixel offset from anchor (direction-aware via `orientation`) | Anchor (scroll target), Popover (planned), Tooltip (planned) |
| [`open` / `defaultOpen` / `onOpenChange`](#r--open-overlay-state) | Radix-style controlled / uncontrolled overlay-visibility state | Overlay open/closed — NEVER `visible` / `isOpen` / `shown` / `display` | Dialog, AlertDialog, Sheet, Popover, DropdownMenu, Popconfirm, Tooltip |
| [`block`](#s--block) | `boolean` | Stretches to fill available width | Button, Card, Card, Card |
| [`hoverable`](#t--hoverable) | `boolean` | Adds hover-affordance (border + shadow lift + cursor pointer) | Card |
| [`disabled` / `loading` / `readOnly` / `required`](#u--interaction-state) | `boolean` | Interaction state | Forms |
| [`prefix` / `suffix` / `addonBefore` / `addonAfter`](#v--slot-props) | `ReactNode` | Decorative / functional slots | Input, Button, InputPassword, InputSearch |
| [`title` / `subtitle` / `kicker` / `meta` / `extra` / `footer` / `actions`](#w--card-slot-props) | `ReactNode` | Card header / footer slots | Card |
| [`band`](#x--band) | `"primary" \| "success" \| "warning" \| "attention" \| "info" \| "destructive" \| "gradient" \| "dotted"` | 4px color strip above card header | Card |
| [`truncate`](#y--truncate) | `boolean \| number` | Single-line vs multi-line clamp | Typography |

### Forbidden synonyms (rejected at review)

Mirror of CLAUDE.md §23.B forbidden list. Any PR that introduces
one of these names against the canonical concept is rejected:

| Forbidden | Canonical | Why |
|---|---|---|
| `mode` | `orientation` | Ant Menu used `mode="horizontal"` to mean axis-of-stack |
| `direction` | `orientation` | Ant Steps used `direction="vertical"` to mean axis-of-stack |
| `tabPosition` | `placement` (positional anchor) + `orientation` (axis) | Two concepts fused; split |
| `labelPlacement` | `placement` | Steps used `labelPlacement`; one name for positional anchor |
| `activeKey` / `selectedKeys` / `defaultActiveKey` / `defaultSelectedKeys` | `value` / `defaultValue` / `onValueChange` | Radix-canonical selection state |
| `align` (when meaning horizontal alignment) | `justify` | One name across Flex + Pagination + Row + Space |
| `affix` | `sticky` | CSS `position: sticky` is the canonical name |
| `visible` / `isOpen` / `shown` / `display` | `open` | Radix-canonical overlay state |
| `type` (Ant-borrowed) | `color` (semantic role) + `variant` (treatment) | Our `type` is reserved for HTML input/button type |
| `level` (Typography heading) | `size={1..5}` | One vocabulary across primitives |
| `ellipsis` | `truncate` | Single name for line clamp |
| `percent` (Progress) | `value` + `max` | Radix-style progress shape |
| `strokeColor` / `trailColor` (Progress) | `color` + token chain | Token-driven, not prop-driven |
| `severity` / `intent` / `kind` | `color` (semantic role) | Ant + MUI synonyms |
| `scale` / `dimension` / `width` / `height` | `size` | One dimensional axis name |
| `appearance` / `look` / `style` | `variant` | One visual-treatment name |
| `tint` / `theme` (the prop, not the axis) | `color` | One semantic-role name |
| `compactness` / `spacing` / `dense` | `padding` / `density` | Split internal vs page-level |
| `fullWidth` / `wide` / `stretched` | `block` | One name for "fill available width" |

## §B — `size`

**Concept**: dimensional scale of the primitive itself — height,
font-size, internal padding, gap.

**Type**:

```ts
type Size =
  | "x-small"  // optional — only when 4 tiers don't cover the use case
  | "small"
  | "default"
  | "large"
  | "x-large"; // optional — same caveat
```

**Default**: `"default"`.

**Token mapping** (per `--density-element-*` chain, [03 §E](./03-token-system.md#e--density)):

| Value | Token | Default-density height |
|---|---|---|
| `"x-small"` | `var(--density-element-xs)` | 1.5rem (24px) |
| `"small"` | `var(--density-element-sm)` | 1.75rem (28px) |
| `"default"` | `var(--density-element)` | 2rem (32px) |
| `"large"` | `var(--density-element-lg)` | 2.25rem (36px) |
| `"x-large"` | `var(--density-element-xl)` | 2.75rem (44px — large visual control) |

Rescales with `[data-density]` axis (cardinal rule 21).

Touch-target compliance does not change this mapping. Do not make
`size="small"` render at `--touch-target-min` on mobile. The 44px
floor is a hit-area contract; if the painted control is smaller, use
an invisible hit target or choose a larger explicit `size`.

**Examples**:

```tsx
<Button size="small">小</Button>
<Button>標準</Button>
<Button size="large">大</Button>
<Input size="small" placeholder="検索…" />
<Avatar size="x-large" name="Mai Nguyen" />
```

**Rejected synonyms**: `scale`, `dimension`, `width`, `height`, `level`.

## §C — `variant`

**Concept**: visual treatment — how the primitive is *drawn*
(filled / outlined / ghost / linked). Combined with `color`
(semantic role) for the full surface specification.

**Type**: primitive-specific enum. Common shapes:

| Primitive | Allowed values | Default |
|---|---|---|
| Button | `"primary" \| "secondary" \| "ghost" \| "outline" \| "link"` | `"primary"` |
| Badge | `"soft" \| "solid" \| "outline"` | `"soft"` |
| Tag | inherits Badge variants | `"soft"` |
| Alert | `"soft" \| "solid" \| "outline"` | `"soft"` |

**Rule**: `variant` is the ONE visual-treatment prop. Don't add
`appearance` / `style` / `look` synonyms.

**Examples**:

```tsx
<Button variant="primary">送信</Button>      // filled, brand color
<Button variant="ghost">キャンセル</Button>  // transparent
<Button variant="outline">下書き保存</Button>// bordered, transparent fill
<Button variant="link">詳細を見る</Button>   // text-only

<Badge variant="solid" color="success">完了</Badge>
<Badge variant="soft" color="success">承認待ち</Badge>
<Badge variant="outline" color="success">下書き</Badge>
```

## §D — `color`

**Concept**: semantic role. Maps directly to a semantic token in
the design system; the value selects WHICH role-color the surface
uses, not HOW it's drawn (`variant` handles that).

**Type**:

```ts
type SemanticColor =
  | "primary"
  | "success"
  | "warning"
  | "attention"   // 朱 vermilion — non-destructive alerts
  | "info"
  | "destructive" // 茜 madder — terminal / destructive
  | "default";    // muted / neutral
```

**Default**: `"default"`.

**Token mapping**:

| Value | Token chain |
|---|---|
| `"primary"` | `var(--primary)` (+ rescales per `data-accent`) |
| `"success"` | `var(--success)` — 若竹 #68be8d |
| `"warning"` | `var(--warning)` — 山吹 #f8b500 |
| `"attention"` | `var(--attention)` — 朱 #eb6101 |
| `"info"` | `var(--info)` — 群青 #4c6cb3 |
| `"destructive"` | `var(--destructive)` — 茜 #b7282e |
| `"default"` | `var(--muted-foreground)` for text / `var(--secondary)` for fill |

**Rule** (from dxs-kintai SKILL.md): prefer `"attention"` over
`"destructive"` for non-destructive alerts (遅刻 lateness, slow
operations, retryable failures). The "everything's red" pattern
is dated.

**Examples**:

```tsx
<Tag color="success">承認済</Tag>
<Tag color="attention">遅刻</Tag>      // not destructive — recoverable
<Tag color="destructive">失敗</Tag>    // terminal — cannot recover
<Badge variant="solid" color="info">情報</Badge>
```

**Rejected synonyms**: `intent`, `tint`, `theme` (the prop —
`data-theme` is the axis), `status` (when meaning role-color),
`severity`, `kind`, `type` (Ant-borrowed).

## §E — `tone`

**Concept**: surface tint / background treatment. Different from
`color` (semantic role) and `variant` (visual treatment).

**Type**: `"default" | "muted" | "outline-only"`.

**Default**: `"default"`. **Used by**: Card.

| Value | Background |
|---|---|
| `"default"` | `var(--card)` |
| `"muted"` | `var(--secondary)` |
| `"outline-only"` | `transparent` (border preserved) |

## §F — `accent`

**Concept**: edge indicator. 3px left border in semantic color, OR
full `--primary` ring for the `"featured"` value.

**Type**: `"primary" | "success" | "warning" | "attention" | "info" | "destructive" | "featured"`.

**Default**: `undefined` (no accent). **Used by**: Card.

## §G — `padding`

**Concept**: internal spacing density. The card's own padding,
controllable by the caller (different from `data-density`
page-level axis).

**Type**: `"tight" | "default" | "cozy" | "none"`.

**Default**: `"default"`.

| Value | Resolved padding |
|---|---|
| `"tight"` | 12px (= `var(--density-card)` × 0.75) |
| `"default"` | 16px (= `var(--density-card)` × 1) |
| `"cozy"` | 20px (= `var(--density-card)` × 1.25) |
| `"none"` | 0 (flush — for cards with explicit Card/Card/Card) |

**Used by**: Card. Future: Dialog, Sheet, Popover.

**Rejected synonyms**: `compactness`, `spacing`, `dense`.

## §H — `density`

**Concept**: page-level spacing scale. **Almost always inherited
via the `[data-density]` axis on `<html>`** ([01-theme-axes.md
§3](./01-theme-axes.md#3--data-density--spacing-density)) — only
set explicitly on a primitive when you need to OVERRIDE the page
axis for that one region.

**Type**: `"compact" | "default" | "comfortable"`.

**Used by**: Table (explicit prop for dense data tables); implicitly
by every other primitive via token chain.

## §I — `shape`

**Concept**: geometric form. Circle vs square outline.

**Type**: `"square" | "circle"`.

**Default**: `"circle"` for Avatar, `"square"` for IconButton.

```tsx
<Avatar shape="square" name="ACME Corp" />  // company logo
<Avatar shape="circle" name="Mai Nguyen" /> // person
```

## §J — `status`

**Concept**: form-field validation state.

**Type**: `"default" | "success" | "warning" | "error"`.

**Used by**: Input, InputPassword, InputSearch, InputNumber,
TimeInput, DateTimePicker, Field, Form.

```tsx
<Input status="error" />
<Field label="Email" status="error" errorMessage="無効なアドレスです" />
```

## §K — `orientation`

**Concept**: axis of stack / progression. Replaces Ant Design's
`mode` (Menu) / `direction` (Steps, Anchor) / axis-of-`tabPosition`
(Tabs) under one name. Matches Radix UI + ARIA `aria-orientation`.

**Type**: `"horizontal" | "vertical"`.

**Used by**: Tabs, Menu, Steps, Anchor, Separator.

```tsx
<Tabs orientation="vertical" value={tab} onValueChange={setTab}>…</Tabs>
<Steps orientation="vertical" current={2}>…</Steps>
<Menu orientation="horizontal">…</Menu>
<Anchor orientation="vertical" sticky offset={64}>…</Anchor>
```

**Rejected synonyms**: `mode`, `direction`, `tabPosition` (the axis
portion of tab-position).

## §L — `placement`

**Concept**: positional anchor of a region relative to its host.
Replaces Ant Design's `tabPosition` / `labelPlacement`. Matches
Radix UI Tooltip/Popover.

**Type**: `"top" | "right" | "bottom" | "left"` (+ `"start"` /
`"end"` when document-flow direction matters).

**Used by**: Tabs (tab-bar position), Steps (label position),
Popover, Tooltip, DropdownMenu.

```tsx
<Tabs orientation="vertical" placement="left">…</Tabs>  // left side tab-bar
<Tooltip placement="top">…</Tooltip>
<Popover placement="bottom-start">…</Popover>
```

**Rejected synonyms**: `tabPosition`, `labelPlacement`.

## §M — `current`

**Concept**: "this item is the current one". Boolean per item OR
number/string for active index.

**Type** (per primitive):

```ts
// Breadcrumb item — boolean
<Breadcrumb.Item current>Profile</Breadcrumb.Item>
// renders aria-current="page"

// Steps container — number active index
<Steps current={2}>…</Steps>
// step 0, 1, 2 — radix-style selection state
```

**Used by**: Breadcrumb (boolean), Steps (number).

Booleans bind to `aria-current`; numbers bind to Radix-style
selection. Mutually exclusive at the prop level (Breadcrumb vs
Steps); both spellings of "current" live under one name.

## §N — `value` (selection)

**Concept**: Radix-style controlled / uncontrolled selection state.

**Props (Radix triad)**:

- `value` — controlled value
- `defaultValue` — uncontrolled initial value
- `onValueChange(next)` — change callback

**Used by**: Tabs, Select, AutoComplete, Cascader, Menu (planned),
Pagination (planned).

```tsx
<Tabs value={tab} onValueChange={setTab}>
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
</Tabs>

<Select value={lang} onValueChange={setLang}>
  <Select.Item value="ja">日本語</Select.Item>
  <Select.Item value="en">English</Select.Item>
</Select>
```

**Rejected synonyms**: `activeKey` / `selectedKeys` /
`defaultActiveKey` / `defaultSelectedKeys` (Ant-borrowed).

## §O — `justify`

**Concept**: horizontal content alignment along the main axis.
Reused from Flex.

**Type**: `"start" | "center" | "end" | "between"` (+
`"around"` / `"evenly"` on Flex).

**Used by**: Flex, Pagination, Row, Space.

```tsx
<Flex justify="between">…</Flex>
<Pagination justify="end" total={300} pageSize={20} />
```

**Rejected synonym**: `align` when meaning horizontal-axis alignment.
Use `align` ONLY for cross-axis alignment (Flex `align="center"`).

## §P — `sticky`

**Concept**: pin-on-scroll behaviour. Matches CSS `position: sticky`
semantics.

**Type**: `boolean`.

**Used by**: Anchor, Table (planned header), Topbar.

```tsx
<Anchor sticky offset={64}>…</Anchor>
<Topbar sticky>…</Topbar>
```

**Rejected synonym**: `affix` (Ant-borrowed).

## §Q — `offset`

**Concept**: pixel offset from anchor. Direction-aware via
`orientation`.

**Type**: `number` (px).

**Used by**: Anchor (scroll target offset), Popover (planned),
Tooltip (planned).

```tsx
<Anchor offset={64}>…</Anchor>  // 64px below the topbar
```

## §R — `open` (overlay state)

**Concept**: Radix-style controlled / uncontrolled overlay-visibility.

**Props (Radix triad)**:

- `open` — controlled visibility
- `defaultOpen` — uncontrolled initial visibility
- `onOpenChange(next)` — change callback

**Used by**: Dialog, AlertDialog, Sheet, Popover, DropdownMenu,
Popconfirm, Tooltip.

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>…</Dialog.Content>
</Dialog>
```

**Rejected synonyms**: `visible`, `isOpen`, `shown`, `display`.
Radix-canonical `open` is mandatory across the entire overlay
stack.

## §S — `block`

**Concept**: stretches to fill available width, OR (for
region-atoms like Card) marks the region as "flush block"
(own padding + divider).

**Type**: `boolean`. **Default**: `false`.

**Used by**: Button, Card, Card, Card.

```tsx
<Button block>送信する</Button>          // full-width form submit
<Card padding="none">
  <Card block title="…" />        // flush header with divider
  <Card block>…</Card>
</Card>
```

**Rejected synonyms**: `fullWidth`, `wide`, `stretched`.

## §T — `hoverable`

**Concept**: hover-affordance. Border-color lift + shadow on hover,
`cursor: pointer`.

**Type**: `boolean`. **Default**: `false`. **Used by**: Card.

## §U — Interaction state (booleans)

**Concept**: per-instance interaction state.

| Prop | Used by | Description |
|---|---|---|
| `disabled` | Button, Input family, Tabs item, Checkbox, Switch, Menu | Cannot be interacted with; renders muted; not in tab order |
| `loading` | Button, IconButton | Shows spinner + disables interaction |
| `readOnly` | Input family | Value visible but not editable; still in tab order |
| `required` | Input family, Field | Marks field as required; renders asterisk |
| `autoFocus` | Input, Button | Focused on mount |
| `defaultChecked` / `checked` | Checkbox, Switch, Radio | Boolean value |
| `defaultValue` / `value` | Input, Slider, Combobox, RangeCalendar, … | Controlled / uncontrolled value |

Every state prop is a single-concept boolean. Don't pack multiple
states (`busy={true}` meaning loading-or-disabled).

## §V — Slot props

**Concept**: decorative / functional slots that render `ReactNode`
inside the primitive's chrome.

| Prop | Used by | Position |
|---|---|---|
| `prefix` | Input, InputPassword, InputSearch | Inside the input, before the text (e.g. search icon) |
| `suffix` | Input | Inside the input, after the text |
| `addonBefore` | Input | Outside the input on the left |
| `addonAfter` | Input | Outside the input on the right |
| `startContent` / `endContent` (Button) | Button, IconButton | Icon slot inside the button before / after the label |

`prefix` / `suffix` are INSIDE the chrome (same border);
`addonBefore` / `addonAfter` are OUTSIDE (separate border).

## §W — Card slot props

**Concept**: Card-specific slots — header / footer regions.

| Prop | Concept | Renders |
|---|---|---|
| `title` | Primary header text | `<h3 class="card-title">` (13px / 500) |
| `subtitle` | Stacked below title | `<span class="card-subtitle">` (11px muted) |
| `kicker` | Small uppercase label ABOVE title | `<span class="card-kicker">` (10px uppercase) |
| `meta` | Right-aligned secondary text | `<span class="card-meta">` (11px muted) |
| `extra` | Right-aligned slot (buttons / tags) | `<span class="card-header-extra">` |
| `footer` | Footer region with top divider + secondary tint | `.card-footer-{block,inline}` |
| `actions` | Footer region right-aligned, transparent bg | `.card-footer-actions.card-footer-{block,inline}` |
| `band` | 4px color strip above header (see §X) | `.card-band-*` |

**Header shape auto-detects** from slot presence:

- `kicker` set → `.card-header-kicker` (3-tier column)
- `subtitle` set, no `kicker` → `.card-header-stack` (2-tier column)
- else → `.card-header-row` (row with optional meta-right)

## §X — `band`

**Concept**: 4px color strip ABOVE the card header.

**Type**: `"primary" | "success" | "warning" | "attention" | "info" | "destructive" | "gradient" | "dotted"`.

**Used by**: Card. Only meaningful with `padding="none"`.

## §Y — `truncate`

**Concept**: single-line vs multi-line clamp on text primitives.

**Type**: `boolean | number` (number = max lines for multi-line
clamp).

**Used by**: Typography (Title, Paragraph, Text).

```tsx
<Typography.Paragraph truncate>…</Typography.Paragraph>          // 1 line
<Typography.Paragraph truncate={3}>…</Typography.Paragraph>      // 3 lines
```

**Rejected synonym**: `ellipsis` (Ant-borrowed).

## §Z — Per-primitive vocabulary consumption

Quick-reference: which vocabulary entries each primitive consumes.
"e+" = explicit prop on this primitive; "i+" = inherited from
`[data-density]` / `[data-theme]` / `[data-accent]` axis only.

### general (2)

| Primitive | size | variant | color | block | disabled | loading | startContent/endContent | truncate |
|---|---|---|---|---|---|---|---|---|
| Button | e+ | e+ | (inherited via variant) | e+ | e+ | e+ | e+ | – |
| Typography (Title, Paragraph, Text, …) | e+ (1..5 for Title) | – | e+ | – | – | – | – | e+ |

### layout (6)

| Primitive | gutter | justify | align | gap | direction | wrap | xs / sm / md / lg / xl |
|---|---|---|---|---|---|---|---|
| Row | e+ | e+ | e+ | – | – | e+ | – |
| Col | – | – | – | – | – | – | e+ (responsive span) |
| Flex | – | e+ | e+ | e+ | e+ | e+ | – |
| Space | – | e+ | – | e+ | e+ | – | – |
| Grid | – | – | – | – | – | – | – (CSS grid passthrough) |
| Masonry | – | – | – | – | – | – | – (column-count passthrough) |

### data-display (20)

| Primitive | size | variant | color | shape | open | placement | hoverable | tone | accent | band | padding | sticky |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Avatar | e+ | – | – | e+ | – | – | – | – | – | – | – | – |
| Badge | e+ | e+ | e+ | – | – | – | – | – | – | – | – | – |
| Card | – | – | – | – | – | – | e+ | e+ | e+ | e+ | e+ | – |
| Calendar | – | – | – | – | – | – | – | – | – | – | – | – |
| Carousel | – | – | – | – | – | – | – | – | – | – | – | – |
| Collapse | – | – | – | – | e+ | – | – | – | – | – | – | – |
| Descriptions | – | – | – | – | – | – | – | – | – | – | – | – |
| Empty | – | – | – | – | – | – | – | – | – | – | – | – |
| Image | – | – | – | – | – | – | – | – | – | – | – | – |
| List | – | – | – | – | – | – | – | – | – | – | – | – |
| Popover | – | – | – | – | e+ | e+ | – | – | – | – | – | – |
| QRCode | e+ | – | – | – | – | – | – | – | – | – | – | – |
| SegmentedControl | e+ | – | – | – | – | – | – | – | – | – | – | – |
| Statistic | – | – | e+ (delta) | – | – | – | – | – | – | – | – | – |
| Table | – | – | – | – | – | – | – | – | – | – | – | e+ (header) |
| Tag | e+ | e+ | e+ | – | – | – | – | – | – | – | – | – |
| Timeline | – | – | – | – | – | – | – | – | – | – | – | – |
| Tooltip | – | – | – | – | e+ | e+ | – | – | – | – | – | – |
| Tour | – | – | – | – | e+ | e+ | – | – | – | – | – | – |
| Tree | – | – | – | – | – | – | – | – | – | – | – | – |

### data-entry (24)

| Primitive | size | status | disabled | readOnly | required | prefix/suffix | addonBefore/After | value triad |
|---|---|---|---|---|---|---|---|---|
| Input | e+ | e+ | e+ | e+ | e+ | e+ | e+ | e+ |
| Textarea | e+ | e+ | e+ | e+ | e+ | – | – | e+ |
| InputPassword | e+ | e+ | e+ | – | e+ | e+ | – | e+ |
| InputSearch | e+ | e+ | e+ | – | – | e+ | – | e+ |
| InputNumber | e+ | e+ | e+ | e+ | e+ | e+ | – | e+ |
| Field | – | e+ | – | – | e+ | – | – | – |
| Label | – | – | – | – | – | – | – | – |
| Checkbox | – | – | e+ | – | e+ | – | – | e+ (checked) |
| CheckboxGroup | – | – | e+ | – | – | – | – | e+ |
| Radio | – | – | e+ | – | e+ | – | – | e+ |
| Switch | e+ | – | e+ | – | – | – | – | e+ (checked) |
| Slider | – | – | e+ | – | – | – | – | e+ |
| Select | e+ | e+ | e+ | – | e+ | – | – | e+ |
| AutoComplete | e+ | e+ | e+ | – | e+ | – | – | e+ |
| Cascader | e+ | e+ | e+ | – | e+ | – | – | e+ |
| ColorPicker | – | – | e+ | – | – | – | – | e+ |
| DateTimePicker | e+ | e+ | e+ | – | e+ | – | – | e+ |
| TimeInput | e+ | e+ | e+ | – | e+ | – | – | e+ |
| TreeSelect | e+ | e+ | e+ | – | e+ | – | – | e+ |
| Rate | – | – | e+ | – | e+ | – | – | e+ |
| Form | – | – | – | – | – | – | – | – |
| Transfer | e+ | – | e+ | – | – | – | – | e+ |
| Checklist | – | – | – | – | – | – | – | e+ |

Select item selection is indicated by the row state itself
(`data-state="checked"` with a primary-tinted background). Do not add a
leading check icon / indicator column to `select option`; it wastes
horizontal space in dense table filters and mobile drawers.
| LocaleTabs | – | – | – | – | – | – | – | e+ |

### feedback (11)

| Primitive | variant | color | open | placement | size |
|---|---|---|---|---|---|
| Alert | e+ | e+ | – | – | – |
| Dialog | – | – | e+ | – | – |
| AlertDialog | – | – | e+ | – | – |
| Sheet | – | – | e+ | e+ | – |
| Popconfirm | – | – | e+ | e+ | – |
| Progress | – | e+ | – | – | e+ |
| Result | – | e+ | – | – | – |
| Skeleton | – | – | – | – | e+ |
| Spinner | – | e+ | – | – | e+ |
| Toaster | – | e+ | – | e+ | – |
| Watermark | – | – | – | – | – |

### navigation (7)

| Primitive | orientation | placement | current | value triad | sticky | offset | justify |
|---|---|---|---|---|---|---|---|
| Anchor | e+ | – | e+ (item) | – | e+ | e+ | – |
| Breadcrumb | – | – | e+ (item boolean) | – | – | – | – |
| DropdownMenu | – | e+ | – | e+ | – | – | – |
| Menu | e+ | – | – | e+ | – | – | – |
| Pagination | – | – | – | e+ | – | – | e+ |
| Steps | e+ | e+ (labels) | e+ (index) | – | – | – | – |
| Tabs | e+ | e+ | – | e+ | – | – | – |

### shell (8)

Shell primitives compose primitives + shell-specific layout. Most
visual configuration flows through the `[data-density]` /
`[data-theme]` / `[data-accent]` axes, not per-shell props.

| Primitive | Notable explicit props |
|---|---|
| AppShell | – (layout container) |
| Sidebar | `collapsed`, `defaultCollapsed`, `onCollapsedChange` (Radix-style open-state pair tuned for the sidebar) |
| Topbar | `sticky` |
| ProductSwitcher | `value` triad |
| ProjectSwitcher | `value` triad |
| CommandPalette | `open` triad |
| TweaksPanel | `open` triad |
| PageContent | – |

## §AA — When to add a new prop

If you find yourself needing a prop NOT in this catalogue, run the
cardinal rule 23 §D deep-research pre-flight:

1. Grep existing primitives for the same concept under a different
   name. If a peer has it, use the peer's name verbatim.
2. Check the design canon — is the concept shown? If yes, port
   the name from the design. If no, STOP and ask the user.
3. If the concept is genuinely new, add it to this catalogue
   (`new-docs/04-prop-vocabulary.md`) in a new §section AND to
   CLAUDE.md §23.B, THEN add it to the primitive.

Don't ship a prop without the vocabulary entry. Reviewers reject.

## §AB — Cross-primitive consistency check (CI)

A future lint script (`scripts/lint-prop-vocabulary.mjs`) will:

1. Parse every primitive's exported interface.
2. Cross-reference prop names against this catalogue.
3. Fail if a primitive uses a forbidden synonym (`scale` instead
   of `size`, `kind` instead of `variant`, `mode` instead of
   `orientation`, `visible` instead of `open`, etc.).
4. Fail if a primitive declares a prop name NOT in the catalogue
   AND no `docs/reference/<group>/<Name>.md` divergence section
   documents the reason.

Until the script lands, reviewers manually check at PR review.

## §AC — Standards (international)

- **Adobe Spectrum API conventions** — `size` / `variant` /
  `isQuiet` / `isDisabled` / `isReadOnly` shape.
  <https://spectrum.adobe.com/components.html>
- **Material UI prop API conventions** — `variant` / `size` /
  `color` triad as the canonical Material shape.
  <https://mui.com/material-ui/api/>
- **Radix UI primitive prop shape** — `value` / `defaultValue` /
  `onValueChange`, `open` / `defaultOpen` / `onOpenChange`,
  `orientation`, `placement`, `asChild` slot pattern.
  <https://radix-ui.com/primitives/docs>
- **shadcn/ui** — variant prop via `class-variance-authority`.
  <https://ui.shadcn.com/docs/components/button>
- **W3C ARIA Authoring Practices** — `aria-orientation`,
  `aria-current`, `aria-disabled`, `aria-readonly`, `aria-required`
  naming inherits to React-shaped props.
  <https://www.w3.org/WAI/ARIA/apg/>

## §AD — Connected rules

- Cardinal rule 23 (concept-first API + prop reuse + token
  existence + deep-research) — `./CLAUDE.md` §23.
- Cardinal rule 27 (per-group folders) — props travel with the
  primitive file at `src/components/<group>/<Name>.tsx`.
- Cardinal rule 29 (stories consume primitives) — vocabulary
  consistency is the teaching surface.
- Token system foundation — [`./03-token-system.md`](./03-token-system.md).
- Theme axes — [`./01-theme-axes.md`](./01-theme-axes.md).
- Consumer contract — [`./02-consumer-contract.md`](./02-consumer-contract.md).
- new-godx-design-to-component skill — Part 5 connected rules.
