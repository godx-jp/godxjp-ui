---
name: godxjp-ui-best-ux
description: BẮT BUỘC đọc trước khi thiết kế/đánh giá trải nghiệm người dùng cho bất kỳ surface @godxjp/ui hay dxs-kintai nào. Skill này hợp nhất craft chống-slop của taste-skill (phân cấp typographic, bố cục không gian, motion có chủ đích, kỷ luật em-dash, mapping design-system) VỚI sự tiết chế của dxs-kintai (渋み chroma ≤0.18, 間 14px/1.7, 簡素 3 weights, màu signaling cố định, card 1px viền không đổ bóng, không emoji, copy điềm tĩnh). Lấy KỸ THUẬT của taste-skill nhưng GẠT BỎ lời khuyên "hãy táo bạo" của nó — vì dxs-kintai là một hệ JP-enterprise đã chốt variance THẤP / motion THẤP một lần ở cấp hệ thống. Khác biệt ở đây = thực thi nhất quán hoàn hảo, KHÔNG phải re-theme. Tham chiếu (không lặp lại) các skill taste/soft/minimalist/brutalist + list_anti_ai_tells trong @godxjp/ui MCP.
---

# godxjp-ui-best-ux — Best UX, reconciled

## 0. The reconciliation thesis (read this first)

There are two voices in this skill, and they only contradict on the surface.

- **taste-skill** (the anti-slop frontend framework) exists because AI-generated UIs default to *generic and boring*: centered cards, Inter/Acme, purple gradients, confetti on success, no hierarchy, no rhythm. Its remedy is three dials — DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY — plus a craft discipline (typographic hierarchy, spatial composition, canonical GSAP motion, em-dash ban, design-system mapping, redesign-audit, pre-flight checks). Its variant pack (soft / minimalist / brutalist) lets a project pick a personality and *commit* to it.

- **dxs-kintai** is a multi-tenant JP-enterprise 勤怠 system. It already made the personality choice — *once, at the system level* — and it chose restraint: 渋み (restrained chroma), 間 (breathing), 簡素 (simplicity). It is, in taste-skill's own terms, a system deliberately tuned to **LOW variance, LOW/reserved motion, controlled density**.

**So the two do not fight. dxs-kintai is one fixed coordinate inside taste-skill's space.** Our job is to run taste-skill's *craft* at that coordinate — and to refuse taste-skill's *be-bold* impulses, because boldness re-themes, and re-theming breaks 渋み.

> The cardinal rule: **Distinctiveness here is flawless, consistent execution — not novelty.** A dxs-kintai screen stands out by being the most precisely typeset, best-spaced, most quietly confident enterprise screen in the room. Never by being the loudest.

If you ever feel the urge to "make this pop" with a new font, a gradient, a colored hero, or a celebratory animation — that is taste-skill's *anti-slop reflex misfiring*. The anti-slop move in THIS system is the opposite: remove the decoration, tighten the grid, fix the leading.

---

## 1. The three dials, set to dxs-kintai defaults

taste-skill asks you to choose dial positions per project. They are already chosen. Treat these as locked unless the user explicitly overrides for a one-off marketing/public surface.

### DESIGN_VARIANCE → **LOW** (locked)
- Layouts are **structured and predictable**: `PageShell` + `PageHeader` + `PageContent`, sidebar 256px, sticky header 48px. Filters in a 4-column label+control grid. Bulk-action toolbar above tables.
- Asymmetry is allowed *only* as information hierarchy (primary action right-aligned, KPI row, content-vs-meta split) — never as decorative off-balance composition.
- **No** per-screen hero layouts, diagonal sections, oversized display type, or "editorial" full-bleed imagery on app surfaces.
- One brand voice across every screen. A user moving from `/admin/.../absences` to `/me/my-shifts` must feel the *same system*, only re-tenant-colored.

### MOTION_INTENSITY → **LOW / reserved** (locked)
- Default state: **no motion**. Cards do not float in, numbers do not count up, lists do not stagger on load.
- Motion is spent only on **transient, meaningful feedback**: focus ring appearance, popover/dialog enter-exit, toast slide, expand/collapse of a row or section, a value that just changed.
- Use the system's transition tokens / `prefers-reduced-motion` honoring. Durations are short (≈120–200ms), easing is calm (ease-out), no bounce, no overshoot, no spring on enterprise data.
- taste-skill's "canonical GSAP scroll/magnetic/parallax skeletons" are **OUT** for app surfaces. They may appear *only* on a genuinely public marketing/login splash if the user asks — and even then, restrained.
- **Never** animate to celebrate. 「承認しました」 appears; it does not bounce.

