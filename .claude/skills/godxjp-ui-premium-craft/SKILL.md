---
name: godxjp-ui-premium-craft
description: >-
  BẮT BUỘC đọc khi một component của @godxjp/ui "trông nhàm chán", khi nâng cấp UI/UX cho một
  component, hoặc khi ai đó đưa ra một bản "premium/upgraded UI" để tham khảo. Skill này rút ra từ việc
  mổ xẻ 27 cặp Basic→Premium (premium-code-library), đọc trọn mã nguồn VÀ chạy trong Chromium thật: đo mọi
  animation bằng document.getAnimations(), chụp khung hình 0/120/400ms, chạy luồng gõ/chọn/xoá thật.
  Kết luận đo được: phần "premium" ~30% là tay nghề (trạng thái, phản hồi, phân cấp, đếm, gợi ý phím tắt)
  và ~70% là trang trí (gradient, glow, hover-lift, lò xo, vòng lặp). Skill dạy cách lấy đúng 30% đó và
  dịch sang token của @godxjp/ui trong khuôn khổ tiết chế của godxjp-ui-best-ux, kèm danh sách cấm có
  bằng chứng, quy trình nâng cấp từng bước và một probe đo motion để CHỨNG MINH bằng số, không bằng mắt.
---

# Premium craft — make a component feel alive without decorating it

> 🛠️ **AUDIENCE: CORE** — upgrading the look and feel of **@godxjp/ui components** in this repo.
> App-devs get the consumer form of this DNA from the MCP taste family. Map: `.claude/skills/README.md`.

**This skill owns:** the _upgrade procedure_ for a component that works but feels flat, the
**craft lenses** that make UI read as premium, the **motion spec** for state feedback, and the
**reject list** of premium-demo patterns we never copy.
**It does not own** the taste coordinates (chroma, weights, spacing, the 渋み/間/簡素 DNA). Those
belong to [[godxjp-ui-best-ux]], which wins on any conflict. It also does not own the catalogue of
state-truthful behaviours ([[godxjp-ui-interaction-feel]]) or the correctness contract
([[godxjp-ui-component]]).

## Why this skill exists: what the study measured

Source: 27 Basic-vs-Premium demos, each read in full by two independent reviewers (Codex and Fable),
then driven in Chromium. Evidence is in `references/`: `study-codex.md`, `study-fable.md`,
`browser-findings.md`.

| Measured on the 27 "premium" versions | Result                                                           |
| ------------------------------------- | ---------------------------------------------------------------- |
| handle `prefers-reduced-motion`       | **0 / 27**                                                       |
| style `:focus-visible`                | **0 / 27**; 122 of 146 focused targets computed `outline: none`  |
| any `aria-*`                          | **2 / 27**                                                       |
| scroll horizontally at 390 px         | **10–12 / 27** (mega-menu 610 px, login 194 px)                  |
| `transition: all`                     | the norm (Time-Picker 78 elements, Date_Time 44, MultiSelect 24) |
| use a gradient fill, text or border   | **23 / 27**                                                      |
| real UX value in the delta            | **≈ 30 %**; the rest is decoration                               |

So "premium" in the wild is **mostly a regression wearing a gradient**. What still makes those
demos feel better than the basic ones is real, can be named, and is what this skill teaches.

**Boring is fixed by craft (states, feedback, hierarchy, counts, detail), never by decoration.**

## DO / DON'T

| ✅ DO                                                                                     | ⛔ DON'T                                                       |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Show the count in the action ("Delete 3 items") and live counters next to what they count | A bare "Delete" whose scope the user must infer                |
| Give every row a primary line and a muted secondary line                                  | Tinted 40 px icon tiles and hue-coded options                  |
| Hand the selected state over visibly (old fades, new fills) in 150 ms                     | Snap, or animate with a 450 ms overshoot spring                |
| Reveal a control only when it applies (clear ×, bulk bar, Apply)                          | Keep a dead control on screen, or hide it behind hover only    |
| Commit multi-step pickers with Apply/Cancel; keep the previous value on Cancel            | Commit on every click of a multi-step picker                   |
| Stay neutral until the user has finished a field; then validate per rule                  | Turn everything red on the first keystroke                     |
| Destroy immediately and offer Undo, or confirm first when it cannot be undone             | A fake progress ring that delays the user and changes nothing  |
| Transition an **explicit** property list with `--duration-fast` + `--ease-standard`       | `transition: all`, transforms on hover, infinite loops at rest |
| Prove the change with `references/motion-probe.mjs` and a test                            | Declare it "feels better" from a screenshot                    |

