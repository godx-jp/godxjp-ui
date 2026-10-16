---
name: godxjp-ui-navigation
description: Navigation design rules (sidebar menu, per-role landing page, phone bottom bar, links between pages, breadcrumbs, in-page tabs) for multi-role business apps built with @godxjp/ui. Use BEFORE adding or changing a menu item, adding a page, or changing a role's landing page, and whenever navigation is criticised as confusing ("I can't tell what anything in this menu is for"). Covers the procedure (tasks → menu tree → walkthrough → measure), 28 sourced rules (NN/g, Material 3, Apple HIG, GOV.UK, SAP Fiori, Shopify Polaris and others) and an illustrative pattern for inspection and compliance apps.
---

# Navigation for multi-role business apps (@godxjp/ui)

One question: **for a person in this role, doing this task, where does the first click go — and are
they sure it is right?** A menu is not a database diagram. A menu is each role's list of *tasks*,
ordered by frequency.

Distilled from measured failures in a real multi-role app: 17 menu items grouped by data type
("Records / Standards / Supplies / Master data"), three overlapping entries for one task ("Log an
inspection / Inspections / Checklists"), a Settings area that was a dead end, every role seeing every
item, and a phone layout with nothing but a drawer. The owner's verdict: *"I can't tell what anything
in this menu is for."* Full sources: [references/principles.md](references/principles.md) (28 rules,
with the URL behind each one). An app may keep its own industry benchmark notes (competitor
comparisons, domain vocabulary) in its own repository; they do not belong in this package.

## 1. Procedure — the order is the rule

