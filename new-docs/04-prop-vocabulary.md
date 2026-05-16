---
title: Shared prop vocabulary
status: binding
authority: this-file
applies-to:
  - src/components/primitives/**
  - src/components/composites/**
  - src/components/shell/**
last-reviewed: 2026-05-16
---

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

## §A — The locked vocabulary

| Prop | Type | Concept | Used by |
|---|---|---|---|
| [`size`](#b--size) | `"x-small" \| "small" \| "default" \| "large" \| "x-large"` | Dimensional scale of the primitive itself | Button, Input, InputPassword, InputSearch, TimeInput, DateField, TimeField, DatePicker, DateRangePicker, Avatar, AvatarStack, Tag, Badge, IconButton, Spinner, SegmentedControl, Card (planned) |
| [`variant`](#c--variant) | primitive-specific enum | Visual treatment (fill / outline / ghost / link) | Button, Badge, Tag, Alert (planned) |
| [`color`](#d--color) | `"primary" \| "success" \| "warning" \| "attention" \| "info" \| "destructive" \| "default"` | Semantic role | Tag, Badge, Alert, Statistic (delta), Dot, IconSquare |
| [`tone`](#e--tone) | `"default" \| "muted" \| "outline-only"` | Surface tint / background treatment | Card |
| [`accent`](#f--accent) | `"primary" \| "success" \| "warning" \| "attention" \| "info" \| "destructive" \| "featured"` | Edge indicator (3px left edge or full ring) | Card |
| [`padding`](#g--padding) | `"tight" \| "default" \| "cozy" \| "none"` | Internal spacing density | Card, Dialog (planned), Sheet (planned), Popover (planned) |
| [`density`](#h--density) | `"compact" \| "default" \| "comfortable"` | Page-level spacing — usually inherited via `[data-density]` axis; explicit prop only when overriding the axis | Table (explicit), inherited by every other primitive |
| [`shape`](#i--shape) | `"square" \| "circle"` | Geometric form (Avatar, IconButton) | Avatar, IconButton |
| [`status`](#j--status) | `"default" \| "success" \| "warning" \| "error"` | Form-field validation state | Input family, Field, FormItem |
| [`block`](#k--block) | `boolean` | Stretches the primitive to fill available width / for flush regions inside flush cards | Button, CardHeader, CardBody, CardFooter |
| [`hoverable`](#l--hoverable) | `boolean` | Adds hover-affordance (border + shadow lift + cursor pointer) | Card |
| [`disabled` / `loading` / `readOnly` / `required`](#m--interaction-state) | `boolean` | Interaction state | Forms |
| [`prefix` / `suffix` / `addonBefore` / `addonAfter`](#n--slot-props) | `ReactNode` | Decorative / functional slots | Input, Button, InputPassword, InputSearch |
| [`title` / `subtitle` / `kicker` / `meta` / `extra` / `footer` / `actions`](#o--card-slot-props) | `ReactNode` | Card header / footer slots | Card |
| [`band`](#p--band) | `"primary" \| "success" \| "warning" \| "attention" \| "info" \| "destructive" \| "gradient" \| "dotted"` | 4px color strip above card header | Card |

Forbidden synonyms (rejected at review): `scale` / `dimension` /
`width` for `size`; `kind` / `style` / `look` / `appearance` for
`variant`; `intent` / `tint` / `theme` (the prop, not the axis) /
`status` (when meaning role-color) for `color`; `compactness` /
`spacing` / `dense` for `padding`; `fullWidth` / `wide` for `block`.

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

**Token mapping** (per `--density-element-*` chain):

| Value | Token | Default-density height |
|---|---|---|
| `"x-small"` | `var(--density-element-xs)` | 1.5rem (24px) |
| `"small"` | `var(--density-element-sm)` | 1.75rem (28px) |
| `"default"` | `var(--density-element)` | 2rem (32px) |
| `"large"` | `var(--density-element-lg)` | 2.25rem (36px) |
| `"x-large"` | `var(--density-element-xl)` | 2.75rem (44px — WCAG touch floor) |

Rescales with `[data-density]` axis (cardinal rule 21).

**Examples**:

```tsx
<Button size="small">小</Button>
<Button>標準</Button>
<Button size="large">大</Button>
<Input size="small" placeholder="検索…" />
<Avatar size="x-large" name="Mai Nguyen" />
```

**Rejected synonyms**: `scale`, `dimension`, `width`, `height`.

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
| Alert (planned) | `"soft" \| "solid" \| "outline"` | `"soft"` |

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

**Composition with `color`**: `variant` carries treatment, `color`
carries role. Together they fully specify the surface (`<Badge
variant="solid" color="attention">` = solid 朱 vermilion).

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
  | "attention"   // 朱 vermilion — non-destructive alerts (preferred over destructive)
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
<Dot color="success" />                // status dot
<Card accent="primary" title="…" />
```

**Rejected synonyms**: `intent`, `tint`, `theme` (the prop —
`data-theme` is the axis), `status` (when meaning role-color).

## §E — `tone`

**Concept**: surface tint / background treatment. Different from
`color` (semantic role) and `variant` (visual treatment).

**Type**:

```ts
type Tone = "default" | "muted" | "outline-only";
```

**Default**: `"default"`.

**Token mapping**:

| Value | Background |
|---|---|
| `"default"` | `var(--card)` |
| `"muted"` | `var(--secondary)` |
| `"outline-only"` | `transparent` (border preserved) |

**Used by**: Card. (Sheet / Dialog may adopt later.)

**Examples**:

```tsx
<Card tone="muted">                  // gray fill — empty state, hint surfaces
<Card tone="outline-only">           // transparent — bare border container
```

## §F — `accent`

**Concept**: edge indicator. 3px left border in semantic color, OR
full --primary ring for the `"featured"` value. Independent of
`color` because `accent` is structural-edge while `color` is
text/fill role.

**Type**:

```ts
type Accent =
  | "primary" | "success" | "warning" | "attention"
  | "info" | "destructive" | "featured";
```

**Default**: `undefined` (no accent).

**Token mapping**: same semantic tokens as `color`, applied to
`border-left` (3px); `"featured"` paints the full perimeter with
`var(--primary)` + a 1px inset ring.

**Used by**: Card. Mirrors design-canon `.card.accent-*`
(`.card.accent-left`, `.card.accent-success`, …, `.card.featured`).

**Examples**:

```tsx
<Card accent="info">    {/* H11-style info-edge card */}
<Card accent="featured">{/* "Recommended" pricing-tier card */}
```

## §G — `padding`

**Concept**: internal spacing density. The card's own padding,
controllable by the caller (different from `data-density`
page-level axis).

**Type**:

```ts
type Padding = "tight" | "default" | "cozy" | "none";
```

**Default**: `"default"`.

**Token mapping**:

| Value | Resolved padding |
|---|---|
| `"tight"` | 12px (= `var(--density-card)` × 0.75) |
| `"default"` | 16px (= `var(--density-card)` × 1) |
| `"cozy"` | 20px (= `var(--density-card)` × 1.25) |
| `"none"` | 0 (flush — for cards with explicit CardHeader / CardBody / CardFooter regions) |

Rescales with `[data-density]` axis (compact: 9/12/15; comfortable:
18/24/30).

**Used by**: Card. Future: Dialog, Sheet, Popover.

**Examples**:

```tsx
<Card padding="tight">     {/* KPI tile */}
<Card padding="cozy">      {/* CTA card */}
<Card padding="none">      {/* flush — pair with CardHeader block */}
  <CardHeader block title="…" />
  <CardBody block>…</CardBody>
