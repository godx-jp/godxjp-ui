---
name: design-complex-admin
description: >-
  Wireframe-first, layered information-architecture process for building or redesigning a COMPLEX
  multi-tier admin/console/back-office UI (platform admin, workspace admin, multi-tenant management,
  control panel). Forces the right order — lock the entity model → study exemplars → design a LAYERED
  IA → wireframe (as an Artifact) → validate → only THEN code — so the console mirrors the domain's
  administrative tiers instead of collapsing into a flat resource list. Read this BEFORE writing JSX
  for a many-layer console. For a single ordinary screen use compose-a-screen; for a design handoff
  bundle use design-to-page.
---

# Design a complex admin console — wireframe-first, layered IA

> 📦 **AUDIENCE: CONSUMER** — this is a **process** skill for an app-dev BUILDING WITH `@godxjp/ui`,
> not a library-maintenance skill. It is the authoritative write-up; the token-efficient version is
> **served by the `godxjp-ui` MCP** as the consumer skill `design-complex-admin`
> (`list_consumer_skills` → `route_consumer_task` → `get_consumer_skill design-complex-admin`). Any
> agent — Claude Code, Codex, Cursor — reaches it through the MCP without this repo. CORE↔CONSUMER
> map: `.claude/skills/README.md`.

**When to reach for it:** you are building or redesigning a console that spans several
**administrative tiers** (e.g. Platform → Org/Tenant → Brand → Org-unit → Shop → Staff) — not one
flat CRUD list. This is the exact process used to redesign `admin.godx.jp` (entity-tree concept →
layered wireframe → code). It exists to kill the **flat-console** failure mode: every resource
dumped in one list, create-form + list + detail crammed on one screen, no dashboards, no reflection
of the domain's real management layers.

**Hand-off:** this skill governs the _structure_ (IA, tiers, wireframe). The per-screen craft belongs
to the screen skills — **[[compose-a-screen]]** (build a screen from a brief) and
**[[design-to-page]]** (build from a Claude Design handoff bundle). Use them for each individual
route once the IA + wireframe are signed off.

**DO / DON'T (quick gate — full steps below):**

| ✅ DO                                                                                             | ⛔ DON'T                                                                          |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Lock an agreed entity model + get an approved wireframe **before** code                           | Open an editor at a flat "here are the resources" list and start coding           |
| Map every surface to an administrative **tier**; dashboard + list + detail as **separate routes** | A flat IA — every resource in one list; create-form + list + detail on one screen |
| Open with a **dashboard**: summary before detail (a few KPIs + ONE primary list)                  | An 8-stat-card wall; a tier with no summary; detail with nothing to orient it     |
| Compose the shell from real primitives (`AppShell`/`Sidebar`/`Topbar`/`Breadcrumb`)               | Hand-rolled nav (raw buttons), a styled `<div>` faking a Card, raw `<table>`      |
| Distinguish tiers/categories with cool hues (sky/teal/indigo/violet) **+ a label**                | Red/amber/orange for a category (reads as error/warning); colour-only meaning     |
| Encode "needs attention" **visually** (`Badge status`, StatCard `accent`, `Progress` tone)        | A bare number the eye can't triage; recolouring a category hue into a status role |
| Wireframe with **real content**, theme-aware, token-driven, then validate vs godx-ui              | Lorem wireframes; skipping validation; relitigating structure in built code       |

Each step below has a **gate** — do not advance until its artifact is signed off. Every run produces,
in order: **(1)** a stakeholder-confirmed concept/entity artifact → **(2)** a layered IA doc →
**(3)** an approved wireframe Artifact → **(4)** a per-route implementation checklist.

---

## Step 0 — Lock the ENTITY MODEL before you draw a pixel

Do **not** start at a flat list of resources. First produce a **concept artifact** and get it
confirmed by a stakeholder:

- every **entity** + its **cardinality** (1-N / N-N) + its **boundary** (tenant / RLS / subscription
  scope);
- the **identity split** — Principal/User (can log in, carries authz) **≠** Employee/Staff (a domain
  record that may never log in). Never fuse them in the IA;
- an explicit list of what is **OUT OF SCOPE / does not exist**, so the console doesn't invent tiers.

> **Worked example (`admin.godx.jp`):** Org = Tenant = 法人 · Brand · Org-unit (branch) · Shop =
> Branch · Staff · Principal = User. No code until this tree is agreed — a wrong entity model is a
> wrong console, and it is far cheaper to fix here than in built screens.

🔴 **Entity-category colour is NON-SEMANTIC.** Never use red/amber/orange to distinguish a
category — it reads as error/warning/danger. Reserve red strictly for a real `danger` action.
Differentiate tiers/categories with **cool hues** (sky/teal/indigo/violet) **+ a label**, never
colour alone (colour-only meaning also fails WCAG 2.2).

**Gate:** the entity tree + glossary + rules are written down and confirmed. No code yet.

## Step 1 — Study the best-in-class consoles for this domain

Before inventing structure, learn the IA of the strongest consoles of the same shape and plan to
reuse it: **Auth0, WorkOS, Stripe Connect, Cloudflare, Vercel, Supabase, Clerk** (pick the closest
to your domain). Extract the recurring patterns they converge on:

