# Canonical alignment against dxs-kintai-design-system

Supersedes GAPS.md. Source of truth: the `comp-*.html` files vendored in
`design-handoff/ui-system/dxs-kintai-design-system/project/preview/`,
plus the `colors_and_type.css` token file and `SKILL.md` rules.

File-path conventions in this doc:
- `K:` = canonical kintai system (`design-handoff/ui-system/dxs-kintai-design-system/project/`)
- `U:` = current `@godxjp/ui` (`libs/ts/godxjp-ui/`)

---

## A. Tokens

Tokens in `U:src/styles/theme.css` were imported verbatim from the kintai
spec, so the **token table aligns**. Only minor cleanup deltas exist.

| Token | Canonical | Current | Action |
|---|---|---|---|
| `--font-sans-jp` | K:colors_and_type.css:18-21 | U:theme.css:35 | ✅ identical |
| 3 weights (400/500/700) — `--font-weight-semibold:600` is "legacy alias" | K:colors_and_type.css:23-27 | U:theme.css:37-41 | ✅ keep, but stories must NOT use 600 (SKILL.md:16) |
| `--text-base: 0.875rem` (14px) | K:colors_and_type.css:31 | U:theme.css:45 | ✅ identical |
| `--leading-body: 1.7` | K:colors_and_type.css:42 | U:theme.css:56 | ✅ identical; verify base.css body uses it (it does at base.css:15) |
| `--heading-h1: var(--text-xl)` (20px) | K:colors_and_type.css:47 | U:theme.css:61 | ✅ identical |
| OKLCH semantic palette | K:colors_and_type.css:54-89 | U:theme.css:154-189 | ✅ identical |
| Wa-iro palette | K:colors_and_type.css:91-104 | U:theme.css:67-79 | ✅ identical |
| `--density-element: 2rem` (32px default) | K:colors_and_type.css:124 | U:theme.css:99 | ✅ identical |
| `--density-table-head: 2rem` | K:colors_and_type.css:132 | U:theme.css:107 | ✅ identical |
| `--header-height: 3rem` (48px) | K:colors_and_type.css:136 | U:theme.css:111 | ✅ identical |
| `--sidebar-width: 16rem` (256px) | K:colors_and_type.css:137 | U:theme.css:112 | ✅ identical (note: console-shell + me-shell override to 220px @ shell.css:1197, 1301 — per portal direction; OK) |
| `--radius: 0.375rem` (6px base) | K:colors_and_type.css:144 | U:theme.css:119 | ✅ identical |
| `--input-background` | K:colors_and_type.css:76 | U:theme.css:176 | ✅ identical |
| `[data-tenant="betoya"]` override | K:colors_and_type.css:176-186 | U:theme.css:218-228 | ✅ identical |
| `[data-density="compact"]` 28px | K:colors_and_type.css:189-201 | U:theme.css:230-242 | ✅ identical |
| `[data-density="comfortable"]` 44px | K:colors_and_type.css:204-216 | U:theme.css:244-256 | ✅ identical; `--brand` default + `--font-mono` correctly added at lines 261-267 |
| `--font-mono` token | not present (admin-web uses `font-family: ui-monospace, …` inline at e.g. comp-inputs.html:90) | U:theme.css:265-267 | ✅ keep — improvement over canonical |
| Per-tenant `[data-tenant="godx|kintai|tempo"]` | not present in K | U:theme.css:270-297 | ✅ keep — multi-tenant extension; SKILL.md:53 says tenants override `--primary`/`--ring`/`--foreground` only (current does exactly that) |
| `[data-theme="dark"]` | not present in K | U:theme.css:299-343 | ✅ keep — extension |

**No token migration required.** The token surface is correct.

---

## B. Per-primitive

### Buttons

Canonical reference: `K:preview/comp-buttons.html` (variants/sizes) +
`K:preview/_card.css:59-79` (the `.btn`/`.btn-*` source).

#### Status quo (canonical)

`_card.css:59-79`:

```css
.btn { height: var(--density-element); padding: 0 12px; border-radius: var(--radius-md);
       font-size: var(--text-base); font-weight: 500; gap: 6px;
       background: var(--primary); color: var(--primary-foreground); }
.btn:hover { filter: brightness(0.95); }
.btn-outline   { background: transparent; color: var(--foreground); border-color: var(--border); }
.btn-outline:hover { background: var(--accent); }
.btn-secondary { background: var(--secondary); color: var(--secondary-foreground); }
.btn-ghost     { background: transparent; color: var(--foreground); }
.btn-ghost:hover { background: var(--accent); }
.btn-destructive { background: var(--destructive); color: var(--destructive-foreground); }
.btn-sm { height: var(--density-element-sm); padding: 0 10px; font-size: var(--text-sm); }
.btn-xs { height: var(--density-element-xs); padding: 0 8px; font-size: var(--text-xs); }
.btn-lg { height: var(--density-element-lg); padding: 0 16px; }
```

Variants in HTML preview (comp-buttons.html:5-9, 13-16): `Primary | Secondary | Outline | Ghost | Destructive` and sizes `xs | sm | default | lg`.

#### Current

`U:src/components/primitives/Button.tsx`:
- variants: `primary | secondary | ghost | danger` (note: `danger`, not `destructive`)
- sizes: `sm | md | lg` (no `xs`)
- NO `outline` variant

`U:src/styles/shell.css:192-214`:

```css
.btn { … font-size: var(--text-sm); … }
.btn-primary { background: var(--primary); color: var(--primary-foreground); }
.btn-secondary { background: var(--surface-1); color: var(--foreground); border-color: var(--border); }
.btn-ghost { background: transparent; color: var(--foreground); }
.btn-danger { background: var(--destructive); color: var(--destructive-foreground); }
.btn-sm { height: var(--density-element-sm); padding: 0 var(--spacing-2); font-size: var(--text-xs); }
.btn-lg { height: var(--density-element-lg); padding: 0 var(--spacing-4); }
```

Also note shell.css:1258-1260 redeclares `.btn-primary` as black for console-shell — this is a deliberate variant override.

#### Deltas

- CSS — shell.css:192 — change `font-size: var(--text-sm)` → `font-size: var(--text-base)` (canonical uses 14px on .btn body, 13px on `.btn-sm` only).
- CSS — shell.css:192 — change `padding: 0 var(--spacing-3)` (12px) → keep (matches `0 12px`). OK.
- CSS — shell.css:200 — `.btn-secondary` background canonical is `var(--secondary)` (`oklch(96% 0.004 60)`), current is `var(--surface-1)` (`oklch(99% 0.002 60)`). Change `var(--surface-1)` → `var(--secondary)`. Border canonical = transparent (not `var(--border)`).
- CSS — add `.btn-outline { background: transparent; color: var(--foreground); border-color: var(--border); } .btn-outline:hover { background: var(--accent); }` — currently missing entirely.
- CSS — shell.css:212 — `.btn-sm` canonical padding is `0 10px`, current `0 var(--spacing-2)` (8px). Change.
- CSS — add `.btn-xs { height: var(--density-element-xs); padding: 0 8px; font-size: var(--text-xs); }` — currently missing.
- CSS — shell.css:198 — canonical hover is `filter: brightness(0.95)` (uniform); current uses `color-mix(in oklch, var(--primary) 88%, black)`. Pick canonical for uniformity OR keep current and apply to all variants. Recommend canonical: replace per-variant `:hover` with one `.btn:hover { filter: brightness(0.95); }` rule.
- TSX — Button.tsx:27 — extend `ButtonVariant` to `"primary" | "secondary" | "outline" | "ghost" | "destructive"`. Rename `danger` → `destructive` (matches canonical + matches `--destructive` token name in SKILL.md hard rule "concept-first one name per concept").
- TSX — Button.tsx:28 — extend `ButtonSize` to `"xs" | "sm" | "md" | "lg"`.
- TSX — Button.tsx:53-55 — extend size class mapping to include `xs`.
- Stories — must add `outline` + `destructive` + `xs` stories.

### Inputs (most important)

Canonical: `K:preview/comp-inputs.html` (503 lines).

#### Status quo (canonical)

Two element shapes:

1. **Bare** `.input` — `K:_card.css:82-92`:
   ```css
   .input { height: var(--density-element); padding: 0 10px; border-radius: var(--radius-md);
            border: 1px solid var(--input); background: var(--input-background);
            font-size: var(--text-base); width: 100%; outline: none; }
   .input:focus { border-color: var(--ring);
                  box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 25%, transparent); }
   ```