</Card>
```

**Rejected synonyms**: `compactness`, `spacing`, `dense`.

## §H — `density`

**Concept**: page-level spacing scale. **Almost always inherited
via the `[data-density]` axis on `<html>`** ([01-theme-axes.md
§3](./01-theme-axes.md#3--data-density--spacing-density)) — only
set explicitly on a primitive when you need to OVERRIDE the page
axis for that one region.

**Type**:

```ts
type Density = "compact" | "default" | "comfortable";
```

**Default**: `"default"` (inherited from axis).

**Used by**: Table (explicit prop for dense data tables);
implicitly by every other primitive via token chain.

**Examples**:

```tsx
<Table density="compact" rows={…} />   // kintone-style data table
```

In most cases set the axis on `<html>` instead:

```tsx
document.documentElement.dataset.density = "compact";
```

## §I — `shape`

**Concept**: geometric form. Circle vs square outline.

**Type**:

```ts
type Shape = "square" | "circle";
```

**Default**: `"circle"` for Avatar, `"square"` for IconButton.

**Used by**: Avatar (circular profile pic vs square logo tile),
IconButton (square button with icon).

**Examples**:

```tsx
<Avatar shape="square" name="ACME Corp" />  // company logo
<Avatar shape="circle" name="Mai Nguyen" /> // person
```

## §J — `status`

**Concept**: form-field validation state.

**Type**:

```ts
type FormStatus = "default" | "success" | "warning" | "error";
```

**Default**: `"default"`.

**Token mapping**: drives the field's border + ring + helper-text
color via the semantic chain.

**Used by**: Input, InputPassword, InputSearch, TimeInput,
DateField, TimeField, DatePicker, DateRangePicker, Field, FormItem.

**Rule**: `status` is FORM-validation specific. For semantic role
(non-form context like Tag / Badge / Dot), use `color`. Same enum
values mostly overlap but the concepts are distinct.

**Examples**:

```tsx
<Input status="error" />              // red border + ring
<Input status="warning" />            // yellow
<Field label="Email" status="error" errorMessage="無効なアドレスです" />
```

## §K — `block`

**Concept**: stretches the primitive to fill available width, OR
(for region-atoms like CardHeader) marks the region as "flush
block" (own padding + divider) rather than inline.

**Type**: `boolean`.

**Default**: `false`.

**Used by**:

- Button: when `true`, button takes 100% width of the parent.
- CardHeader / CardBody / CardFooter: when `true`, region pads
  itself + draws divider (for cards with `padding="none"`); when
  `false`, region sits inside the parent card's padding.

**Examples**:

```tsx
<Button block>送信する</Button>          // full-width form submit
<Card padding="none">
  <CardHeader block title="…" />        // flush header with divider
  <CardBody block>…</CardBody>          // flush body with padding