## 1. The upgrade procedure (follow in order)

1. **Watch the component as it is, in a browser.** Open its `/isolate/<slug>` frame and drive it:
   - hover, click, keyboard, type, empty, error, many items;
   - capture frames at 0/120/400 ms;
   - run `references/motion-probe.mjs <url> <selector>` and keep the `probe.json`.

   You cannot judge motion from code. The study's browser pass found defects that no code reading did
   (a dead enter transition, a selected count that read 4 instead of 3, a chevron glyph tearing
   mid-rotation).

2. **Run the craft lenses (§2) one by one.** For each lens write _applies / already done / gap_, with
   `file:line`. Most of our components already pass most lenses (the study found 20 of 27 matches
   already done, 6 partly). An upgrade is usually 1–3 lens gaps, not a redesign.
3. **Translate each gap through the token table (§3).** If a needed value is not a token, add the token
   ([[godxjp-ui-component]] §3; the add-a-token checklist in `CLAUDE.md`). Never write a literal.
4. **Check the reject list (§5).** If the reference you are copying uses any item on it, take the
   affordance underneath and drop the treatment.
5. **Prove it** (§6):
   - a behavioural test beside the component (red on the old code);
   - the probe verdict all ✓;
   - a frame sweep for anything that moved layout;
   - `pnpm check:frame-axe` locally if markup or ARIA changed.
6. **Record the before/after numbers** in the issue. Close on a number, as the CLAUDE.md issue rules require.

## 2. The craft lenses (what actually makes UI read as premium)

Each lens is a pattern found in **at least two** premium demos and judged VALUE by both reviewers. A
lens gives the rule, how to express it in this library, and how to verify it.

| #   | Lens                                             | Rule                                                                                                                                                  | In @godxjp/ui                                                                                                                                                                          | Verify                                                                                       |
| --- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| L1  | **Two-line rows**                                | An entity shows its name and one qualifying line (email, description, count).                                                                         | primary 14/500; secondary 13/400 `--muted-foreground`. Existing: `MegaMenuLink.description`, Radio `description`. Gap: `DropdownMenuItem description`.                                 | `getByRole(…, { description })` resolves                                                     |
| L2  | **Counts in the words**                          | Numbers that change with the user's action are text, next to what they count, including inside the action ("Delete 3 items").                         | `t()` with `{count}` + `Intl.PluralRules`/`NumberFormat`, `tabular-nums`. Existing: `common.selectedCount`, `Input count`, `Pagination showTotal`.                                     | Count text matches state for 0 / 1 / many and in `ja`                                        |
| L3  | **Progressive disclosure**                       | A control exists only when it applies: clear × once there is text, bulk bar once there is a selection, Apply once valid.                              | Render-or-not in React, then at most a `--duration-fast` opacity fade. Never hover-only.                                                                                               | Absent at rest, present after the trigger state; keyboard-reachable                          |
| L4  | **Presets and shortcuts**                        | Common answers are one click away, and the keyboard path is advertised.                                                                               | `DatePicker presets`, `TimePicker showNow`, `<kbd>` hint from `shortcutHint` (⌘K on Apple, Ctrl+K elsewhere; hidden while typing).                                                     | The preset sets the exact value; the shortcut focuses; it never fires during IME composition |
| L5  | **Commit model**                                 | A picker that takes more than one gesture has Apply/Cancel, and Cancel restores the previous value.                                                   | `needConfirm` vocabulary (TimePicker, DatePicker; gap: `Select mode="multiple"`).                                                                                                      | `onValueChange` fires once, on Apply; Escape discards                                        |
| L6  | **Dependent controls**                           | A child field is visibly disabled until its parent has a value, and resets when the parent changes.                                                   | `disabled` + `--disabled-opacity`, `loading` while children fetch, `FormField helper` via `t()`.                                                                                       | Child `aria-disabled` until the parent has a value; a parent change clears the child         |
| L7  | **Selection tints the container**                | The row or card holding a checked control takes a soft primary fill and a 1 px primary border.                                                        | `color-mix(in srgb, hsl(var(--primary)) 12%, transparent)` + border, the way `.sb-nav-item[data-active]` already does. No lift, no shadow.                                             | Contrast is measured; no `transform` on the selected state                                   |
| L8  | **Selection hand-off**                           | When the selection moves, the new item fills at once and the old one fades out, so the eye sees where it came from.                                   | Colour/background transition on the item, `--duration-fast`. One travelling indicator is allowed only with `transform: translateX` and an ease-out, never by animating `left`/`width`. | The probe shows a colour transition ≤ 250 ms and no layout property animated                 |
| L9  | **Staged reveal**                                | Content never animates while its box is still resizing: the container opens first, then the content appears.                                          | Collapsible animates one height variable; content opacity only after open.                                                                                                             | Frames at 120 ms show no text inside a growing box                                           |
| L10 | **Neutral until finished**                       | Validate when the user pauses or blurs, then report each rule as it is met (○ becomes ✓). An empty value is neutral, not "Weak".                      | `PasswordStrength`: empty → 0 segments, no tone. Checklist items use `data-state`. Errors go through `aria-errormessage`, never only colour.                                           | `value=""` renders 0 filled segments and no "weak" text                                      |
| L11 | **Results grow into place**                      | After an action that produces numbers (vote, upload, import), the bars or values arrive with the result, not before it.                               | `Progress`, bound to the real value, filling from its previous value (`--duration-base`); `aria-valuenow` is set.                                                                      | The bar's final width equals the value; no animation when reduced motion is on               |
| L12 | **Undo over theatre**                            | A reversible destructive action happens immediately, with an Undo toast. An irreversible one asks first (`AlertDialog`). Never a timed fake progress. | `toast` with action + `AlertDialog`. A progress ring only for real work (`aria-valuenow`) or the indeterminate `Activity`.                                                             | The mutation runs at once; Undo restores; no timer-driven percentage exists                  |
| L13 | **One-sentence empty and zero states, in place** | "No results for 'x'", "Nothing selected", "All items deleted".                                                                                        | `EmptyState role="status"`, `Select renderEmpty`, CommandPalette `labels.empty`.                                                                                                       | The text exists and is announced                                                             |
| L14 | **Field-identifying icons**                      | A leading glyph tells what the field is (mail, lock, calendar); a trailing glyph tells what will happen (chevron).                                    | lucide 16 px, `currentColor`, through `Input prefix` / `leadingIcon`. No coloured tiles.                                                                                               | Icon `aria-hidden`; the field keeps its text label                                           |