2. **Affixed wrap** `.input-wrap` — `K:comp-inputs.html:63-69`:
   ```css
   .input-wrap { position: relative; display: flex; align-items: stretch;
                 border: 1px solid var(--input); border-radius: 6px;
                 background: var(--input-background); overflow: hidden; height: 32px; }
   .input-wrap:focus-within { border-color: var(--ring);
                              box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 25%, transparent); }
   .input-wrap .affix { display: inline-flex; align-items: center; padding: 0 10px;
                        color: var(--muted-foreground); background: var(--secondary);
                        font-size: 13px; }
   .input-wrap .affix.pre { border-right: 1px solid var(--border); }
   .input-wrap .affix.suf { border-left: 1px solid var(--border); }
   .input-wrap input, .input-wrap select { border: 0; box-shadow: none; flex: 1;
                                            min-width: 0; background: transparent;
                                            height: 100%; padding: 0 10px; font: inherit;
                                            color: inherit; outline: none; }
   ```

Exhaustive variants in comp-inputs.html:

- **Default** (line 102-106) — `input.input` with placeholder.
- **Focus** (line 109-116) — inline `border-color: var(--ring); box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 25%, transparent)`. Pair with `info` help.
- **Error** (line 119-126) — `aria-invalid="true"` + inline `border-color: var(--destructive); box-shadow: 0 0 0 3px color-mix(in oklch, var(--destructive) 18%, transparent)`. Help row uses `.help.err`.
- **Warning non-blocking** (line 129-140) — `.input-wrap` with inline `border-color: oklch(70% 0.14 75)` + prefix `¥` + suffix `/ 時`. Help uses `.help.warn` (`color: oklch(48% 0.12 75)`).
- **Success** (line 143-153) — absolute-positioned check SVG at `right:10px; top:50%; transform:translateY(-50%)` + `padding-right:30px` on input.
- **Disabled** (line 156-163) — `disabled` attr + inline `background: var(--secondary); color: var(--muted-foreground); cursor: not-allowed`.
- **Affix tooltip on label** (line 172-181) — label `<span class="info">` with title attribute (HelpCircle SVG).
- **Optional badge + inline link** (line 184-201) — `<span class="opt">(任意)</span>` (`font-weight:400; color: var(--muted-foreground); font-size:11px`); right-side link uses `<a>` inside label.
- **Password reveal** (line 190-194) — `.pass-toggle` absolute right:6px width:24 height:24 button + Eye SVG; input has `padding-right:34px`.
- **Checklist hints** (line 196-200) — `.checklist` grid (ok/bad states).
- **Character counter** (line 203-211) — `.count` (`.count.warn`, `.count.over`); pair with `.row-help` justify-between.
- **Async validating** (line 214-221) — absolute-positioned `.spinner` (12px circle, 0.8s linear infinite). Help row: `.help.info` with smaller spinner (10px).
- **Prefix/suffix unit** (line 224-228) — `<span class="affix pre">¥</span>` / `<span class="affix suf">時間 / 日</span>`.
- **Locale tabs (Pattern 1)** (line 248-284) — `.loc-tabs` strip (height 30, border bottom 0, border-radius 6 6 0 0, background `var(--secondary)`) + dots (`.dot`, `.dot.empty`, `.dot.draft`) + `.loc-panel` (border 1px, border-radius 0 6 6 6).
- **Per-row locale (Pattern 2)** (line 287-316) — `.loc-row` grid `64px 1fr`; `.flag` block w/ `.code` font-mono + status dot.
- **Section-level locale switcher (Pattern 3)** (line 319-355) — `<select class="input" style="height:26px; width:auto; padding:0 8px; font-size:12px">` (i.e. select also reuses `.input`).

Help row patterns at comp-inputs.html:53-62:

```css
.help { font-size:11px; color: var(--muted-foreground); display:flex; align-items:center; gap:4px; line-height:1.45; }
.help.err { color: var(--destructive); }
.help.warn { color: oklch(48% 0.12 75); }
.help.ok { color: var(--success); }
.help.info { color: var(--info); }
.count { font-size:11px; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
.count.warn { color: oklch(48% 0.12 75); }
.count.over { color: var(--destructive); }
.row-help { display:flex; align-items:center; justify-content:space-between; gap:8px; }
```

Field structure (line 45-52):

```css
.field { display:flex; flex-direction:column; gap:4px; min-width:0; }
.field > label { font-size:13px; font-weight:500; display:flex; align-items:center; gap:6px; }
.field > label .opt { font-weight:400; color: var(--muted-foreground); font-size:11px; }
.field > label .req { color: var(--destructive); }
.field > label .info { color: var(--muted-foreground); cursor:help; display:inline-flex; }
.field > label .spacer { flex:1; }
.field > label a { font-size:11px; color: var(--info); text-decoration:none; font-weight:400; }
```

#### Current

`U:src/components/primitives/Input.tsx`:
- Props: `size: "small"|"default"|"large"`, `status: "default"|"error"|"warning"`, `prefix`, `suffix`, `addonBefore`, `addonAfter`.
- Emits classes: `.input`, `.input-shell`, `.input-shell-grouped`, `.input-affix`, `.input-inner`, `.input-group`, `.input-addon`, `.input-size-small`, `.input-size-large`, `.input-status-error`, `.input-status-warning`, `.textarea-with-count`, `.textarea-count`.

`U:src/styles/shell.css:216-220`:

```css
.input { display: flex; align-items: center; height: var(--density-element);
         padding: 0 var(--spacing-3); border: 1px solid var(--input);
         border-radius: var(--radius-md); background: var(--input-background);
         color: var(--foreground); font-size: var(--text-sm); width: 100%; }
.input:focus { outline: 2px solid var(--ring); outline-offset: -1px; border-color: transparent; }
textarea.input { padding: var(--spacing-2) var(--spacing-3); height: auto;
                 line-height: var(--leading-normal); resize: vertical; }
```

**Critical**: `.input-shell` / `.input-affix` / `.input-inner` / `.input-group` / `.input-addon` / `.input-shell-grouped` / `.input-size-small` / `.input-size-large` / `.input-status-error` / `.input-status-warning` / `.textarea-with-count` / `.textarea-count` — **NONE of these exist in shell.css**. Input.tsx with any prefix/suffix/addon/size/status renders fully unstyled fragments.

#### Deltas

- CSS — shell.css:216 — change `font-size: var(--text-sm)` (13px) → `font-size: var(--text-base)` (14px) per canonical. Add `outline: none` to base.
- CSS — shell.css:216 — change `padding: 0 var(--spacing-3)` (12px) → `padding: 0 10px` (canonical `_card.css:83`).
- CSS — shell.css:218 — replace `outline: 2px solid var(--ring); outline-offset: -1px; border-color: transparent` with canonical `border-color: var(--ring); box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 25%, transparent)`. The "outline" pattern is wrong — canonical never uses outline, it uses border-color + soft box-shadow ring.
- CSS — add `.input::placeholder { color: var(--muted-foreground); }` (matches `_card.css:92`).
- CSS — shell.css:220 — `textarea.input` keep `resize: vertical` but also accept the canonical `padding: 6px 10px` (see `K:comp-inputs.html:206 style="padding:6px 10px"`). Recommend keep `var(--spacing-2) var(--spacing-3)` (8px 12px) but verify against `K:UI Kit.html`.
- CSS — **Add the entire input-shell/affix/group/addon family** (currently undefined):
  ```css
  .input-shell { position: relative; display: flex; align-items: stretch;
                 height: var(--density-element); border: 1px solid var(--input);
                 border-radius: var(--radius-md); background: var(--input-background);
                 overflow: hidden; }
  .input-shell:focus-within { border-color: var(--ring);
                              box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 25%, transparent); }
  .input-shell .input-inner { flex: 1; min-width: 0; border: 0; outline: none;
                               background: transparent; height: 100%; padding: 0 10px;
                               font: inherit; color: inherit; }
  .input-shell .input-affix { display: inline-flex; align-items: center; padding: 0 10px;
                               color: var(--muted-foreground); background: var(--secondary);
                               font-size: var(--text-sm); }
  .input-shell .input-affix:first-child { border-right: 1px solid var(--border); }
  .input-shell .input-affix:last-child  { border-left:  1px solid var(--border); }
  .input-group { display: flex; align-items: stretch; }
  .input-group .input-addon { display: inline-flex; align-items: center; padding: 0 10px;
                              background: var(--secondary); color: var(--muted-foreground);
                              border: 1px solid var(--input); font-size: var(--text-sm); }
  .input-group .input-addon:first-child { border-right: 0; border-radius: var(--radius-md) 0 0 var(--radius-md); }
  .input-group .input-addon:last-child  { border-left:  0; border-radius: 0 var(--radius-md) var(--radius-md) 0; }
  .input-shell-grouped { border-radius: 0; }
  .input-shell-grouped:first-child { border-radius: var(--radius-md) 0 0 var(--radius-md); }
  .input-shell-grouped:last-child  { border-radius: 0 var(--radius-md) var(--radius-md) 0; }
  ```