- a **top scope switcher** (change tenant/org/project) that re-scopes the whole shell;
- a **per-scope sidebar** (nav that changes with the active scope);
- **breadcrumb** trails + a **⌘K command palette** for deep navigation;
- a **"needs-attention"** surface (what's broken / pending now) on the landing dashboard;
- **first-run / empty / onboarding** states, not just the populated happy view.

These are the skeleton the layered IA hangs on — not decoration.

## Step 2 — Layered information architecture (never flat)

Reject the flat console. Map each admin surface onto an **administrative tier** of the domain
(Platform → Org/Tenant → Brand → Org-unit → Shop → Staff) so the nav mirrors how the business is
actually administered. Each tier gets its **own route set**, and CRUD is **split across routes**:

- an overview **dashboard** (summary of the tier: counts, health, needs-attention);
- a **list** route (browse/search the tier's entities);
- a **detail** route per entity (read + its sub-resources);
- **create / edit** as their own route or a focused `Dialog`/`Sheet` — **not** inlined beside the list.

🔴 The single worst anti-pattern this skill exists to kill: **create-form + list + detail crammed
onto one screen.** If you can't name the tier a screen belongs to, the IA isn't finished.

**Gate:** a layered IA doc — every surface named, assigned to a tier, with its dashboard/list/detail
routes enumerated.

## Step 3 — Scope model + shell chrome (real `@godxjp/ui` primitives)

Build the shell from **real primitives** (MCP-first — `get_component` before you wire a prop), never
hand-rolled nav:

- **`AppShell`** composes the frame; **`Sidebar`** is the **data-driven** nav rail (pass its items,
  never build nav from raw buttons) and **swaps with the active scope**; **`Topbar`** is a **pure
  slot bar** — drop the scope switcher into a slot (compose it from `Select`/`DropdownMenu`; use
  `AppSettingPicker` for the locale/theme/density/font axes). The shell bakes no chrome itself.
- **`Breadcrumb`** for the trail. A **⌘K command palette** is a **composition** (`Dialog` + `Input`
  - a results list / `DropdownMenu`) — there is **no** `Command` primitive, so build it from these,
    or, if you want a first-class one, file it with `draft_bug_report` rather than faking a primitive.
- **Landing = a dashboard:** summary **before** detail — a few **`StatCard`** KPIs in a
  **`ResponsiveGrid`** (StatCard is already bordered — never wrap it in `Card`/`CardContent`) + ONE
  primary list, not an 8-card wall.
- **Encode "needs attention" visually** — a `Badge` with `status`, a StatCard `accent` rail, a
  `Progress` tone — never a bare number the eye can't triage. Status uses the **fixed semantic
  mapping**; never recolour a category hue into a role.

## Step 4 — WIREFRAME FIRST (as an Artifact), then validate

Produce a **low-fidelity wireframe as an Artifact** and get it approved **before** writing
components — fixing structure in a wireframe is far cheaper than in built screens. It must:

- use **real content**, never lorem — real tier names, real entity fields, real empty/attention copy;
- be **theme-aware** (light + dark) and **token-driven** (semantic tokens, not raw hex) so it maps
  1:1 to the eventual `@godxjp/ui` build;
- cover the whole IA: the nav/scope model, the tier palette, **each** tier's dashboard/list/detail,
  plus **before/after** and **do/don't** panels so reviewers see the reasoning.

**Gate:** stakeholder sign-off on the wireframe. Only then move to code.

## Step 5 — Validate against godx-ui

Cross-check the wireframe against the system before building:

- the **cardinal rules** + **canonical patterns** (`get_rule` / `list_patterns` / `get_pattern`);
- the **ui-audit / visual-audit** lens;
- **anti-AI tells** (`list_anti_ai_tells`) — flat 8-stat walls, rainbow tag walls, category-as-error
  colour, placeholder-as-label.

## Step 6 — Only THEN code, route by route

Build one route at a time and hand off the per-screen craft to the screen skills rather than
re-deriving it here:

- each page is its **own route** (dashboard / list / detail / create split, per Step 2);
- every block is a real `@godxjp/ui` primitive — no hand-rolled UI, no raw `<input>/<select>/<table>`;
- a tier list = `PageContainer` + `Card` + `CardContent` **flush** + `DataTable`; a detail page =
  `Descriptions` + `StatCard`; no-data = `EmptyState`;
- **ui-audit clean** (0/0 semantic tokens), **tests ≥95%**.

**Hand-off:** use **[[compose-a-screen]]** (build a screen from a brief) or **[[design-to-page]]**
(from a handoff bundle) for each individual screen. If a needed block has no primitive, use
design-to-page's _gaps-extend-or-ask_ + _report-bug_ (`draft_bug_report`) — **never fake it**.

---

## Anti-patterns this skill blocks (reject on sight — each is a FINDING)

1. Code written **before** an agreed entity model **and** an approved wireframe exist.
2. A **flat IA** — every resource in one list, no administrative tiers.
3. **create-form + list + detail crammed onto one screen** (CRUD not split into routes).
4. A tier with **no dashboard/summary** — detail with nothing to orient it.
5. Category/tier coloured with **red/amber/orange** (reads as error/warning) — use cool hues + labels.
6. **Hand-rolled UI** instead of `@godxjp/ui` primitives (raw nav buttons, styled-div "Card", raw table).

## Self-track checklist (paste filled-in before you say "done")

```
[ ] Step 0 — entity/concept artifact written + stakeholder-CONFIRMED (tree + glossary + out-of-scope)
[ ] Step 1 — exemplar consoles studied; recurring IA patterns listed
[ ] Step 2 — layered IA doc: every surface → a tier; dashboard/list/detail routes enumerated
[ ] Step 3 — shell = AppShell/Sidebar(data-driven)/Topbar-slots/Breadcrumb; scope switcher composed
[ ] Step 4 — wireframe Artifact (real content, theme-aware, tokens, per-tier, before/after) APPROVED
[ ] Step 5 — validated vs cardinal rules + patterns + anti-AI tells (ui-audit / visual-audit lens)
[ ] Step 6 — each page its own route from real primitives; ui-audit 0/0; tests ≥95%; screens handed
             off to compose-a-screen / design-to-page
[ ] No anti-pattern (1–6 above) present
```
