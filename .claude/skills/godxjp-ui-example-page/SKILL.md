---
name: godxjp-ui-example-page
description: BẮT BUỘC khi tạo/sửa trang ví dụ catalogue trong docs/**/*.tsx của @godxjp/ui (mỗi trang = isolate /isolate/<group>-<name>). Ép trang ví dụ phải demo component ĐẦY ĐỦ và ĐÚNG — mọi prop × union value × state × tone — bằng real primitives, đúng types/tokens, "show don't tell". Đọc TRƯỚC khi viết bất kỳ demo nào.
---

# @godxjp/ui — Example-page completeness discipline

> 🛠️ **AUDIENCE: CORE** — governs the catalogue example pages in **this repo's `docs/`**. App-devs
> building real screens in their own app use the MCP (`design-to-page` / `compose-a-screen`), not
> this. CORE↔CONSUMER map: `.claude/skills/README.md`.

**Follow-map:** reached from [[godxjp-ui-component]] (the correctness contract — it owns
*real-primitives / no-raw-HTML*). This skill **owns the Audit Evidence Ledger** (the forcing gate
others reference). Pair it with [[godxjp-ui-interaction-feel]] (the refined behaviours each card must
prove) and [[godxjp-ui-behavioral-test]] (codify what you drove). Taste of the page: [[godxjp-ui-best-ux]].

**DO / DON'T:**

| ✅ DO | ⛔ DON'T |
|---|---|
| Fill the **Audit Evidence Ledger** with real evidence — drive EVERY card, open the console | Self-certify a partial pass; "looks fine"; a blank/skipped row |
| Type-check against the REAL API — `tone` for colour, declared union values, installed prop names | `variant="success"`, invented union values, removed props, missing Provider/Router |
| Render every non-default **state** + every **union value**; stage interaction **visible at rest** | One happy-path instance; behaviour only provable by clicking |
| Compose real primitives + semantic tokens; ASCII quotes; readouts show human **labels** | Hand-rolled/faked controls; raw `hsl()`/inline px; smart quotes; raw value codes |
| Pin the demo locale so `t()`-driven chrome matches the demo language | An "all-JP" demo whose search box renders "Tìm kiếm…" |

An example page in `docs/<group>/<name>.tsx` is the component's **proof of behaviour**. Its job is
to demonstrate the component **completely** and **correctly** — not to look nice with one happy-path
instance. A strict audit of all 87 pages (mean **5.93/10**) found the same failures over and over;
these rules close them. Treat the page as **incomplete until every gate below passes**.

> **Cardinal test:** could a reader who has never seen this component learn *every* prop, *every*
> state, and *every* variant value **from this page alone, at rest, without clicking**? If not, it's
> not done.

---

## 🔒 MANDATORY GATE — the Audit Evidence Ledger (fill it, or the audit is not done)

**Why this exists:** the rules below already said "exercise the whole API surface" and "check the
console" — yet a real audit still shipped after driving only 2 of 8 cards, never opening the
console, and missing a `<button>`-in-`<button>` error, a `changeOnSelect` parent that couldn't
drill, and a hover column that collapsed at depth 3. The rules were prose with no forcing function,
so a **partial pass self-certified as complete**. This ledger removes that escape hatch.

**The rule is absolute:** when you audit or build an example page you MUST reproduce this ledger in
your reply **with concrete evidence filled into every row** before you say "done", before you
commit, and before you report results. **An empty cell, a "looks fine", or a skipped row = the
audit FAILED — not a draft, a FAIL.** Evidence means *what you actually did and saw* (the click
path, the rendered text, the console output), never a promise.

```
AUDIT LEDGER — <group>-<name>  (paste filled-in; one line of real evidence per cell)
[ ] Cards enumerated: N = ___   (list every card title — you must drive EVERY one, not a sample)
[ ] Each card driven to its TERMINAL state:
      card 1 <title>: <what you clicked/typed + final result> ……………
      card 2 <title>: ……  (repeat for ALL N — a blank row is a FAIL)
[ ] Every interactive prop/mode exercised by NAME (list them from the component's prop type):
      e.g. changeOnSelect ✓<evidence>  · expandTrigger=hover ✓<reached depth-N leaf> ·
      multiple ✓<toggled> · disabled/isLeaf node ✓ · allowClear ✓ · showSearch ✓
[ ] DevTools console OPENED and quoted: errors=___ warnings=___  (button-in-button / hydration /
      act() / 404 = FINDING; "I assume clean" is not allowed)
[ ] Stateful checks (if the control holds state): held value visible on open ✓ ·
      re-pickable from a complete state ✓ · controlled value mirrors type↔click ✓
[ ] Screenshots at 390 / 768 / 1280 ✓
[ ] Verify suite green: typecheck · lint · audit · test · preview:build
```

If any box cannot be ticked with evidence, that is the next bug to investigate — **stop and fix,
do not report success.** Driving "a couple of cards" and declaring victory is the exact failure
this gate forbids.

---

## Rule #0 — Type-check against the REAL API (a render-breaking bug is not an example)

The 9 worst pages didn't *render* what their copy promised. Non-negotiable:

- **Semantic colour goes through `tone`, never `variant`.** `variant` is STRUCTURAL
  (`default | secondary | outline`). Passing `variant="success"` to Badge/Tag/StatCard/Alert/Progress
  is a TS error that silently collapses to grey.
  - 🛑 *Proof:* `feedback-alert` → 4 identical grey banners · `data-display-badge` → 5/8 colourless
    chips · `data-display-progress` → 5 identical green bars. All claimed colours; none rendered.
- **No invented union values.** Use only the values the component's type actually declares
  (Progress tone is `success | warning` only — `info`/`destructive` don't exist).
- **Match the INSTALLED library version's prop names** — `resizable-panel` used the removed
  `direction`; the prop is `orientation`. A vertical demo rendered horizontal.
- **State-object keys must match the prop type**; mount any **Provider/Router the component needs**
  or it throws at render (`query-prefetch-link` had no Router).

→ If `pnpm typecheck` isn't clean for the demo, stop. It's a bug, not a showcase.

## Rule #1 — Demonstrate every non-default STATE (the #1 gap — 50 / 87 pages)

If the type or the CSS has it, **render it**. For the component at hand, stage each that applies:
`disabled` · `error` / `aria-invalid` · `loading` / `pending` · `empty` · `readOnly` ·
`indeterminate` · `active` / `selected` · `collapsed` / `expanded` · `hover`/`focus` (note if visual only).

## Rule #2 — Make interaction-only behaviour visible AT REST (static-catalogue blindness — 25 pages)

A static screenshot must prove the behaviour:

- **Stage one instance open/active/highlighted statically** — `defaultOpen`, a seeded active item,
  a pre-filled value — so the open menu / active tab / selected row is visible without clicking.
- **Force async/lifecycle states to render** — add a **delay** in the demo's `queryFn`/`uploadFn`
  (e.g. `await sleep(1500)`) so fetching / spinning / disabled-while-pending is observable.
  **Never use an instant-resolving no-op** (`query-button-refetch` did → the spinner never shows).

## Rule #3 — Exercise the whole API surface (props under-shown — 73 pages · unions — 26 pages)

- **Every value of each structural union** — `variant`, `size`, `side`/`align`, `orientation`,
  `mode`, `type`, `titlePlacement` — not just the default.
- **Controlled AND uncontrolled** (`value` + `onValueChange` *and* `defaultValue`) when the
  component branches on them.
- **The headline / defining prop, explicitly** — `loadOptions`, `locale`, `name`, `prefetchOn`,
  `density`, `side`/`align`. The reason the component exists must be on screen.
- **The whole small API + family** — all scale steps, all swatches, **dark mode**, and **every
  exported sub-part / escape hatch**: `renderItem`, `children` composition, `*Header`/`*Description`,
  `Provider`, `Indicator`, `ScrollBar`.

## Rule #4 — Show, don't tell (WHY claimed but not shown — 15 pages)

Every WHY in the copy — *elevation, anti-reflow, container-query, responsive stacking, persistence,
draft-undo, provider-driven output* — must have a **corresponding live rendered demo**. If you can't
show it, delete the claim. (e.g. a container-query grid must be shown collapsing **in a narrow
container at a wide viewport**, not only by shrinking the window.)

## Rule #5 — Real primitives + tokens only (rule 29 · tokens — 13 pages)

- **No hand-rolled / faked controls** — import the real `Input`/`Select`/`Label`/`DataTable`/heading
  primitive. (This is the *real-primitives* contract — owned by [[godxjp-ui-component]] §1; it applies
  verbatim to example pages.)
- **Tokens only (example-page specifics)** — no raw `hsl()`/hex, no inline `style`
  width/height/maxWidth, no hardcoded px label strings, no arbitrary `[1.7]` values with
  lint-disables.

## Rule #6 — Independent cards + real context

- **Each example card is an independent pattern** — its own state setter and **its own data**; never
  share one setter across cards (they read/page in lockstep otherwise).
- Place a placeholder **next to** the real component it stands in for; wrap forms in `Card` + the
  canonical `FormField` / action-bar pattern.

## Rule #7 — Copy-paste-safe & locale-correct

- **Straight ASCII quotes** in code-like labels (smart quotes break copy-paste).
- **Override `parameters.docs.source.code`** with a literal snippet for function-valued props
  (`cell`/`render`/`renderItem`) — cardinal rule 34.
- **JP demos stay fully JP — including `t()`-driven COMPONENT CHROME, not just your own copy.**
  The hardcoded demo strings being Japanese is not enough: a component's internal search
  placeholder / clear-button aria / empty-state (all via `t()`) follow the **AppProvider locale**,
  which defaults to `vi`. If the preview harness doesn't pin the locale, an all-JP demo renders a
  Vietnamese search box ("Tìm kiếm…", "Xóa lựa chọn"). **Open the component in a real browser and
  read its chrome** — every placeholder/aria must be the demo's language. Fix at the harness
  (`isolate-main.tsx` / `frame-main.tsx` → `<AppProvider defaultLocale="ja">`), not per-demo.
- **Readouts show human LABELS, never machine value codes.** A `value`/path is codes
  (`["operating","selling"]`); a "selected path" / summary line must resolve them to labels
  (`営業費用 / 販売費`) by walking the option tree or using the resolved-node callback arg — never
  `value.join()`. Showing raw codes to the user is a showcase bug (and a real-app bug).

---

## Pre-commit checklist (run before calling an example page done)

- [ ] **🔒 Audit Evidence Ledger filled in with real evidence (top of this skill) — every card driven, console opened, every mode exercised. This is the blocking gate; a partial pass is a FAIL.**
- [ ] `pnpm typecheck` clean — `tone` not `variant`, no invented union values, installed-version prop names, Provider/Router mounted
- [ ] Every non-default **state** the component supports is rendered (Rule #1)
- [ ] Interaction/async behaviour staged **visible at rest** (open/active/fetching) — Rule #2
- [ ] Every **union value** shown · controlled + uncontrolled · headline prop explicit · sub-parts/dark-mode — Rule #3
- [ ] Every **WHY claim** has a live demo — Rule #4
- [ ] **Real primitives only** (rule 29) · **tokens only** — Rule #5
- [ ] Cards independent (own state + data) · providers mounted — Rule #6
- [ ] ASCII quotes · `source.code` override for fn props · JP stays JP **incl. `t()` chrome (opened in browser)** · readouts show labels not codes — Rule #7
- [ ] `pnpm audit` (ui-audit) 0 errors for the file
- [ ] Verified in the isolate view at **390 / 768 / 1280** (a static screenshot at each proves it)

## How to verify (the audit loop)

1. `pnpm preview` → open `http://localhost:6008/isolate/<group>-<name>`.
2. Screenshot at 390 / 768 / 1280 (Chrome DevTools / Playwright MCP). A behaviour you can't see in a
   screenshot isn't demonstrated — go back to Rule #2.
   - **🚨 MEASURE IS NOT SEEING — take the screenshot AND LOOK AT IT.** `getComputedStyle` /
     `getBoundingClientRect` numbers verify ONE hypothesis; they are blind to everything you didn't
     measure. Layout bugs (a right-aligned label, an element overlapping the close button, a wrong
     gap) are obvious in a rendered image and invisible in a numbers dump. Real failure (this repo):
     a Form was "verified" by measuring field `data-*`/computed columns and declared done — but a CSS
     selector leaked `text-align:end` onto vertical labels and the header `extra` sat under the ×
     button. Both were screaming in a screenshot; neither showed in the measurements. If you didn't
     open the image and look, you did not verify.
   - **Verify the COMPOSED surface, not just the isolated atom.** The bug appeared only when
     `FormField` was composed inside `SheetBody` at the real panel width. Screenshot the real screen
     the component lives in (the docs page / the consumer view), at the real width — not only the
     component's own isolate.
3. **Drive EVERY card to its terminal state — not 1-2.** Each card exists to show a distinct mode;
   click/type/hover through all of them (the parent-select card, the hover card to its deepest
   leaf, the multiple card's checkboxes, the disabled card). A bug found by the user in card 4 that
   you never opened means the audit was a spot-check, not an audit.
4. Check the console: **0 errors AND 0 warnings** (a 404, thrown Provider error, a
   `<button>`-in-`<button>` / hydration / `act()` warning is a finding — open the console, don't
   assume it's clean).

> Full per-page audit evidence (87 reports + screenshots + rollup) lives in `.ux-audit/` —
> `SUMMARY.md` ranks every page and lists the recurring failures this skill encodes.

---

## 🔁 Fix-request investigation protocol (BẮT BUỘC — log it every time the user reports a bug)

When the user reports/requests a fix (especially a visual one), **do NOT jump straight to a patch.**
Run and **record** this investigation, then encode the lesson back here so it's caught by design next
time. (Standing user instruction: log the whole process into the skill on every fix request.)

1. **Reproduce visually FIRST.** Open the exact surface the user is looking at, at the same width, and
   **screenshot it.** Confirm you SEE the same defect they do before touching code. If a user attached
   an image, match it.
2. **Root-cause in the code — name the file:line and WHY.** Don't guess-patch. Trace to the actual
   rule/selector/prop. (e.g. "right-aligned vertical labels ← `form-layout.css` `[data-label-align=end]`
   selector missing the `[data-layout=horizontal]` qualifier → leaked to vertical at ≥768px".)
3. **Answer the meta-question honestly:** *why did I miss it?* Skill not read? skill missing a rule?
   measured-but-didn't-look? verified the atom but not the composed surface? Skipped a width? Write it
   down — that answer becomes the next rule.
4. **Fix**, then **re-screenshot and LOOK** to confirm the defect is gone AND nothing else broke.
5. **Encode the lesson:** add the root-cause pattern to the relevant skill (a DO/DON'T, a verify step,
   or a checklist line) so the class of bug is prevented, not just this instance. Re-run the verify
   suite green.

> The investigation is part of the deliverable, not overhead. A fix that doesn't update the skill
> means the same class of bug returns.