- CSS — Add size variants:
  ```css
  .input-size-small  { height: var(--density-element-sm); font-size: var(--text-xs); padding: 0 8px; }
  .input-size-large  { height: var(--density-element-lg); font-size: var(--text-base); padding: 0 12px; }
  .input-shell.input-size-small  { height: var(--density-element-sm); }
  .input-shell.input-size-large  { height: var(--density-element-lg); }
  ```
- CSS — Add status variants:
  ```css
  .input-status-error,
  .input-shell.input-status-error { border-color: var(--destructive); }
  .input-status-error:focus,
  .input-shell.input-status-error:focus-within { box-shadow: 0 0 0 3px color-mix(in oklch, var(--destructive) 18%, transparent); }
  .input-status-warning,
  .input-shell.input-status-warning { border-color: oklch(70% 0.14 75); }
  .input-status-warning:focus,
  .input-shell.input-status-warning:focus-within { box-shadow: 0 0 0 3px color-mix(in oklch, oklch(70% 0.14 75) 25%, transparent); }
  ```
- CSS — Add disabled + readonly:
  ```css
  .input:disabled, .input-shell:has(:disabled),
  .input[readonly], .input-shell:has([readonly]) { background: var(--secondary); color: var(--muted-foreground); cursor: not-allowed; }
  ```
- CSS — Add textarea-with-count:
  ```css
  .textarea-with-count { position: relative; display: flex; flex-direction: column; }
  .textarea-count { align-self: flex-end; font-size: var(--text-2xs); color: var(--muted-foreground); font-variant-numeric: tabular-nums; margin-top: 2px; }
  ```