## 3. Motion and visual spec: the translation table

The premium demos measured **250–350 ms `ease` on `all`** for state changes and **450 ms** decelerate
drawers. We keep their _curve family_ and cut the duration to our tokens.

| Need                                                  | Token / value                                                                                                                         | Properties allowed                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| state change (hover, selected, checked, focus border) | `--duration-fast` 150 ms · `--ease-standard` `cubic-bezier(0.2,0,0,1)`                                                                | `color, background-color, border-color, box-shadow, opacity` (an explicit list) |
| overlay enter/exit (popover, sheet, dialog)           | the component's own enter token (`--sheet-enter-duration` 150 ms…) · `--ease-decelerate` in, `--ease-accelerate` out                  | `opacity, transform`                                                            |
| value change (progress, meter, results)               | `--duration-base` 250 ms · `--ease-standard`                                                                                          | `transform: scaleX` or `inline-size` on the bar only                            |
| disclosure (collapsible, accordion)                   | `--duration-base` · one height variable                                                                                               | height via the component's variable; content opacity after open                 |
| hover                                                 | **colour only**                                                                                                                       | no `transform`, no lift, no shadow growth                                       |
| reduced motion                                        | every rule above inside `@media (prefers-reduced-motion: no-preference)`, or an unlayered `reduce` block that sets `transition: none` | —                                                                               |

The decelerate curves the demos used (`0.22,1,0.36,1` / `0.16,1,0.3,1`) need no new token;
`--ease-decelerate` and `--ease-standard` are the same family. Anything over 250 ms on an app
surface, any overshoot (`y < 0` or `> 1` in the bezier), and any `iterations: Infinity` at rest
fails.

Visual treatment comes from [[godxjp-ui-best-ux]]. In short: 1 px `--border` and no shadow at rest;
`--radius` 6 px; one `--primary` per view; 13 px type floor; three weights.

## 4. What to measure: the probe's verdicts

`references/motion-probe.mjs` prints these. All must be ✓ before you call an upgrade done:

- **no `transition: all`.** In the browser, `all` animated properties nobody chose: focus outlines,
  `height`, `scrollbar-color`, four `border-*-radius`, `backdrop-filter`, a floating label's
  `font-size`.
- **state transitions ≤ 250 ms.**
- **no infinite animation at rest.**
- **no overshoot easing.**
- **reduced motion stops motion.** The click is re-run with `reducedMotion: "reduce"` emulated, and
  every running animation must be ≤ 1 ms.
- **keyboard focus is visible.** Measured after a real Tab, not after a scripted `.focus()`.

## 5. Reject list: premium patterns we never copy (with evidence)

