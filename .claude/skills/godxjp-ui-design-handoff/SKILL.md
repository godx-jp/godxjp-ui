---
name: godxjp-ui-design-handoff
description: BẮT BUỘC khi nhận một Claude Design handoff bundle (export từ claude.ai/design — README + chats/ + project/ HTML/CSS prototypes, vd .design/bundle/<name>/) và cần hiện thực hoá nó. Biến design thành SHOWCASE base trên @godxjp/ui ở preview 6008 (docs/) — KHÔNG bao giờ thêm vào ui framework. Áp theo kiểu "khung xương" (tái hiện ý đồ thị giác/UX bằng real component), không copy máy móc HTML prototype. Đọc TRƯỚC khi viết.
---

# Implementing a Claude Design handoff on @godxjp/ui — skeleton, not transcription

> 🛠️ **AUDIENCE: CORE** — build the handoff as a **showcase in THIS repo's `docs/` (preview :6008)**,
> never into `src/components/`. ⚠️ Do not confuse with the CONSUMER skill `design-to-page` (in the
> MCP), which builds a handoff into the **app-dev's own app**. Same input, different target.
> CORE↔CONSUMER map: `.claude/skills/README.md`.

**Follow-map:** build the showcase per [[godxjp-ui-example-page]] (completeness + Audit Evidence
Ledger), composing real primitives per [[godxjp-ui-component]] (correctness). Taste + the
DNA/Layout/Interaction hygiene are owned by [[godxjp-ui-best-ux]]; refined behaviours by
[[godxjp-ui-interaction-feel]] — this skill points there, it does not restate them. Register the
result in the MCP catalog per [[godxjp-ui-mcp-catalog-sync]].

**DO / DON'T:**

| ✅ DO | ⛔ DON'T |
|---|---|
| Read the chats first (intent), then rebuild the *skeleton* with real primitives | Transcribe the prototype's DOM; hand-roll `<div class="card">` |
| Put showcases in `docs/` (preview :6008) | Add anything to `src/components/` (bloats every consumer bundle) |
| Consume existing `var(--…)` tokens (already shipped as `foundation.css`) | Redeclare a token or paste a hex |
| Make `DataTable` the centerpiece; showcase the table family broadly | Ship one happy-path table |
| Resolve a gap by **extend** or `/debate`+ADR | Silently invent a bespoke one-off |

A Claude Design bundle (`claude.ai/design` export) is an **HTML/CSS/JS prototype**, not production
code. Your job is **not** to translate its markup line-by-line. It is to read the *intent*, lift the
*visual + interaction skeleton*, and **rebuild it with REAL `@godxjp/ui` components** as a **showcase**.

> **Mechanical = wrong.** A pixel-copy that hand-rolls `<div class="card">` to match the mock is a
> failure. The right output composes `Card`/`DataTable`/`PageShell`/`Badge`… so the showcase *is*
> how a consumer should actually build it. The prototype is the **target look**, godx-ui is the **means**.

## The hard boundary (read this twice)

- **Showcases live in `docs/` (preview at `:6008`), NEVER in `src/components/`.** They are
  compositions for humans + the MCP to learn from — adding them to the framework bloats every
  consumer's bundle. The framework stays lean; the showcase layer is where app patterns live.
- **Only real `@godxjp/ui` primitives.** No hand-rolled controls, no raw HTML re-creating a primitive
  (rule 29). If you're writing a styled `<div>` that looks like a Card, stop — use `Card`.
- **Tokens already exist.** The design's `colors_and_type.css` is *already* implemented as godx-ui's
  `src/tokens/foundation.css` (same SmartHR blue, wa-iro, M PLUS 2, densities). Never redeclare a
  token — consume `var(--…)` / the semantic utilities. If a token seems missing, it almost certainly
  exists under a different name; grep before inventing.

## Process

1. **Read the chats first** (`<bundle>/chats/*.md`) — they hold *what the user actually wants* and
   where they landed after iterating. The final HTML is the output; the chat is the intent.
2. **Read the bundle README + SKILL.md + `colors_and_type.css`** for the design DNA (below). Then the
   primary surface (`ui_kits/.../UI Kit.html`, the `project/*.html`) and follow its imports.
3. **Decompose each screen into a component shopping list.** For every visual block ask: *which
   godx-ui component is this?* (page chrome → `PageContainer`/`AppShell`/`Sidebar`/`Topbar`; a stat
   row → `ResponsiveGrid` + `StatCard`; a data grid → `DataTable`; a status pill → `Badge tone=…`;
   a filter row → `Form` inline + `Select`/`Input`; an empty state → `EmptyState`; a confirm →
   `AlertDialog`). Use the **`godxjp_ui_guide` MCP** / `list_primitives` to map, don't guess.