</Card>
```

**Rejected synonyms**: `fullWidth`, `wide`, `stretched`.

## §L — `hoverable`

**Concept**: hover-affordance. The primitive gains a border-color
lift + shadow on hover, and `cursor: pointer`.

**Type**: `boolean`.

**Default**: `false`.

**Used by**: Card. (`hoverable` is the right name because it
describes the AFFORDANCE; a card with `hoverable` is a card the
user can semantically click. Synonyms like `clickable` are
ambiguous — every div is clickable.)

**Examples**:

```tsx
<Card hoverable title="Settings →">…</Card>  // clickable settings tile
```

## §M — Interaction state (booleans)

**Concept**: per-instance interaction state.

| Prop | Used by | Description |
|---|---|---|
| `disabled` | Button, Input family, Tabs item, Checkbox, Switch, MenuItem | Cannot be interacted with; renders muted; not in tab order |
| `loading` | Button, IconButton | Shows spinner + disables interaction |
| `readOnly` | Input family | Value visible but not editable; still in tab order |
| `required` | Input family, Field | Marks field as required; renders asterisk |
| `autoFocus` | Input, Button | Focused on mount |
| `defaultChecked` / `checked` | Checkbox, Switch, Radio | Boolean value |
| `defaultValue` / `value` | Input, Slider, Combobox, RangeCalendar, … | Controlled / uncontrolled value |

**Rule**: every state prop is a single-concept boolean. Don't pack
multiple states (`busy={true}` meaning loading-or-disabled).

**Examples**:

```tsx
<Button loading>処理中…</Button>
<Input disabled value="—" />
<Input readOnly value="表示のみ" />
<Field label="メール" required>
  <Input type="email" />
</Field>
```

## §N — Slot props

**Concept**: decorative / functional slots that render `ReactNode`
inside the primitive's chrome.

| Prop | Used by | Position |
|---|---|---|
| `prefix` | Input, InputPassword, InputSearch | Inside the input, before the text (e.g. search icon) |
| `suffix` | Input | Inside the input, after the text (e.g. unit, status icon) |
| `addonBefore` | Input | Outside the input on the left (e.g. country code, currency) |
| `addonAfter` | Input | Outside the input on the right (e.g. ".com", unit) |
| `startContent` / `endContent` (Button) | Button, IconButton | Icon slot inside the button before / after the label |

**Rule**: `prefix` / `suffix` are INSIDE the chrome (same border);
`addonBefore` / `addonAfter` are OUTSIDE (separate border).
`startContent` / `endContent` are Button-specific icon slots.

**Examples**:

```tsx
<Input
  prefix={<Mail size={14} />}
  placeholder="メール"
/>
<Input
  addonBefore="https://"
  addonAfter=".com"
  placeholder="company"