### VISUAL_DENSITY → **context-driven** (28 / 32 / 44)
This is the one dial that legitimately moves — but along a fixed, pre-defined track, never freehand.
- `data-density="compact"` → **28px** elements / 13px·1.5 type → heavy data tables (kintone-style review grids).
- default → **32px** elements / 14px·1.7 type → every app surface.
- `data-density="comfortable"` → **44px** elements → login, public, mobile-leaning, punch surfaces (meets the 44px touch floor).
- Pick density **per surface, up front**. Do not mix densities mid-page.

---

## 2. The craft moves that ARE allowed (taste-skill, kept)

These are the parts of taste-skill that *amplify* dxs-kintai. Apply them aggressively — this is where "best UX" is won.

1. **Typographic hierarchy via the EXISTING scale.** Build clear rank with 20 / 18 / 14 / 13 at weights 400 / 500 / 700 and color (`--foreground` vs `--muted-foreground`) — not by inventing sizes. h1 = 20px and that is *correct*; oversized headings steal 間 from the data. `tabular-nums` on every numeric column and stat.
2. **Spatial composition & rhythm.** 4px grid, consistent gaps, intentional grouping (filter cluster, action cluster, content). Whitespace is a feature, not an absence. Align everything to a column; never let controls drift.
3. **Design-system mapping (taste-skill's core skill, fully kept).** Before building, map the screen to *real* primitives and *real* tokens. `var(--token)` only — never raw hex, never raw spacing px. Status → semantic role. Surface → `--background` / `--card` / `--secondary` / `--accent`. Soft chips via `color-mix(in oklch, var(--primary) 15%, transparent)`.
4. **Em-dash discipline (hard ban, kept verbatim).** No `—` in UI copy, ever. Use a colon, a period, two short sentences, or a middot `·` for inline JP/EN pairs (`出勤 · Check In`). This applies to microcopy, labels, empty states, and any string you author.
5. **Motion as feedback, via tokens.** Reserve motion for the high-impact moment (the dialog opening, the value changing) and make it crisp. This is taste-skill's "motion with intent" — just dialed down.
6. **Redesign-audit protocol (kept).** When improving an existing screen, first *audit*: list what's vague, mis-ranked, mis-tokened, off-grid, over-decorated, or anti-slop-flagged — then fix specifically. Don't restyle blindly.
7. **Strict pre-flight checks (kept, see §5).** Before declaring done, run the checklist.
8. **Brief inference (kept).** Infer the surface's job (admin review vs employee glance vs login) and let *that* drive density, copy register, and which single action gets `--primary`.

---

## 3. The taste-skill advice that is OVERRIDDEN here

These are real taste-skill defaults that DO NOT apply to dxs-kintai. If a generic "make it beautiful" instinct produces any of these, stop.

| taste-skill default | OVERRIDDEN by dxs-kintai |
|---|---|
| Push DESIGN_VARIANCE up for distinctiveness | LOW, locked. Distinctiveness = consistent execution. |
| Per-screen font/personality, expressive display type | **One font: M PLUS 2.** Three weights. h1 = 20px. No display type on app surfaces. |
| Brand gradients, saturated accents, colored heroes | Chroma ≤ 0.18 OKLCH. No gradients. `--primary` = one calm blue, used for the single most-important action + brand chrome only. |
| Bold scroll/magnetic/parallax/GSAP motion | Reserved micro-feedback only. No scroll choreography on app surfaces. |
| Celebrate success (animation, confetti, 🎉) | Quietly state the fact. 「承認しました」. No emoji anywhere in product. |
| "Variant: brutalist/soft can break the grid" | Grid is never broken. 6px radius, 1px borders, no shadow at rest. |
| Pill-shaped cards, decorative fills, illustrations | Forbidden. Empty state = one calm sentence in an `Alert`. |
| Free choice of density to taste | Density is a fixed 3-step track chosen per surface. |

**Why:** every override protects one of 渋み / 間 / 簡素 or the fixed-color signaling contract. Breaking them doesn't make the UI more distinctive — it makes it look like a different, less trustworthy product. Multi-tenant: a "rejected" badge must read identically in every brand, so semantic colors are never re-themed; tenants override **only** `--primary` / `--ring` / `--foreground`.

---

## 4. Anti-AI-slop checklist, adapted to JP-enterprise

taste-skill's anti-slop list targets consumer/marketing tells. Here is the JP-enterprise translation — scan every screen against it.

**Typographic / chromatic tells (remove these):**
- [ ] Inter / Roboto / Acme / system-ui as the brand face → must be **M PLUS 2**.
- [ ] 16px / 1.5 body (the Western default) → must be **14px / 1.7** (13/1.5 only at compact).
- [ ] font-weight 300 (kana strokes vanish) or 600 (ambiguous) → **400 / 500 / 700 only**.
- [ ] Purple/indigo "AI" gradient, saturated brand color, neon → chroma ≤ 0.18, no gradient.
- [ ] Big marketing-sized heading (28px+) on an app surface → **20px max** (h1).

**Color-signaling tells:**
- [ ] "Everything is red" alerts → prefer **朱 attention (#eb6101)** for non-destructive (遅刻/lateness); reserve **茜 danger (#b7282e)** for destructive only.
- [ ] A wa-iro hue used as a semantic role → wa-iro is decorative (charts/tags/tenant) only; the 5 semantic mappings are fixed.
- [ ] Green success + confetti → quiet factual copy, no emoji.

**Composition / decoration tells:**
- [ ] Centered single-card "hero" layout where a real page chrome belongs.
- [ ] Drop shadow under a card at rest → 1px border instead; shadow only at popover (md) / dialog (xl).
- [ ] Rounded-pill cards, decorative emoji, illustration empty-states.
- [ ] Generic "Lorem"/「サンプル」copy or invented strings → pull from `src/i18n/{ja,en,vi}.json`; copy is quiet, precise, neutral (no 「素晴らしい」, no 「重大」).
- [ ] Em-dash `—` in any string.
- [ ] Icons not from lucide, not 1.5px stroke, or color-filled instead of `currentColor`.

**Structural tells:**
- [ ] `lang` not set (`ja` default; `vi` for Betoya `/me/*`).
- [ ] Self-closing non-void elements; whitespace-separated UI siblings (use `display:flex; gap:`).
- [ ] Density mixed mid-page, or chosen by feel rather than per-surface.

---

## 5. Pre-flight (run before declaring a surface done)

1. **Real primitives only.** Every control is a real `@godxjp/ui` primitive (no raw HTML inputs, no hand-rolled). → defer to the **godxjp-ui-component** skill; this skill governs *taste*, that one governs *correctness*. Run it first for any component work.
2. **Tokens only.** `var(--token)` for color/type/space/density. Zero raw hex, zero magic spacing px.
3. **Density chosen up front**, consistent across the surface, matching the audience (admin 32 / table 28 / login 44).
4. **One `--primary` action** per view. Status via semantic roles, attention-over-danger.
5. **Hierarchy reads at a glance** using only the 20/18/14/13 × 400/500/700 scale + foreground/muted color.
6. **Motion audit:** is every animation feedback for a real state change? If it's decorative or celebratory, cut it. `prefers-reduced-motion` honored.
7. **Copy audit:** quiet, factual, i18n-keyed, no em-dash, no emoji, no praise/alarm.
8. **Anti-slop scan (§4) passes.**
9. **Tenant-safe:** semantic colors unchanged; only `--primary`/`--ring`/`--foreground` vary by tenant.

---

## 6. Using the @godxjp/ui MCP's anti-ai-tells (reference, don't duplicate)

The `@godxjp/ui` MCP already bundles the **taste / soft / minimalist / brutalist** skills and a **`list_anti_ai_tells`** tool. Do not re-implement them here.

- Call **`list_anti_ai_tells`** as an external lint pass on a finished surface — it catches generic tells this skill's §4 may not enumerate. Treat its output as input to the §5 anti-slop scan.
- The bundled **taste** skill is the upstream craft source; **soft / minimalist / brutalist** are *alternative* personalities. For dxs-kintai surfaces, **do not adopt soft/minimalist/brutalist wholesale** — dxs-kintai is its own committed coordinate (LOW variance, restrained). Borrow only a specific craft technique (e.g. minimalist's editorial whitespace discipline, soft's calm restraint) when it *reinforces* 渋み/間/簡素; reject anything that re-themes (brutalist Swiss type, soft pastel gradients, etc.).
- When the MCP and this skill disagree on boldness, **this skill wins** — it is the system-level coordinate. When they disagree on a generic tell, **the MCP wins** — it's the broader lint.

---

## Source of truth

- Design system: `/Users/satoshi01/sites/godxjp-ui/.design/bundle/dxs-kintai-design-system/README.md` and `project/README.md` / `project/SKILL.md`.
- Tokens: `colors_and_type.css` (mirrors `admin-web/src/app/globals.css`).
- Correctness gate (run first for component work): **godxjp-ui-component** skill.
- This skill governs *taste and UX judgement* on top of those. If a rule here and the design-system docs disagree, the docs win and this skill is updated.