1. **Tasks first, screens second.** For each role (e.g. frontline staff, branch manager, head-office
   reviewer), list their 5–10 *most frequent tasks* in their own words ("log this morning's opening
   checklist", "is this batch still within its expiry date", "which branches are late on their
   checklists"). Sort by frequency. This is the only input to the menu.
2. **Split into 3 zones: Do · Set up · Review.** Daily work goes at the top; setup (templates,
   recipes, configuration) goes in its own group or at the end; settings/admin go at the bottom.
3. **Write the menu tree as text for each role** (level 1 → level 2 → page). For each item: label,
   destination page, which roles see it.
4. **Walk through the tree (no users needed)** — 8–10 tasks per role, written WITHOUT the words used
   in the menu. At each level answer the 4 cognitive-walkthrough questions: will the user try to do
   the right thing · will they *notice* the right item · does the label *match* their goal · after
   clicking, can they tell they arrived. Record the expected first click and any **competing label**
   (two labels pulling at the same task = a defect). Critical tasks must be "certainly right" on the
   first click.
5. **Measure on the real app after building it** (a manual or agent-driven test pass): inventory
   every page → its entries and exits, which menu item is highlighted, dead ends, orphan pages. If
   you have users, run a tree test: critical tasks need >90% success.
6. Changing the menu structure is a **redesign** → bring a proposal (tree per role + old → new table +
   walkthrough results) to the project owner for approval before writing code.

## 2. Hard rules

**Count and form**
- Phone: **bottom bar with 3–5 items** (the middle one may be a ＋ quick-log button); everything else
  goes under "More". Never put setup on the bottom bar. Desktop: **an always-visible sidebar**, not
  only a ☰ button. Choose by window width, not by device. (@godxjp/ui's `MobileShell` has a bottom
  bar — use it; don't rely on a drawer alone.)
- Sidebar at most **2 levels**, groups with short headings; each role sees **≤ ~7 primary items**.
  Anything deeper → list → detail inside the page.

**Grouping and labels**
- Group by **task / work area**. Never group by data table, org chart or developer vocabulary
  ("Master data", generic "Records").
- A label is a short noun of 1–3 words, **in the words users say**, always with text (an icon only
  supports it). The page title (H1 and `<title>`) **matches** the menu label. One concept = one name
  everywhere, in every language (check every locale: e.g. not five strings sharing the root "記録"
  split across two groups).
- **Each destination appears once** in the menu. Two items leading to the same kind of record = a
  defect.
- Action buttons (Log/Create) are **not menu items**: one prominent primary button (top of the menu,
  or the ＋ in the middle of the bottom bar) for the #1 task; child objects are created right inside
  their parent's page.

**Per role**
- Each role has its **own fixed landing page**: frontline staff → "Today" (due, overdue, my tasks);
  managers/head office → "Overview" (completion rate, exceptions by branch).
- **Hide** items a role will never use (filter the menu by the current user's permissions); **dim it
  and say why** when it is only temporarily blocked. The menu never changes with data state.
- Branch scope is a single control (All / Group / Branch); a person who belongs to only one branch
  doesn't see it. Standards authored by head office carry a "From head office" label.

**Between pages**
- Lists are for finding; a detail page is for one object (top: key facts + actions; below: sections or
  tabs). Scanning a code opens the detail page directly.
- **No dead ends:** a detail page lists its related objects with a **count**, a few preview rows, a
  pre-filtered "View all" and an in-place "Create" — **both directions** (inspection → batch, and
  batch → its inspections).
- From a dashboard or notification, link **straight to the record**, or to a list that is *already
  filtered correctly* — never to an unfiltered list.
- Breadcrumbs show **hierarchy** (not history), from level 3 down; every crumb is a real page; the last
  crumb is the parent when the H1 already names the object; use the record's **real name**, not
  "Batch"/"Item". The breadcrumb and the highlighted menu item must name **the same parent**.
- In-page tabs: 1–2 words, the most-used tab first, with a count; tab state + filters + scope live **in
  the URL**; Back restores scroll position, page and filters. "All" sits in the same place on every
  page.
- Deep links rebuild the normal parent path (Back goes to the parent list). Every child page has a
  highlighted menu item — no page leaves the menu "with the lights off".

## 3. Illustrative pattern: inspection and compliance operations

An example only, for apps that run recurring checks across many sites:

- **Do / Set up / Review** are kept apart; templates are authored on desktop only.
- Typical set: Home · Inspections (records) · Templates · Schedule · **Actions** · Incidents · Assets ·
  Analytics · (Branches/Users in organization settings).
- A failed item is handled right **inside the flow** (a required step; 3 or more fields means a page or
  step, not a popup) → an "Open nonconformity" button right under the item; nonconformities/actions
  stay **permanently linked** to their source record.
- Staff land on "Today" plus a separate place for "Overdue/Missed"; managers land on a rate table plus
  exceptions.
- Phone bottom bar: 4–5 task items (e.g. Today · Inspections · ＋Log · Nonconformities · More).
- Vocabulary: avoid "Reports"/"レポート" as the label for *records* (in English "Reports" means
  analytics; in Japanese "レポート" often means an individual record).

## 4. Self-check gate (before asking for approval / before merging)

- [ ] A task table per role and a text menu tree per role exist; each role ≤ ~7 primary items; phone
      3–5 items.
- [ ] Walkthrough of 8–10 tasks per role: no step answered "no"; no pair of competing labels.
- [ ] No duplicate destinations; no grouping by data table; label = H1 = `<title>`, consistent across
      every locale.
- [ ] Menu filtered by permission; landing page per role; bottom bar present on phones.
- [ ] Page inventory: 0 dead ends, 0 orphan pages, every child page has a highlighted menu item that
      matches its breadcrumb.
- [ ] Every detail page links both ways to related objects, with counts and a pre-filtered "View all".
- [ ] Tabs/filters/scope live in the URL; Back keeps the position.
- [ ] Structural change → the project owner has approved the proposal.

When @godxjp/ui can't do something you need (bottom bar, menu filtering, scope switcher), open an issue
on the @godxjp/ui repository with the use case instead of hand-rolling it (the same rule as the
`godxjp-ui-form` skill).