/>
<Button startContent={<Plus size={14} />}>追加</Button>
```

## §O — Card slot props

**Concept**: Card-specific slots — header / footer regions.

| Prop | Concept | Renders |
|---|---|---|
| `title` | Primary header text | `<h3 class="card-title">` (13px / 500) |
| `subtitle` | Stacked below title | `<span class="card-subtitle">` (11px muted) → switches header shape to `.ch-stack` (column) |
| `kicker` | Small uppercase label ABOVE title | `<span class="card-kicker">` (10px uppercase 0.08em) → switches to `.ch-kicker` (3-tier column) |
| `meta` | Right-aligned secondary text | `<span class="card-meta">` (11px muted, `margin-left: auto`) → stays in `.ch` row |
| `extra` | Right-aligned slot (buttons / tags / live dot) | `<span class="card-header-extra">` |
| `footer` | Footer region with top divider + secondary tint | `.card-footer-{block,inline}` |
| `actions` | Footer region right-aligned, transparent bg | `.card-footer-actions.card-footer-{block,inline}` |
| `band` | 4px color strip above header | `.card-band-*` |

**Header shape auto-detects** from slot presence:

- `kicker` set → `.card-header-kicker` (3-tier column)
- `subtitle` set, no `kicker` → `.card-header-stack` (2-tier column)
- else → `.card-header-row` (row with optional meta-right)

`extra` ALWAYS renders right-aligned at end of header (works with
all three shapes via absolute-positioning in stack/kicker shapes).

**Examples**:

```tsx
<Card title="承認待ち" meta="12 件" />          // H3 row, meta-right
<Card title="申請" subtitle="2 件保留中" />    // H2 stacked
<Card kicker="5月度" title="¥8,420,500" subtitle="支払合計" />  // H12 3-tier
<Card title="勤怠データ" extra={<Button>新規</Button>} />        // H5 actions
<Card title="承認済" band="success" padding="none" />            // H11 color band
<Card title="…" footer={<><Clock /> 5 分前</>} />                // footer with divider + tint
<Card title="…" actions={<><Button>却下</Button><Button>承認</Button></>} />  // right-aligned action bar
```

## §P — `band`

**Concept**: 4px color strip ABOVE the card header. Mirrors design
canon H11 `.ch-band`.

**Type**:

```ts
type CardBand =
  | "primary" | "success" | "warning" | "attention"
  | "info" | "destructive" | "gradient" | "dotted";
```

**Default**: `undefined` (no band).

**Token mapping**:

| Value | Background |
|---|---|
| `"primary"` … `"destructive"` | `var(--primary)` … `var(--destructive)` |
| `"gradient"` | `linear-gradient(90deg, var(--primary), var(--attention), var(--info))` |
| `"dotted"` | repeating dotted line in `var(--muted-foreground)` |

Height = `var(--card-band-height)` (4px hairline-class literal —
documented exception to "rem only" per token-system §D).

**Used by**: Card (only meaningful with `padding="none"` because
the band needs to touch card edges).

## §Q — When to add a new prop

If you find yourself needing a prop NOT in this catalogue, run the
cardinal rule 23 §D deep-research pre-flight:

1. Grep existing primitives for the same concept under a different
   name. If a peer has it, use the peer's name verbatim.
2. Check the design canon — is the concept shown? If yes, port
   the name from the design. If no, STOP and ask the user.
3. If the concept is genuinely new, add it to this catalogue
   (`new-docs/04-prop-vocabulary.md`) in a new §section, THEN add
   it to the primitive.

Don't ship a prop without the vocabulary entry. Reviewers reject.

## §R — Cross-primitive consistency check (CI)

A future lint script (`scripts/lint-prop-vocabulary.mjs`) will:

1. Parse every primitive's exported interface.
2. Cross-reference prop names against this catalogue.
3. Fail if a primitive uses a forbidden synonym (`scale` instead
   of `size`, `kind` instead of `variant`, etc.).
4. Fail if a primitive declares a prop name NOT in the catalogue
   AND no `docs/reference/primitives/<Name>.md` divergence section
   documents the reason.

Until the script lands, reviewers manually check at PR review.

## §S — Standards (international)

- **Adobe Spectrum API conventions** — `size` / `variant` /
  `isQuiet` / `isDisabled` / `isReadOnly` shape.
  <https://spectrum.adobe.com/components.html>
- **Material UI prop API conventions** — `variant` / `size` /
  `color` triad as the canonical Material shape.
  <https://mui.com/material-ui/api/>
- **Radix UI primitive prop shape** — boolean state props,
  `asChild` slot pattern.
  <https://radix-ui.com/primitives/docs>
- **shadcn/ui** — variant prop via `class-variance-authority`.
  <https://ui.shadcn.com/docs/components/button>
- **W3C ARIA Authoring Practices** — `aria-disabled`,
  `aria-readonly`, `aria-required` naming inherits to React-shaped
  props (`disabled`, `readOnly`, `required`).
  <https://www.w3.org/WAI/ARIA/apg/>

## §T — Connected rules

- Cardinal rule 23 (concept-first API + prop reuse + token
  existence + deep-research) — `./CLAUDE.md` §23.
- Concept-first API recipe — `./AGENTS.md` §"Concept-first API
  recipe".
- Token system foundation — [`./03-token-system.md`](./03-token-system.md).
- Theme axes — [`./01-theme-axes.md`](./01-theme-axes.md).
- Consumer contract — [`./02-consumer-contract.md`](./02-consumer-contract.md).
- new-godx-design-to-component skill — Part 5 connected rules.