- CSS — Add help/count/field helper classes (currently only `.help { font-size: var(--text-xs); color: var(--muted-foreground); margin-top: var(--spacing-1); }` at shell.css:224 — incomplete):
  ```css
  .help { font-size: var(--text-2xs); color: var(--muted-foreground);
          display: flex; align-items: center; gap: 4px; line-height: 1.45;
          margin-top: var(--spacing-1); }
  .help-error  { color: var(--destructive); }
  .help-warning{ color: oklch(48% 0.12 75); }
  .help-success{ color: var(--success); }
  .help-info   { color: var(--info); }
  .field-count        { font-size: var(--text-2xs); color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
  .field-count-warn   { color: oklch(48% 0.12 75); }
  .field-count-over   { color: var(--destructive); }
  .field-row-help     { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  ```
  (Renaming canonical `.help.err`/`.help.warn`/`.help.ok`/`.help.info` to BEM-style `.help-error` etc. matches the rest of the codebase's `badge-error`/`badge-warning` convention. **Or** keep canonical `.help.err` form — pick one and document.)
- CSS — Add `.input::placeholder { color: var(--muted-foreground); }`.
- TSX — Input.tsx:38-42 — current `InputSize` is `"small"|"default"|"large"`. Canonical uses xs/sm/default/lg via `--density-element-xs` (24px) and `--density-element-xl` (44px). Recommend extending to `"xs"|"small"|"default"|"large"|"xlarge"` to expose all 5 density steps OR keep current 3 and document. **Action**: keep current 3 (matches Ant Design convention) but document the mapping.
- TSX — Input.tsx — add a `Password` sub-component or pass-through for `<input type="password">` with reveal toggle (canonical pattern at `K:comp-inputs.html:184-201`). Implementation: a new `<InputPassword>` that renders `<Input type={revealed ? "text" : "password"} suffix={<EyeButton/>} />`. Currently consumers must hand-roll it.
- TSX — Input.tsx — add a `Search` sub-component or a `type="search"` short-hand that renders prefix=SearchIcon. Canonical comp-pageheader.html shows search inputs as bare `.input` — no special class needed, but a story should pin the pattern.
- TSX — `Textarea` (Input.tsx:148-213) — current `resize` default is `"none"` (line 153). Canonical comp-inputs.html:206 uses `resize:none` explicitly, but textarea cells (`.loc-row` at line 296,300,304) use `resize:vertical`. Default of `"none"` is correct per Ant; document the override in stories.
- Locale-tabs / locale-row / locale-panel — these are **composite patterns**, not a single primitive. Section C below covers them as new primitives.

### Tabs

Canonical: `K:preview/comp-tabs.html`.

#### Status quo (canonical)

Two variants:

1. **Underline tabs** (line 4-9):
   ```html
   <div style="display:flex; border-bottom: 1px solid var(--border); gap: 4px">
     <div style="padding:8px 12px; font-size:13px; font-weight:500;
                 border-bottom:2px solid var(--primary); color: var(--foreground); margin-bottom:-1px">…</div>
     <div style="padding:8px 12px; font-size:13px; color: var(--muted-foreground)">…</div>
   </div>
   ```

2. **Pills / Segmented** (line 10-15):
   ```html
   <div style="display:flex; gap:4px; background: var(--secondary);
               padding:3px; border-radius:6px; width: fit-content">
     <div style="padding:4px 10px; font-size:12px; background: var(--background);
                 border-radius:4px; font-weight:500; box-shadow: var(--shadow-sm)">日</div>
     <div style="padding:4px 10px; font-size:12px; color: var(--muted-foreground)">週</div>
   </div>
   ```

Also `K:comp-pageheader.html:21-24` shows a third **bordered segment**:
```css
.seg { display:inline-flex; border:1px solid var(--border); border-radius:4px; overflow:hidden; height:28px; }
.seg button { border:0; background:transparent; padding:0 10px; font-size:12px; color: var(--muted-foreground); }
.seg button.on { background: var(--secondary); color: var(--foreground); font-weight:500; }
.seg button + button { border-left:1px solid var(--border); }
```

And `K:comp-inputs.html:78-86` shows i18n-locale tab strip:
```css
.loc-tabs { display:flex; align-items:center; border:1px solid var(--border);
            border-radius: 6px 6px 0 0; border-bottom:0; padding:0 4px;
            height:30px; background: var(--secondary); }
.loc-tabs button { border:0; background: transparent; height:100%; padding:0 10px;
                   font-size:12px; color: var(--muted-foreground); border-bottom: 2px solid transparent; margin-bottom:-1px; }
.loc-tabs button.on { color: var(--foreground); font-weight:500; border-bottom-color: var(--primary); background: var(--background); }
```

#### Current

`U:src/components/primitives/Tabs.tsx` — Radix-backed, ONE visual variant.
`U:src/styles/shell.css:272-278`:

```css
.tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); align-items: center; }
.tab  { display: inline-flex; align-items: center; gap: var(--spacing-1);
        padding: var(--spacing-2) var(--spacing-3); font-size: var(--text-sm);
        color: var(--muted-foreground); border-bottom: 2px solid transparent;
        margin-bottom: -1px; cursor: pointer; user-select: none; white-space: nowrap; }
.tab:hover { color: var(--foreground); }
.tab[data-active="true"] { color: var(--foreground); font-weight: 500; border-bottom-color: var(--primary); }
```

But Tabs.tsx:40 sets `data-active={undefined}` — explicitly overrides what should be Radix's `data-state="active"`. This BREAKS the active styling: shell.css:278 expects `data-active="true"` but Radix emits `data-state="active"`.

#### Deltas

- TSX — Tabs.tsx:40 — **bug fix**: remove the line `data-active={undefined}`. Radix already sets `data-state="active"` on the active trigger; the override clears nothing and disables the active style. Replace shell.css:278 selector with `.tab[data-state="active"]` OR keep `.tab[data-active="true"]` and have Tabs.tsx forward `data-active={active ? "true" : "false"}` via Radix's render-prop or a hook. Simplest: change shell.css:278 selector to `.tab[data-state="active"]`.
- CSS — shell.css:272 — `gap: 0` matches canonical (canonical comp-tabs.html line 4 uses `gap:4px` but that's the design preview's small horizontal padding inside the strip). The padding on each `.tab` already covers visual spacing. Keep `gap: 0`.
- CSS — shell.css:274 — `padding: var(--spacing-2) var(--spacing-3)` → matches `8px 12px`. ✅
- TSX — Add `TabsList` variant prop. Define new `variant: "line" | "pills" | "segment"`. Currently only line exists.
- CSS — Add `.tabs-pills` + `.tabs-segment` variants:
  ```css
  .tabs-pills { display: flex; gap: 4px; background: var(--secondary);
                padding: 3px; border-radius: var(--radius-md);
                width: fit-content; border: 0; }
  .tabs-pills .tab { padding: 4px 10px; font-size: var(--text-xs); border-radius: var(--radius-sm); border-bottom: 0; margin-bottom: 0; }
  .tabs-pills .tab[data-state="active"] { background: var(--background); box-shadow: var(--shadow-sm); border-bottom: 0; }

  .tabs-segment { display: inline-flex; border: 1px solid var(--border); border-radius: 4px; overflow: hidden; height: var(--density-element-sm); }
  .tabs-segment .tab { padding: 0 10px; font-size: var(--text-xs); border-bottom: 0; margin-bottom: 0; height: 100%; }
  .tabs-segment .tab + .tab { border-left: 1px solid var(--border); }
  .tabs-segment .tab[data-state="active"] { background: var(--secondary); color: var(--foreground); font-weight: 500; border-bottom: 0; }
  ```
- TSX — Pass `variant` to TabsList: `<TabsList variant="pills">`. Add classname based on variant.
- Stories — Tabs.stories.tsx must demo line (default), pills, segment, with badges (count chip in tab — see `K:comp-tabs.html:7` and `K:comp-sidebar.html:47`), vertical orientation already present per existing story.

### Badges

Canonical: `K:preview/comp-badges.html` + `K:_card.css:42-56`.

#### Status quo (canonical)

`_card.css:42-56`:

```css
.chip { display: inline-flex; align-items: center; gap: 4px;
        padding: 2px 8px; border-radius: var(--radius);
        font-size: var(--text-xs); font-weight: 500;
        background: var(--muted); color: var(--muted-foreground);
        border: 1px solid var(--border); height: 22px; }
.chip-primary    { background: var(--primary); color: var(--primary-foreground); border-color: transparent; }
.chip-success    { background: var(--success); color: var(--success-foreground); border-color: transparent; }
.chip-warning    { background: var(--warning); color: var(--warning-foreground); border-color: transparent; }
.chip-info       { background: var(--info); color: var(--info-foreground); border-color: transparent; }
.chip-destructive{ background: var(--destructive); color: var(--destructive-foreground); border-color: transparent; }
.chip-attention  { background: var(--attention); color: var(--attention-foreground); border-color: transparent; }
.chip-outline    { background: transparent; }
```

Canonical badges are **SOLID** filled + small (height 22px, radius 6px). Same primitive renders absence types, approval states, sidebar count badges (with height override 16px — `K:comp-sidebar.html:47`).

There's a separate `.chip-soft` mentioned in SKILL.md:42:
> Status badges → `chip-soft` (translucent tint) for transient state; solid `chip primary/success/...` for terminal state.

`.chip-soft` is referenced (line 49) but the rule is NOT defined in `_card.css` — implied as solid background with `color-mix(..., 15%, transparent)` per SKILL.md:25.

#### Current

`U:src/components/primitives/Badge.tsx` exports `Badge` with `variant: success|warning|info|error|attention|neutral|outline` + always-on dot.

`U:src/styles/shell.css:226-256`:

```css
.badge { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px;
         border-radius: var(--radius-full); font-size: var(--text-2xs); font-weight: 500;
         line-height: 1.5; border: 1px solid transparent; }
.badge .dot { width: 6px; height: 6px; border-radius: 99px; }
.badge-success { background: color-mix(in oklch, var(--success) 14%, transparent);
                 color: color-mix(in oklch, var(--success) 80%, var(--foreground)); }
…
.badge-neutral { background: var(--surface-3); color: var(--muted-foreground); }
.badge-outline { background: transparent; border-color: var(--border); color: var(--muted-foreground); }
```

And `U:src/styles/shell.css:256`:
```css
.chip { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px;
        background: var(--surface-3); color: var(--foreground);
        border-radius: var(--radius-md); font-size: var(--text-xs); }
```

**Critical**:
- Current `.badge` is TRANSLUCENT/SOFT (color-mix with transparent), small (11px), pill-shaped (radius-full).
- Canonical `.chip` is SOLID (full saturated background, white text), small (12px), rounded-md (radius 6px), 22px height.

Different semantic intent: canonical uses solid chips by default (e.g. "承認" approved, "却下" rejected, "遅刻" lateness). The current `.badge` IS the `.chip-soft` SKILL.md:42 mentions.

Canonical has NO concept of an always-present dot. Current always renders `<span class="dot" />` (Badge.tsx:48-50).

`.chip` in shell.css:256 exists but is a neutral grey container — doesn't have the role variants the canonical has.

#### Deltas

- CSS — shell.css:256 — refactor `.chip` to match canonical `_card.css:42` exactly. Add ALL role variants (`.chip-primary`, `.chip-success`, `.chip-warning`, `.chip-info`, `.chip-destructive`, `.chip-attention`, `.chip-outline`).
  ```css
  .chip { display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 8px; border-radius: var(--radius);
          font-size: var(--text-xs); font-weight: 500;
          background: var(--muted); color: var(--muted-foreground);
          border: 1px solid var(--border); height: 22px; line-height: 1; }
  .chip-primary    { background: var(--primary);     color: var(--primary-foreground);     border-color: transparent; }
  .chip-success    { background: var(--success);     color: var(--success-foreground);     border-color: transparent; }
  .chip-warning    { background: var(--warning);     color: var(--warning-foreground);     border-color: transparent; }
  .chip-info       { background: var(--info);        color: var(--info-foreground);        border-color: transparent; }
  .chip-destructive{ background: var(--destructive); color: var(--destructive-foreground); border-color: transparent; }
  .chip-attention  { background: var(--attention);   color: var(--attention-foreground);   border-color: transparent; }
  .chip-outline    { background: transparent; }
  ```
- CSS — Define `.chip-soft` family (per SKILL.md:42). Use color-mix translucent tint:
  ```css
  .chip-soft.chip-primary    { background: color-mix(in oklch, var(--primary) 15%, transparent);     color: var(--primary);     border-color: transparent; }
  .chip-soft.chip-success    { background: color-mix(in oklch, var(--success) 15%, transparent);     color: color-mix(in oklch, var(--success) 80%, var(--foreground));     border-color: transparent; }
  /* … same for warning / info / destructive / attention */
  ```
- TSX — Badge.tsx — keep existing `Badge` but RENAME the visual class from `.badge` to `.chip-soft .chip-<role>` to match the canonical model (soft tints are the transient state per SKILL.md). Alternatively: rename component `Badge` → `Chip` and add a `solid: boolean` prop (default `false` = soft, `true` = solid like the canonical). **Recommend the latter**: rename to `Chip` + `solid` prop; provide a deprecation `export { Chip as Badge }` so consumers don't break.
- TSX — Badge.tsx:48 — remove default-on dot. Canonical badges almost never carry a dot; the dot is its own primitive (`.dot` standalone, see shell.css:390). Make `dot` default `false`. The Activity-icon dot pattern is separate (see shell.css:1397-1401 for `activity-icon`).
- CSS — drop or merge `.badge-*` classes into `.chip-soft.chip-*` to avoid two competing systems. Migration: replace all `.badge` selectors in shell.css:226-254 with `.chip-soft` + role.
- TSX — Add a height override variant for table/sidebar (canonical uses inline `height:18px; font-size:10px; padding:0 6px` at `K:comp-table.html:9,11` and `K:comp-sidebar.html:47`). Add a `size: "xs" | "sm" | "default"` prop:
  ```css
  .chip-size-xs { height: 16px; font-size: var(--text-2xs); padding: 0 5px; }
  .chip-size-sm { height: 18px; font-size: var(--text-2xs); padding: 0 6px; }
  ```
- Stories — Badge.stories.tsx must demo: solid chip (default), soft chip, every role × both variants, size xs/sm/default, with badge inside Tab/Sidebar nav-item/Table cell.

### Card

Canonical: `K:preview/comp-card.html` + `K:_card.css:94-99`.

#### Status quo (canonical)

`_card.css:94-99`:

```css
.card { background: var(--card); color: var(--card-foreground);
        border: 1px solid var(--border); border-radius: var(--radius-lg);
        padding: var(--density-card); }
```

SKILL.md:31: "Cards: 1px border, no shadow at rest. Shadows climb only at popover (`--shadow-md`) and dialog (`--shadow-xl`)."

Canonical card content uses `font-weight:500` (`comp-card.html:6`) for title and `font-size:24px; font-weight:600` for the stat value (`comp-card.html:9`). The 24px stat uses `font-weight:600`, which is FORBIDDEN by SKILL.md:16 (3-weights rule). This is a minor canonical inconsistency — should be `font-weight: 500` per the rule.

#### Current

`U:src/components/primitives/Card.tsx` + shell.css:166-190.

```css
.card { background: var(--card); border: 1px solid var(--border);
        border-radius: var(--radius-lg); padding: var(--density-card); }
.card-hoverable:hover { border-color: var(--muted-foreground); box-shadow: var(--shadow-sm); }
```

#### Deltas

- ✅ Base `.card` matches canonical.
- TSX — Card.tsx already exposes `size`, `variant: "outlined"|"filled"|"borderless"`, `hoverable`, `title`, `subtitle`, `extra`, `actions`. ✅ Sufficient.
- CSS — shell.css:174 — `.card-title { font-size: var(--text-base); font-weight: 500 }`. Canonical comp-card.html:6 uses `font-size:14px; font-weight:500` ✅.
- CSS — no canonical `.card-hoverable` exists; current adds shadow-sm on hover. Per SKILL.md:31 "no shadow at rest" — hover shadow OK; keep as is.
- Stat displays inside cards — canonical uses `font-size: 24px; font-weight: 600` (forbidden by SKILL). Use `Statistic` primitive (U:src/components/primitives/Statistic.tsx) and force weight 500 in shell.css:1146 (currently `font-weight: 600`). **Fix**: shell.css:1146 — change `.statistic-value { … font-weight: 600 }` → `font-weight: 500`. Same line 1281 (`.stat-value`) — change `font-weight: 500` ✅ already correct.

### Calendar

Canonical: `K:preview/comp-calendar.html` — three views: Month grid, Week timeline, Day staff×time grid.

#### Status quo (canonical)

Defined shift palette + grid (`comp-calendar.html:4-73`). Heavily-styled; uses tokens for `var(--primary)`/`var(--info)`/`var(--success)`/`var(--attention)` etc. Custom shift classes `.sh-early`, `.sh-late`, `.sh-night`, `.sh-tsushi`, `.sh-ot`, `.sh-leave`, `.sh-holid`. Month grid is `.m-grid` (7-col), week timeline is `.tl-wrap`/`.tl-head`/`.tl-body`/`.tl-day`/`.tl-event` (hours rail 48px + 7 day cols, 36px/hour). Toolbar `.cal-bar` (nav buttons, month label, segmented view switch, add-shift CTA).

#### Current

`U:src/components/primitives/Calendar.tsx` — `react-day-picker v9` wrapper. Only does **month picker**, NOT month/week/day shift views.

#### Deltas

The dxs-kintai Calendar is **NOT a single primitive**. It's a composite "ShiftCalendar" surface that should live as a NEW primitive set (Section C). The day-picker `Calendar.tsx` stays as-is for date-picker use cases.

### PageHeader

Canonical: `K:preview/comp-pageheader.html` (3 variants: Compact / Overflow / Stacked) + `K:admin-web/.../page-header.tsx`.

#### Status quo (canonical)

```css
.ph        { border: 1px solid var(--border); border-radius:6px; overflow:hidden; background: var(--background); }
.ph-bar    { display: flex; align-items: center; gap: 12px; height: 48px; padding: 0 16px; border-bottom: 1px solid var(--border); }
.ph-title  { display: flex; align-items: baseline; gap: 8px; min-width: 0; flex: 1; }
.ph-title h1 { font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ph-title .sub { font-size: 11px; color: var(--muted-foreground); white-space: nowrap; flex-shrink: 0; }
.ph-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.ph-actions .btn, .ph-actions .input, .ph-actions .icon-btn { white-space: nowrap; flex-shrink: 0; }
.ph-body   { padding: 14px 16px; font-size: 11px; color: var(--muted-foreground); }
.icon-btn  { width: 28px; height: 28px; border-radius: 4px; border: 1px solid var(--border);
             background: var(--background); display: inline-flex; align-items: center; justify-content: center; font-size: 14px; }
.icon-btn.ghost { border-color: transparent; background: transparent; color: var(--muted-foreground); }
.ph-tabs   { display: flex; gap: 18px; padding: 0 16px; height: 36px; align-items: center; border-bottom: 1px solid var(--border); font-size: 13px; }
.ph-tabs a.on { color: var(--foreground); border-bottom-color: var(--primary); font-weight: 500; }
```

Canonical h1 weight is 600 — again contradicts SKILL.md:16. **Use 500** per the rule.

admin-web `page-header.tsx` uses Tailwind utilities — `h-12` (48px), `border-b`, `px-4`, `gap-1.5` for actions, `text-lg font-semibold` for h1.

#### Current

`U:src/styles/shell.css:158-164` (`.page-header` / `.page-title` / `.page-actions`) — exists but doesn't match the canonical surface model. Current renders inline without the `.ph` wrapper card frame.
`U:src/styles/shell.css:1123-1142` (`.page-content-*`) — variant for PageContent.

There's NO `<PageHeader>` primitive in `U:src/components/primitives/`.

#### Deltas

- TSX — Add new primitive `PageHeader.tsx` at `U:src/components/primitives/PageHeader.tsx`:
  ```tsx
  export interface PageHeaderProps {
    title: ReactNode;
    subtitle?: ReactNode;
    backHref?: string;
    actions?: ReactNode;
    tabs?: ReactNode;       // ph-tabs row
    body?: ReactNode;       // optional ph-body footer/help row
    variant?: "compact" | "stacked";
    className?: string;
  }
  ```
- CSS — Add `.ph`, `.ph-bar`, `.ph-title`, `.ph-actions`, `.ph-body`, `.ph-tabs`, `.icon-btn`, `.icon-btn.ghost` (canonical names). Use shell.css line 158-164 as starting point but rewrite.
- CSS — `.ph-title h1 { font-size: var(--text-md); font-weight: 500 }` (16px / 500 — drop the canonical 600 per SKILL.md:16).

### Punchcard

Canonical: `K:preview/comp-punchcard.html` — state-machine UI (Off → Working ⇄ Break → Closed).

#### Status quo (canonical)

Each state = `<div class="card">` with `.label`, `<span class="chip [variant]">`, body text, then state-specific buttons (Check In / Break / Check Out / Return). State 3 (Break) tints card: `background: color-mix(in oklch, var(--warning) 6%, var(--card))`. Forbidden buttons hidden — never disabled-and-shown (line 70).

#### Current

NO equivalent in `U:`. This is a me-service domain pattern.

#### Deltas

Punchcard is **service-specific** (a kintai-only surface) — per CLAUDE.md rule 19 "No service-specific anything", the punchcard does NOT belong in `@godxjp/ui` as a named primitive. Instead, ensure the building blocks are present: Card, Chip, Button (xs/sm sizes), label classes. The me-service / kintai-service composes its own `<Punchcard>` from `@godxjp/ui` atoms. **Action**: no new primitive in `@godxjp/ui`; verify all atoms exist (they do once §B Buttons/Chips are aligned). Document the composition pattern in the kintai service docs, NOT in `@godxjp/ui`.

### Sidebar

Canonical: `K:preview/comp-sidebar.html` (240px width, 32px row height, 16px lucide icons stroke=2).

#### Status quo (canonical)

```css
.sb-icon { width: 16px; height: 16px; flex-shrink: 0; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.sb-chev { width: 14px; height: 14px; … }
.sb-row  { display: flex; align-items: center; gap: 8px; height: 32px; padding: 0 8px; border-radius: 4px; color: var(--muted-foreground); }
.sb-row.on { background: var(--accent); color: var(--foreground); font-weight: 500; }
.sb-section { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--muted-foreground); padding: 8px 8px 4px; height: 24px; text-transform: uppercase; letter-spacing: 0.04em; }
```

Width: 240px (`comp-sidebar.html:15`). Note: SKILL.md:30 says "Sidebar 256px (`--sidebar-width`)". The HTML preview uses 240; the token uses 256. Token wins.

Brand row top: 48px, tenant switcher button with logo mark + chevrons-up-down.

#### Current

`U:src/styles/shell.css:21-69` — `.app-sidebar`, `.sb-product`, `.sb-logo-mark`, `.sb-section`, `.sb-nav-item` etc.

`.sb-nav-item` height: `var(--density-element-sm)` = 28px. Canonical: 32px.
`.sb-section` padding: `var(--spacing-3) var(--spacing-2)` = 12px 8px. Canonical: `8px 8px 4px`.
`.sb-section-label` is uppercase 11px ✅.

`.sb-nav-item` active background: `var(--sidebar-active-bg)` which = `oklch(95% 0.02 240)` (theme.css:196). Canonical: `var(--accent)` = `oklch(93% 0.005 60)`. Different tint.

#### Deltas

- CSS — shell.css:45 — change `.sb-nav-item` height from `var(--density-element-sm)` (28px) → `2rem` (32px) to match canonical.
- CSS — shell.css:45 — keep `padding: 0 var(--spacing-2)` (8px) ✅.
- CSS — shell.css:45 — change `border-radius: var(--radius-md)` (4px) ✅ matches canonical.
- CSS — Consider `.sb-nav-item[data-active="true"]` — canonical uses `--accent` (a token); current uses `--sidebar-active-bg` (a sidebar-specific token). Either is fine architecturally; keep current as it allows per-tenant tinting.
- CSS — shell.css:37 — `.sb-section` padding canonical is `8px 8px 4px`. Current is `var(--spacing-3) var(--spacing-2)` = 12px 8px. Change to `var(--spacing-2) var(--spacing-2) var(--spacing-1)`.
- CSS — Add `.sb-icon` rule formalising stroke style:
  ```css
  .sb-icon, .sb-chev { stroke: currentColor; fill: none; stroke-width: 2;
                       stroke-linecap: round; stroke-linejoin: round; }
  .sb-icon { width: 16px; height: 16px; }
  .sb-chev { width: 14px; height: 14px; }
  ```
- TSX — No new primitive needed; current Sidebar composition (AppShell) is correct shape. Make sure consumers pass `lucide-react` icons with `strokeWidth={2}` (SKILL.md:46).

### Table

Canonical: `K:preview/comp-table.html` — compact density. Header row 32px (`<tr style="height:32px">`), body row 34px, font-size 12px header, 13px body.

#### Status quo (canonical)

```html
<table style="border-collapse:collapse; font-size: 13px">
  <thead><tr style="background: var(--secondary); border-bottom: 1px solid var(--border);
                    height: 32px; text-align: left; color: var(--muted-foreground); font-size: 12px; font-weight: 500">
    <th style="padding: 0 10px">…</th>
  </tr></thead>
  <tbody><tr style="border-bottom: 1px solid var(--border); height: 34px">
    <td style="padding: 0 10px">…</td>
  </tr></tbody>
</table>
```

SKILL.md:32: "Tables: 32px header row, 36px body row at default density; 28/32 at compact."
Canonical HTML uses 32/34 (close to "compact 28/32" but not exactly) — design preview is compact-leaning. Production should be 32/36 default, 28/32 compact.

#### Current

`U:src/styles/shell.css:258-270`:

```css
.table thead th { background: var(--surface-2); padding: 0 var(--spacing-3); height: var(--density-table-head);
                  font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); }
.table tbody td { padding: var(--spacing-2) var(--spacing-3); border-bottom: 1px solid var(--border); }
.table tbody tr:hover td { background: var(--surface-2); }
```

`--density-table-head` = `2rem` (32px) ✅.
Body row height is implicit (padding-driven, not height-driven). With `padding: var(--spacing-2) var(--spacing-3)` (8px 12px) + 14px text * 1.5 line-height = ~33px. Close to 36px target but not exact.

#### Deltas

- CSS — shell.css:260 — change `background: var(--surface-2)` → `var(--secondary)` (matches canonical comp-table.html which uses `var(--secondary)`; current uses `--surface-2` which resolves to `oklch(97% 0.003 60)` — almost the same in light mode but `--secondary` is the canonical name).
- CSS — shell.css:262 — explicit body row height: add `.table tbody td { height: var(--density-element-lg); }` (36px) per SKILL.md:32. Or wrap as `--density-table-body: 2.25rem` token (add to theme.css alongside `--density-table-head`).
- CSS — shell.css:262 — keep `padding: var(--spacing-2) var(--spacing-3)` (8px 12px) — close to canonical `0 10px` but with vertical breathing.
- Add `[data-density="compact"]` table overrides:
  ```css
  [data-density="compact"] .table thead th { height: var(--density-table-head); /* already 28px via density override */ }
  [data-density="compact"] .table tbody td { height: var(--density-element); /* 32px */ }
  ```
- TSX — Table.tsx exposes `containerClassName` for `.table-scroll` — good. No change.

### TopBar

Canonical: `K:preview/comp-topbar.html` — 48px height, padding 0 12px, contains: menu toggle + brand + context switcher + quick actions + ml-auto user cluster.

#### Status quo (canonical)

```html
<header style="display:flex; align-items:center; height:48px; padding:0 12px; border-bottom: 1px solid var(--border); font-size:13px">
  <button>≡</button>
  <div style="width:1px; height:16px; background: var(--border); margin: 0 8px"></div>
  <span style="font-weight:500">dxs-kintai</span>
  <div style="margin-left:16px; display:flex; align-items:center; gap:8px">…brand actions…</div>
  <div style="margin-left:auto; display:flex; align-items:center; gap:2px">
    <button>🌐</button><button>☀</button>
    <div style="width:1px; height:16px; background: var(--border); margin: 0 4px"></div>
    <div style="display:flex; align-items:center; gap:6px; padding:4px 8px; border-radius:4px">
      <div class="avatar">YS</div>
      <div style="display:flex; flex-direction:column; line-height:1.1">…name + email…</div>
    </div>
  </div>
</header>
```

#### Current

`U:src/styles/shell.css:23` — `.app-topbar` matches structure (48px via `--header-height`, padding 0 16px, gap 12px).
`U:src/styles/shell.css:1083-1091` — `.app-topbar-rail`/`-logo`/`-left`/`-spacer`/`-right` give the slot structure.

Mostly aligned. Console variant override at shell.css:1226 sets height 56px and padding 24px — deliberate portal-specific override.

#### Deltas

- CSS — shell.css:23 — change `padding: 0 var(--spacing-4)` (16px) → `0 var(--spacing-3)` (12px) to match canonical exactly. (Optional — 16px is a SmartHR-ish convention; canonical is 12px.)
- ✅ Otherwise aligned. Stories for Topbar should verify the structure mirrors the canonical HTML.

---

## C. New primitives required

| Name | Source | Suggested path | Shape sketch |
|---|---|---|---|
| `PageHeader` | `K:comp-pageheader.html` + `K:admin-web/.../page-header.tsx` | `U:src/components/primitives/PageHeader.tsx` | Props: `title`, `subtitle`, `backHref`, `actions`, `tabs`, `body`, `variant: "compact"|"overflow"|"stacked"`. Class root `.ph`, internal `.ph-bar`/`.ph-title`/`.ph-actions`/`.ph-tabs`/`.ph-body`. |
| `IconButton` | `K:comp-pageheader.html:14-17` | `U:src/components/primitives/IconButton.tsx` | 28×28 square, radius-sm, optional `variant: "outline" | "ghost"`. Class `.icon-btn`/`.icon-btn.ghost`. |
| `SegmentedControl` | `K:comp-pageheader.html:21-24` + `K:comp-calendar.html:63-66` | `U:src/components/primitives/SegmentedControl.tsx` | Already a `Tabs variant="segment"` candidate — alternatively a standalone `<SegmentedControl options={[…]} value … onValueChange />` for non-tab usage (e.g. day/week/month view switch in calendar toolbar). |
| `InputPassword` | `K:comp-inputs.html:184-201` | `U:src/components/primitives/Input.tsx` (sub-export) | Wraps `<Input type="password" suffix={<EyeButton/>} />` with `revealed` state. Pass-through of all `InputProps`. |
| `InputSearch` | `K:comp-pageheader.html:39` + `K:comp-topbar.html search` | `U:src/components/primitives/Input.tsx` (sub-export) | Wraps `<Input type="search" prefix={<Search/>} />`. |
| `FieldHelp` / `FieldCount` / `FieldRowHelp` | `K:comp-inputs.html:53-62` | `U:src/components/primitives/Field.tsx` | Small primitives wrapping `.help`, `.help.err/warn/ok/info`, `.field-count`, `.field-row-help`. Consumers use them under labels in form fields. |
| `LocaleTabs` (i18n field switcher) | `K:comp-inputs.html:248-284` | `U:src/components/primitives/LocaleTabs.tsx` | Tab strip with status dots per locale (済/下書き/未翻訳). Props: `locales: Array<{code, label, status: "translated"|"draft"|"missing"}>`, `value`, `onValueChange`, optional `meta` (e.g. "3 / 4 翻訳済"), `onAdd` button. |
| `LocaleRow` | `K:comp-inputs.html:287-316` | composite within `LocaleTabs.tsx` | Grid `64px 1fr` row for per-locale display (flag + status dot + input/textarea). |
| `LocaleSwitcher` (section-level) | `K:comp-inputs.html:319-355` | `U:src/components/primitives/LocaleTabs.tsx` (variant) | Header `.label` + `<Select>` editing-language + "show base value" checkbox. Renders children unchanged. |
| `Checklist` (password-strength etc.) | `K:comp-inputs.html:73-76, 196-200` | `U:src/components/primitives/Checklist.tsx` | `<Checklist items={[{ok: true, label: "8文字以上"}, …]} />`. Class `.checklist` + `.checklist li.ok` / `.checklist li.bad`. |
| `Spinner` (small inline) | `K:comp-inputs.html:70-71` | `U:src/components/primitives/Spinner.tsx` | 12px circular spinner using `border` + `animation: spin 0.8s linear infinite`. Size prop `sm` (10px) / `md` (12px) / `lg` (16px). |
| `CalendarToolbar` + `ShiftMonth` + `ShiftTimeline` + `ShiftDay` | `K:comp-calendar.html` | NOT a single primitive — composite living in the kintai service | These are service-specific by CLAUDE.md rule 19. Confirm with user before adding to `@godxjp/ui`. If approved as generic, scaffold `U:src/components/shell/Calendar/*` under `shell` (NOT `primitives`). |

---

## D. Storybook story plan

Per primitive, the matching `U:src/stories/<Name>.stories.tsx` file must be
updated alongside the source change in the SAME PR (cardinal rule 1).

| Story file | Required changes |
|---|---|
| `Button.stories.tsx` | Add `outline` variant stories. Add `xs` size stories. Rename `danger` references → `destructive`. Add hover-state screenshot (filter brightness). |
| `Input.stories.tsx` | Already covers most variants. Add: prefix/suffix/addon stories with `.input-shell` now that CSS exists. Add `status="warning"`. Add `<InputPassword>` reveal demo. Add `<InputSearch>` demo. Add `<Textarea showCount maxLength={200}>` demo. Add disabled / readonly stories. Add async-validating spinner pattern. Add character-counter (count.warn at >80%, count.over at >100%). |
| `Tabs.stories.tsx` | Add `variant="pills"` and `variant="segment"` stories. Add tab-with-badge (count chip) story. Confirm `data-state="active"` styling renders after the bug fix. |
| `Badge.stories.tsx` | Rewrite to render `<Chip>` (or `<Badge>` aliased). Stories cover: solid 7 roles, soft 7 roles, size xs/sm/default, with-icon, without-dot (the new default), in-table-row, in-sidebar-nav-item. |
| `Card.stories.tsx` | Tighten — keep existing. Add a `with Statistic` story to verify weight 500 (not 600) on the stat. |
| `Table.stories.tsx` | Verify header bg = `var(--secondary)`. Add `[data-density="compact"]` wrapper story. Add a story where each row has a chip cell. |
| `Topbar.stories.tsx` | Verify menu trigger + brand + actions + user-cluster + locale toggle layout matches `K:comp-topbar.html`. |
| `Sidebar.stories.tsx` | Verify 240px (or 256px token) width, 32px nav row height, `.sb-icon`/`.sb-chev` icon stroke. Add collapsed-state story. |
| `PageContent.stories.tsx` | Keep — already comprehensive. |
| New: `PageHeader.stories.tsx` | Three variants (Compact / Overflow / Stacked) matching `K:comp-pageheader.html` exactly. |
| New: `IconButton.stories.tsx` | Outline + ghost variants. With icon, no label. |
| New: `SegmentedControl.stories.tsx` | Match the day/week/month switch in `K:comp-calendar.html`. |
| New: `LocaleTabs.stories.tsx` | All 3 i18n patterns from comp-inputs.html C-section. |
| New: `Checklist.stories.tsx` | Password-strength + general yes/no checklist. |
| New: `Spinner.stories.tsx` | 3 sizes, inline in field, inline in button. |
| `Calendar.stories.tsx` | Keep day-picker stories. Note in description that shift-calendar surfaces live in the kintai service, NOT in `@godxjp/ui`. |

---

## E. Implementation order

Atoms first, composites later. Each step gates the next via Playwright
screenshots of the matching `comp-*.html` rendered side-by-side with the
Storybook story.

| # | File(s) | Diff size | Verification |
|---|---|---|---|
| 1 | `U:src/styles/theme.css` | small (no migration needed — token surface already aligned) | None — sanity diff against `K:colors_and_type.css`. |
| 2 | `U:src/styles/shell.css` `.btn` family | small | Storybook → Button stories side-by-side with `K:comp-buttons.html`. |
| 3 | `U:src/components/primitives/Button.tsx` | small (variant rename + xs size + outline) | All Button stories pass. Consumer migration `danger` → `destructive` (search-replace). |
| 4 | `U:src/styles/shell.css` `.input` + add `.input-shell` family | medium | Render every variant in Input.stories.tsx; visually diff against `K:comp-inputs.html` panels A/B. |
| 5 | `U:src/styles/shell.css` `.chip` + variants + soft family; reroute `.badge-*` → `.chip-soft *` | medium | Badge.stories.tsx + Table.stories.tsx + Sidebar.stories.tsx (in-row badge). Side-by-side `K:comp-badges.html`. |
| 6 | `U:src/components/primitives/Badge.tsx` → optional rename to `Chip`, add `solid`+`size` | small | Re-export `Badge` for back-compat. Verify consumer compiles. |
| 7 | `U:src/styles/shell.css` `.tabs`/`.tab` + add `.tabs-pills`/`.tabs-segment`; fix `.tab[data-state="active"]` | small | Tabs.stories.tsx — pills + segment new stories. Side-by-side `K:comp-tabs.html`. |
| 8 | `U:src/components/primitives/Tabs.tsx` — remove `data-active={undefined}` bug; add `variant` prop on `TabsList` | small | Active tab now visually styles correctly. |
| 9 | `U:src/styles/shell.css` `.table` + `--density-table-body` | small | Table.stories.tsx — default + compact density variants. Side-by-side `K:comp-table.html`. |
| 10 | `U:src/styles/shell.css` `.sb-nav-item` height 32px; `.sb-section` padding; `.sb-icon`/`.sb-chev` stroke | small | Sidebar.stories.tsx + AppShell.stories.tsx. Side-by-side `K:comp-sidebar.html`. |
| 11 | NEW `U:src/components/primitives/IconButton.tsx` + `.icon-btn`/`.icon-btn.ghost` | small | New IconButton.stories.tsx. |
| 12 | NEW `U:src/components/primitives/PageHeader.tsx` + `.ph` family in shell.css | medium | New PageHeader.stories.tsx — Compact/Overflow/Stacked exactly mirroring `K:comp-pageheader.html`. |
| 13 | NEW `U:src/components/primitives/Spinner.tsx` + `.spinner` keyframe (verify shell.css doesn't already define `@keyframes spin` from somewhere) | small | New Spinner.stories.tsx. |
| 14 | NEW `U:src/components/primitives/Checklist.tsx` + `.checklist` CSS | small | New Checklist.stories.tsx. |
| 15 | Extend `U:src/components/primitives/Input.tsx` with `InputPassword` + `InputSearch` sub-exports | small | Input.stories.tsx updated. |
| 16 | NEW `U:src/components/primitives/Field.tsx` (FieldHelp/FieldCount/FieldRowHelp) | small | New Field.stories.tsx; verify all Input stories use them. |
| 17 | NEW `U:src/components/primitives/LocaleTabs.tsx` (locale tabs + locale row + section-switcher) | large | New LocaleTabs.stories.tsx — three i18n patterns from comp-inputs.html C-section. |
| 18 | `U:src/styles/shell.css` `.statistic-value { font-weight: 500 }` (was 600) | tiny | Card.stories.tsx + Statistic.stories.tsx. |
| 19 | `U:src/styles/shell.css` `.app-topbar` padding 0 12px (optional) | tiny | Topbar.stories.tsx — side-by-side `K:comp-topbar.html`. |
| 20 | Stories parity + docs parity scripts | n/a | Run `scripts/check-stories-parity.mjs` + `scripts/check-docs-parity.mjs` (cardinal rules 17/18). |

Playwright verification recipe per step:
1. Render the matching Storybook story page at `http://localhost:6006/iframe.html?id=<id>`.
2. Render the matching `K:comp-*.html` at `http://localhost:5173/preview/comp-X.html` (or open the file directly).
3. Snapshot both — diff visually. Acceptable: structural identity (sizes, spacing, weights, color roles). NOT acceptable: different paddings, different border colors, different active states.

---

## F. Cardinal rules from SKILL.md to enforce

From `K:project/SKILL.md` (the design system's own SKILL.md, distinct
from the umbrella rules):

- **14px body / 1.7 leading** for content (SKILL.md:14). 13px / 1.5 for dense tables ONLY. NEVER 16/1.5.
- **Headings 20 / 18 / 14 / 13** at weight 500 — h1/h2/h3/h4 (SKILL.md:15). Bigger sizes are forbidden.
- **Three weights only**: 400 / 500 / 700 (SKILL.md:16). No 300, no 600.
  - Current shell.css contains TWO 600 usages: `.statistic-value` (line 1146) and `.console-sidebar .sb-brand-name` (line 1206), `.sb-logo-mark` (line 31, font-weight:700 ✅ ok), `.tb-chip-icon` (line 83), `.console-sidebar .sb-brand-mark` (line 1205). Several uses of 600 violate this — audit and reduce to 500 or 700.
- **`font-variant-numeric: tabular-nums`** on every numeric column or large stat (SKILL.md:17).
- **Primary** = trust + brand — single most important action per view (SKILL.md:21). Never for status.
- **Prefer 朱 attention over 茜 danger** for non-destructive alerts (SKILL.md:22). Lateness / pending = `--attention` (vermilion), not `--destructive` (madder).
- **Wa-iro decorative**: never role-mapped outside the 5 semantic roles (SKILL.md:23).
- **`color-mix(in oklch, var(--primary) 15%, transparent)`** for soft chip backgrounds (SKILL.md:25). Keeps chroma trail consistent.
- **4px grid** for `gap`, `padding`, `margin` (SKILL.md:29).
- **Page header sticky at 48px** (`--header-height`) (SKILL.md:30). **Sidebar 256px** (`--sidebar-width`).
- **Cards: 1px border, no shadow at rest** (SKILL.md:31). Shadows climb only at popover (`--shadow-md`) and dialog (`--shadow-xl`).
- **Tables: 32px header row, 36px body row at default density; 28/32 at compact** (SKILL.md:32).
- **lucide-react only**, 1.5px stroke, 14/16/18/20px sizing tied to context (SKILL.md:46). Always `color: currentColor`. NB: `K:comp-sidebar.html:5` uses stroke=2 on `.sb-icon` — design preview deviates from the 1.5px SKILL rule. Confirm with user; use 1.5 unless explicitly told otherwise. **Recommend 1.5px** per SKILL.md.
- **Tenants override only `--primary`, `--ring`, `--foreground`** (SKILL.md:53). Never override semantic colors — a rejected badge must look the same across every brand.
- **Default `lang="ja"`** at root; surfaces with Vietnamese staff use `lang="vi"` (SKILL.md:58).

Forbidden patterns (SKILL.md:62-70) — never ship:
- Aggressive gradients, rounded-pill cards, decorative emoji.
- Drop shadows under cards at rest.
- 16px / 1.5 body type (Western default — wrong for kanji density).
- Saturated brand colors (chroma > 0.18 in OKLCH).
- Inventing a new red — use 茜 destructive or 朱 attention.
- "Success" in green plus a confetti emoji. Quietly state the fact.

---

## Summary

- **Tokens needing migration**: 0 (token surface already aligned 1:1).
- **Primitives with deltas**: 9 — Button, Input, Tabs, Badge/Chip, Card (statistic weight fix only), Table, Sidebar, Topbar (minor), Calendar (out-of-scope — service-specific).
- **New primitives needed**: 9 — PageHeader, IconButton, SegmentedControl, InputPassword, InputSearch, Field/FieldHelp/FieldCount, LocaleTabs (+ LocaleRow + LocaleSwitcher composite), Checklist, Spinner. Plus a documented decision on whether Calendar shift-views ship in `@godxjp/ui` or stay in the kintai service.
- **Stories needing rewrite**: 9 existing (Button, Input, Tabs, Badge, Card, Table, Topbar, Sidebar, Calendar) + 7 new (PageHeader, IconButton, SegmentedControl, LocaleTabs, Checklist, Spinner, Field).
- **Critical bugs found**:
  1. Input.tsx (lines 85-115) emits `.input-shell` / `.input-affix` / `.input-inner` / `.input-group` / `.input-addon` / `.input-shell-grouped` / `.input-size-*` / `.input-status-*` / `.textarea-with-count` / `.textarea-count` classes, **none of which are defined in shell.css**. Any Input with a prefix/suffix/addon/size/status currently renders fully unstyled.
  2. Tabs.tsx:40 sets `data-active={undefined}` which kills the active styling — Radix emits `data-state="active"` but shell.css:278 selector reads `data-active="true"`. Active tab is invisibly active.
  3. Two competing badge systems (`.badge` translucent pill vs canonical `.chip` solid rounded-md) — current `.badge-*` is what SKILL.md:42 calls "chip-soft"; the SOLID `.chip-primary/success/...` canonical doesn't exist at all in shell.css.
  4. `.statistic-value` and `.console-sidebar .sb-brand-name`/`.sb-brand-mark` use font-weight 600, forbidden by SKILL.md:16.

### Top-10 fastest-impact deltas to ship first

1. **Tabs.tsx:40** — delete `data-active={undefined}` line; update shell.css:278 selector to `.tab[data-state="active"]`. (TS+CSS, ~2 lines each.) Restores Tab active styling that's been silently broken.
2. **shell.css `.input-shell` family** — add the full `.input-shell`/`.input-affix`/`.input-inner`/`.input-group`/`.input-addon` block at shell.css:220. Stops Input prefix/suffix/addon from rendering unstyled. (~40 lines CSS.)
3. **shell.css `.input-size-*` + `.input-status-*`** — add 6 short rules so sizes/statuses on Input work. (~15 lines CSS.)
4. **shell.css `.chip` + 7 role variants + 7 `.chip-soft` role variants** — replace the lone neutral `.chip` at shell.css:256 with the canonical family. (~25 lines CSS.)
5. **shell.css `.btn` font-size + add `.btn-outline` + `.btn-xs`** — bring Button to canonical parity. (~8 lines CSS.) Then rename `danger`→`destructive` in Button.tsx + Button.stories.tsx (search-replace, one PR).
6. **shell.css `.input:focus`** — replace the `outline: 2px solid var(--ring)` model with canonical `border-color + box-shadow ring` (canonical pattern). (~3 lines CSS.) Visible focus state now matches design.
7. **shell.css `.statistic-value` weight 600 → 500** — one-line fix to conform to SKILL.md:16. (1 line CSS.)
8. **shell.css `.tab[data-state="active"]` + new `.tabs-pills` / `.tabs-segment` variants** — adds two new tab styles consumed by calendars and toolbars. (~20 lines CSS.)
9. **shell.css `.help-error/.help-warning/.help-success/.help-info` + `.field-count*` + `.field-row-help`** — small helper classes that unblock proper inline form feedback. (~15 lines CSS.)
10. **NEW `PageHeader.tsx` primitive + `.ph` family in shell.css** — consumers (forge/me/console) currently hand-roll their page headers; one canonical primitive replaces dozens of bespoke implementations. (~80 lines CSS + ~50 lines TS.)