4. **Identify GAPS** — blocks no existing component (or prop/variant) can express.
   - First try: **extend** — can an existing component take one more `variant`/`size`/`tone`/slot?
   - Genuine gap or unclear: run **`/debate`** ("new component vs. new variant on `<X>` vs.
     app-level composition") and converge on an ADR before building. **Never silently invent.**
   - The fix for a gap is *still a showcase composition or an upstream component change* — never a
     bespoke one-off baked into the showcase page.
5. **Build the showcase** in `docs/<group-or-recipes>/<screen>.tsx` per the **`godxjp-ui-example-page`**
   skill (completeness, real states, tokens, a11y). Recreate the *look*, not the prototype's DOM.
6. **Verify** at `:6008/isolate/<id>` (390/768/1280), console clean, `pnpm typecheck` + `pnpm audit`.
7. **Make it MCP-discoverable** — register the showcase so `godxjp_ui_guide` can serve it as a
   pattern (so future consumers get "here's how a real kintai dashboard is built", not just atoms).

## Tables are first-class (DataTable matters most)

Enterprise 勤怠/admin design lives in tables. A handoff implementation MUST showcase the **table
family broadly**, each as its own demo: default list · **compact (kintone-density)** · filter bar +
bulk-action toolbar · sticky header + horizontal scroll (`min-w-[…]`) · row selection + batch ·
status-cell (`Badge tone`) · sortable/paginated · expandable / tree rows · empty + loading
(`Skeleton`) + error states · numeric columns with `tabular-nums`. If `DataTable` can't express one,
that's a `/debate` candidate (Rule #4).

## Design DNA to apply as the skeleton (dxs-kintai)

→ **Owned by [[godxjp-ui-best-ux]] — apply its dxs-kintai DNA, don't re-read it here.** In one line:
渋み (chroma ≤ 0.18, `--primary` for the one key action + brand only, never status) · 間 (body 14/1.7,
`tabular-nums`) · 簡素 (3 weights 400/500/700, h1 = 20px) · **fixed** color-signaling (success 若竹 ·
warning 山吹 · info 群青 · attention 朱 over red for non-destructive · danger 茜 destructive-only; wa-iro
decorative, never a role) · density up front (28/32/44, don't mix) · cards 1px border no shadow at rest
(6px radius) · quiet i18n-keyed copy, no emoji · multi-tenant overrides only `--primary`/`--ring`/
`--foreground` · Lucide 1.5px `currentColor` sized by context. These survive when you drop the
prototype's divs — apply them, not the markup.

## Checklist before calling a handoff "implemented"

- [ ] Read chats (intent) + README/SKILL/tokens (DNA) before any code
- [ ] Each screen mapped to real godx-ui components (MCP-checked) — zero hand-rolled primitives
- [ ] Every gap resolved by extend-or-`/debate`+ADR — nothing silently invented, nothing added to `src/components`
- [ ] Tables showcased broadly (≥ the variants above); DataTable is the centerpiece
- [ ] Tokens consumed, never redeclared; DNA rules applied (density, color signaling, small headings, 14/1.7, no emoji)
- [ ] Built per `godxjp-ui-example-page` (states/props/a11y complete); verified at :6008 390/768/1280; typecheck + audit clean
- [ ] Showcase registered so the MCP can serve it as a pattern to consumers

## Layout hygiene & Interaction hygiene (BẮT BUỘC)

→ **Both are owned by [[godxjp-ui-best-ux]] — follow its "Layout hygiene" and "Interaction hygiene"
sections; do not re-read them here.** In short: no decorative edge fades/scrims (1px border ends
content); no dead grey panes (`items-start`/`h-fit`/`EmptyState`); mobile-first multi-column
(default 1 col, add cols only at `md:`/`lg:` when each keeps ≥14px body); consistent
`PageContainer` padding + `Stack` gap (two bordered surfaces never touch); short headings stay one
line (wrap the whole cluster, never break a label mid-word); natural-width components (calendar/
picker/segmented) stay `w-fit`. Interaction: multi-step selections reset-on-complete (range
`resetOnSelect:true`), value-at-rest visible on open, controlled value mirrors type↔click — drive
each by hand in a real browser (these never show on a static screenshot). Behaviour catalogue:
[[godxjp-ui-interaction-feel]].