| Pattern                                                                | Seen in                                                               | Instead                                 |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------- |
| Hidden native input (`display:none`) behind a painted box              | Table, MultiSelect, Select-All, Login                                 | react-aria primitives / visually-hidden |
| `div` / `li` / `i` as controls                                         | Pagination, Sidebar, Time-Picker, Bulk bar, password eye, toast close | `Button`, `Link`, APG roles             |
| Hover-only disclosure                                                  | Navigation-Dropdown, Dock tooltip                                     | click/focus/keyboard parity             |
| Overshoot/bounce on data or navigation UI                              | nav pill `(.68,-.55,.27,1.55)`, `checkPop`, `bounce`, `chipIn`        | `--ease-standard`, 150 ms               |
| Transform on hover (lift, scale, rotate)                               | 13 of 27 demos                                                        | colour only                             |
| Infinite ambient animation                                             | Newsletter, Navigation `gooey`, Bulk trash pulse                      | motion only as feedback                 |
| Fake progress (a timer-driven ring)                                    | Bulk-Delete `script.js:88-106`, 1,200 ms                              | do it now and offer Undo (L12)          |
| Error tone on keystroke one                                            | password, Login `:valid` label                                        | L10                                     |
| Gradient fill, text or border; tinted glow shadows; glass; neumorphism | 23 of 27 demos                                                        | solid `--primary`, 1 px border          |
| Radius 18–36 px, controls 48–68 px, 8–10 px micro text                 | most demos                                                            | `--radius`, density track, 13 px floor  |
| Hard-coded locale (English months, Sunday-first, 12 h only)            | Date_Time, Time-Picker, Date-Range                                    | `Intl` / the date subsystem             |
| Global key hijack (`Enter` on `document`, `Ctrl` without `Meta`)       | Time-Picker, Search                                                   | scoped handlers; `shortcutMatches`      |
| Fixed pixel widths that overflow a phone                               | Mega-menu 1000 px, Login 560 px                                       | intrinsic layout; frame sweep at 390    |
| Demo cheats (`scale(0.85)` wrappers, runtime `<style>` injection)      | Sidebar, Poll, Bulk-Delete                                            | never in a component or docs page       |

## 6. Done means measured

For each upgraded component:

- [ ] lens audit written (applies / done / gap, with `file:line`)
- [ ] a behavioural test beside the component, red on the old code ([[godxjp-ui-behavioral-test]])
- [ ] `motion-probe.mjs` verdict all ✓, `probe.json` attached to the issue
- [ ] frames at 0/120/400 ms compared before and after (attach both)
- [ ] `pnpm check:frame-overflow --only <slug>` if layout moved; `pnpm check:frame-axe` locally if markup/ARIA changed
- [ ] the gates for the diff ([[godxjp-ui-component]] §5); public prop → `pnpm regen` + catalog sync ([[godxjp-ui-mcp-catalog-sync]])
- [ ] before/after numbers in the issue

## 7. The backlog this study produced (ranked by value/cost)

From `references/study-fable.md` §4 and `references/study-codex.md`. Each item has a test plan there.

1. `DatePicker` range: a live range summary (`Intl.DateTimeFormat#formatRange` + a plural day count) and a "select end date" prompt. Lenses: L2, L10.
2. `CheckboxGroup selectAll`: indeterminate, "{n} of {m} selected". Lenses: L2, L7.
3. `DropdownMenuItem description`: a two-line item. Lens: L1.
4. `PasswordStrength`: neutral empty state. Our component shows "Weak" on an empty value today. Lens: L10.
5. `Select mode="multiple" needConfirm`: a Clear/OK footer; the collapsed-tag placeholder defaults to the count. Lenses: L5, L2.
6. `CommandPalette recent`: a recent-queries group (storage stays in the app). Lens: L3.
7. `SearchInput shortcut`: a `<kbd>` hint, hidden while typing. Lens: L4.
8. `Checkbox` / `Radio` / `BulkActions` state transitions at `--duration-fast` (today the checkbox fill snaps). Lenses: L7, L8.
9. Docs pattern pages: dependent selects; card-grid selection with bulk delete, Undo and `EmptyState`. Lenses: L6, L12, L13.
10. `Toaster`: a close button on error/warning, and a `--toast-duration` token. Lens: L12.

## Self-track

- [ ] I watched the component in a browser before and after; I did not judge motion from code
- [ ] every change maps to a lens (§2); nothing maps only to "looks nicer"
- [ ] every value is a token (§3); no literal ms, colour or radius
- [ ] nothing from the reject list (§5) entered the diff
- [ ] probe all ✓, a test red on the old code, numbers in the issue
