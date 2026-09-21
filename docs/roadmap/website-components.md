# Website & marketing surfaces — the plan

> **Status:** proposed · 2026-09-21 · branched from `main` at `76076266`
>
> **Contract:** `docs/COMPOSITION-VS-COMPONENT.md` (GATE 0) · `docs/DESIGN-AUTHORITY.md` (antd is the
> standard) · `docs/SPACING.md` · `docs/TOKENS.md` · `.claude/skills/godxjp-ui-component/SKILL.md`.
> **Antd reference version: `antd@6.6.5`** (read from the repo's `package.json` on 2026-09-21, and
> every API table below was fetched from `ant-design/ant-design@master` on that date — not recalled).
> Pin the version when re-auditing, per `docs/roadmap/parity-backlog.md`.
>
> This document decides **what belongs where**. It adds no component and writes no code. Its only
> claim is that the two halves below — a small set of behaviour-bearing components, and a set of
> compositions whose missing pieces are TOKENS and PROPS — together close the website gap without
> smuggling a `Hero` into `src/components/`.

---

## 0. Re-deriving every number in this document

```bash
# catalog shape (§1)
python3 -c "import json,glob,collections; g=collections.Counter(json.load(open(f))['group'] for f in glob.glob('agent/components/*.json')); print(sum(g.values()), g.most_common())"
# what the marketing showcases had to hand-write (§5)
grep -c 'font-size: [0-9.]*rem' docs/showcase/acme-website.tsx docs/showcase/futurelastic-web.tsx
# components that publicly own scroll position (§4.1)
grep -rln 'IntersectionObserver' src/components/ | grep -v __tests__
# the display type ramp, and who reads it
grep -rn 'font-size-display\|font-size-5xl\|font-size-4xl\|font-size-3xl' src/ | grep -v tokens/foundation.css
```

---

## 1. The measured gap

**165 catalogued components** (`agent/components/*.json`, at `76076266`):

| group        | n   | share  |
| ------------ | --- | ------ |
| data-display | 45  | 27.3 % |
| data-entry   | 45  | 27.3 % |
| layout       | 29  | 17.6 % |
| feedback     | 20  | 12.1 % |
| general      | 14  | 8.5 %  |
| navigation   | 9   | 5.5 %  |
| providers    | 3   | 1.8 %  |

`data-entry + data-display` = **90 / 165 = 54.5 %**. The owner's "55 % form-and-table" is confirmed
to a tenth of a point. Two sharper numbers matter more than that one, because they name the missing
_capability_ rather than the missing _category_:

1. **Navigation is 5.5 % of the library, and none of it is site navigation.** All nine entries
   (`AppSettingPicker`, `AppSettingToggle`, `Conversations`, `DropdownMenu`, `FilterBar`,
   `Pagination`, `Steps`, `Tabs`, `Toolbar`) are in-app chrome. There is no horizontal site nav, no
   nav panel, no in-page section nav.
2. **Almost nothing in the library reacts to scroll position, and what does is private.**
   `grep -rln IntersectionObserver src/components/` returns exactly **one non-test file**:
   `src/components/layout/page-container.tsx`, where `useRevealOnScroll` (`:28-44`) powers
   `PageContainer footerReveal="onScroll"` and is not exported. The only public scroll-aware API in
   165 components is `FloatButton.BackTop` (`visibilityHeight`, `target`). A website is built out of
   scroll-position behaviour; the library has one instance of it and keeps the machinery private.

**The marketing showcases already exist and already measure the cost.** `docs/showcase/acme-website.tsx`
and `docs/showcase/futurelastic-web.tsx` are complete landing pages built to the doctrine — real
primitives, token configuration, zero new components. That is the good news, and the receipts are the
bad news:

| showcase           | bespoke CSS classes | CSS declarations | raw `px`/`rem` literals |
| ------------------ | ------------------- | ---------------- | ----------------------- |
| `acme-website`     | 26                  | 97               | 47                      |
| `futurelastic-web` | 32                  | 123              | 77                      |

**58 bespoke classes and 124 raw length literals**, and the two lists overlap almost exactly:
`shell`, `section`, `display`, `h2`, `lead`, `eyebrow`, `navbar`, `navbar-inner`, `brand`, `gold`,
`medallion`, `footer-grid`, `footer-bottom`, plus a hand-written radial `glow` in both. When two
independent brands hand-write the same thirteen classes, that is not brand styling. That is a
**missing token and a missing prop**, which is precisely what §4 of the doctrine says to fix:

> _"Resolve every visual gap with a TOKEN … If the token doesn't exist, **add the token to the
> framework** (extensibility), never bake a value into the composition."_

So the gap is **not** "there is no Hero". The gap is:

- **(a)** four or five pieces of genuine scroll/overlay **behaviour** that do not exist at all, and
- **(b)** a marketing **token + prop surface** so thin that every composition re-invents it.

---

## 2. The doctrine, and one place I think it is wrong

§2 of `COMPOSITION-VS-COMPONENT.md` is binding and this plan does not ask to relax it: all seven
criteria, or it is a composition. Everything in §5 below stays out of `src/components/`, under its
own name and under any other name — a `Hero` called `Banner`, `Section`, `MarketingBlock` or
`LandingShell` is the same refused component with the evidence filed off.

Two corrections I do ask for, in writing, because the plan leans on both.

### 2.1 The §3 worked-examples table scores `❌ ×7`, and that is not true of C5/C6

`Marketing Hero`, `Navbar`/`Footer` and `PricingTable` are each recorded as failing **all seven**
criteria. C5 is _"fully token-themeable, zero baked brand"_ and C6 is _"earns the international
contract"_. A `❌` on C5 for a Hero reads as "a hero cannot be expressed from tokens" — which
contradicts §4 of the same document, and is disproved by `docs/showcase/acme-website.tsx`, whose
entire purpose was proving that it can. C6 is likewise not a failure: a marketing page owes heading
order, `lang`, RTL and `Intl` exactly like any other page; what it does not owe is a _component's_
ARIA contract.

The verdicts are right. The ledger is sloppy, and a sloppy ledger teaches the next author to score
every cell `❌` once they know the answer — which is how a real `C2` PASS gets buried. **Proposed
edit** (verdicts unchanged):

| row                             | C1  | C2  | C3  | C4  | C5  | C6  | C7  | verdict         |
| ------------------------------- | --- | --- | --- | --- | --- | --- | --- | --------------- |
| Marketing **Hero**              | ❌  | ❌  | ❌  | ❌  | ✅  | ➖  | ❌  | **Composition** |
| **Navbar** / **Footer**         | ❌  | ❌  | ❌  | ❌  | ✅  | ➖  | ❌  | **Composition** |
| **PricingTable** / feature grid | ❌  | ❌  | ❌  | ❌  | ✅  | ➖  | ❌  | **Composition** |

C1/C2/C3/C4/C7 are the criteria that decide these, and they decide them decisively. That is a
stronger position, not a weaker one: it says the rejection rests on _behaviour and universality_,
the two things §2 actually cares about, rather than on an unbelievable clean sweep.

(The `PricingTable` row also has a stale note — "`ResponsiveGrid` + `Card`". Since it was written the
library shipped `FeatureList`, which is the included/limited/excluded tier list. Pricing is now
_more_ composable than the row says, not less.)

### 2.2 C7 says "bundle cost" but the package is not bundled

`tsup.config.ts` sets `bundle: false` with one output file per source module, precisely so that
"per-component imports tree-shake perfectly". A component no consumer imports therefore costs a
consumer **zero bytes**. C7 as literally written ("earns its bundle cost … worth shipping to _every_
consumer") measures something the build no longer does.

This is not academic: `docs/roadmap/parity-backlog.md` defers antd's `Image` preview (the lightbox)
with the reason _"pass on merit but fail C7 (bundle cost)"_. If C7 means bytes, that reason has
expired. If C7 means **maintenance surface, API surface and the i18n/a11y/MCP contract per
component** — which is the real and quite sufficient cost — then the deferral stands and should be
restated in those terms. I recommend restating C7 as _"earns its maintenance and contract cost"_
and leaving the `Image` deferral in place on the restated ground (§4.6).

---

## 3. The whole plan in one table

**Framework components (C1–C7 all PASS) — 5 definite, 2 conditional:**

| #                                    | thing                               | antd source                                  | what makes it C2/C3                                                           | verdict                    |
| ------------------------------------ | ----------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------- |
| [4.1](#41-affix)                     | sticky / shrinking header on scroll | **`Affix`**                                  | scroll-threshold state + a placeholder that prevents the reflow jump          | **Component**              |
| [4.2](#42-anchor)                    | scrollspy anchor nav                | **`Anchor`**                                 | which section is current, from scroll + hash, with the ink indicator          | **Component**              |
| [4.3](#43-menu-mode--horizontal)     | MegaMenu                            | **`Menu` `mode="horizontal"`**               | disclosure-navigation: roving triggers, shared viewport, hover intent, Escape | **Component** (riskiest)   |
| [4.4](#44-reveal-gains-onview)       | scroll-reveal                       | — (extend the existing `Reveal`)             | enter-viewport trigger; `Reveal` today fires on mount only                    | **Extend, do not add**     |
| [4.5](#45-marquee)                   | marquee / ticker                    | — (`react-fast-marquee` is the prior art)    | measured cloning + the **WCAG 2.2.2 pause control** a hand-roll always omits  | **Component**              |
| [4.6](#46-conditional-image-preview) | lightbox / gallery                  | **`Image` + `Image.PreviewGroup`**           | zoom/pan/rotate, focus trap, group paging                                     | **Conditional — deferred** |
| [4.7](#47-conditional-countup)       | animated counter                    | — (antd has none; `react-countup` prior art) | rAF tween + `Intl` + one polite announcement, not sixty                       | **Conditional**            |

**Compositions (a `docs/` showcase + the named token, never `src/components/`):**

| thing                 | built from                                                                                  | missing piece                                                  |
| --------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Hero                  | `Flex` · `ResponsiveGrid`+`Item` · `Heading` · `Text` · `Button` · `AspectRatio` · `Reveal` | display type **prop**, band spacing, `.ui-brand-glow` adoption |
| Navbar                | `Topbar` · `Logo` · `Button` · `Menu`(4.3) · `Sheet` · `Affix`(4.1)                         | `--topbar-background-alpha`, `--topbar-backdrop-blur-size`     |
| Footer                | `ResponsiveGrid columns={12}` + `Item span` · `Separator` · `Text link` · `Logo`            | none — **document `ResponsiveGrid.Item`**                      |
| Pricing table         | `ResponsiveGrid` · `Card accent` · `FeatureList` · `Badge` · `Segmented` · `Button`         | none                                                           |
| Feature grid          | `ResponsiveGrid` · `Card` · `Avatar`+glyph · `Heading` · `Text`                             | none                                                           |
| CTA band              | `Card variant` + per-region role scoping · `Button` · `Heading`                             | band spacing; `--gradient-brand` needs a call site             |
| Testimonial / quotes  | `Card` · `Avatar` · `Text` · `Carousel`                                                     | none                                                           |
| Logo wall             | `Flex wrap` / `ResponsiveGrid` · `Thumbnail` · optionally `Marquee`(4.5)                    | none                                                           |
| Section band / shell  | `PageContainer` · `Flex`                                                                    | `--phi-p3/p4`, `--space-band*`, `--page-measure-wide`          |
| "Icon medallion"      | `Avatar` (square) + Lucide glyph                                                            | none (already ruled, §3 of the doctrine)                       |
| BorderBeam (antd 6.4) | a themed CSS class in the consumer stylesheet                                               | none — see §8                                                  |

**Already exists — do NOT build (the anti-duplication list):**

| you were about to build      | it is already                                 | where                                                            |
| ---------------------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| back-to-top button           | `FloatButton.BackTop`                         | `visibilityHeight`, `target` — antd's own API                    |
| slider / testimonial rotator | `Carousel`                                    | Embla; `CarouselDots`, auto-disabling arrows                     |
| pricing feature ticks        | `FeatureList`                                 | included / limited / excluded glyphs                             |
| monthly↔yearly switch        | `Segmented`                                   | with `count`/`overflowCount`                                     |
| FAQ                          | `Accordion`                                   | (fix its hardcoded `<h3>` — parity-backlog P1)                   |
| entrance animation           | `Reveal`                                      | staggered fade-up on the motion tokens                           |
| hero halo                    | `.ui-brand-glow` + `--brand-glow-*`           | `src/styles/layout.css:125`                                      |
| hero display type            | `--font-size-display` / `3xl` / `4xl` / `5xl` | `src/tokens/foundation.css:513-521`                              |
| contact form                 | `Form` + `Field` + `useZodForm`               | already the richest part of the library                          |
| media frame                  | `AspectRatio`, `Thumbnail`, `CardCover`       |                                                                  |
| masonry gallery              | **in flight** — `Masonry`, another agent      | `docs/roadmap/list-masonry.md` §2 — **not touched by this plan** |
| long virtual feed            | **in flight** — `List` (antd `Listy`)         | `docs/roadmap/list-masonry.md` §1                                |

---

## 4. Framework components — ledgers and antd APIs

### 4.1 `Affix`

**antd has it, by that name.** `antd@6.6.5` `Affix`, fetched 2026-09-21:

| antd prop      | type                                  | default        |
| -------------- | ------------------------------------- | -------------- |
| `offsetTop`    | `number`                              | `0`            |
| `offsetBottom` | `number`                              | –              |
| `target`       | `() => Window \| HTMLElement \| null` | `() => window` |
| `onChange`     | `(affixed?: boolean) => void`         | –              |

#### GATE 0 ledger

| #   | criterion               | verdict  | why                                                                                                                                                                                                                                                |
| --- | ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Universal               | **PASS** | A sticky toolbar over a long table, a sticky filter rail, a sticky form footer, a sticky site header. Admin needs this as much as marketing does.                                                                                                  |
| C2  | Reusable behaviour      | **PASS** | Observes a scroll container against a threshold, and — the part every hand-roll gets wrong — renders a **placeholder of the measured size** so the page does not jump when the element pins. Re-measures on resize. Emits `onChange`.              |
| C3  | Not composable          | **PASS** | `position: sticky` alone cannot report "am I pinned", so the shrink/condense state is unreachable, and it cannot pin against a scrolling ancestor that is not the nearest one. Both showcases wrote `position: sticky` and got no state out of it. |
| C4  | Single job + vocabulary | **PASS** | One job. antd's `offsetTop`/`offsetBottom` become logical `offsetBlockStart` / `offsetBlockEnd` (the `left`→`start` precedent in DESIGN-AUTHORITY); `target` keeps antd's lazy-getter shape, exactly as `FloatButton.BackTop` already spells it.   |
| C5  | Token-themeable         | **PASS** | It sets geometry, not paint. `--affix-inset-block-start`, `--affix-z-index`.                                                                                                                                                                       |
| C6  | Earns the contract      | **PASS** | A pinned header must not cover the focused element (`scroll-margin-block-start`) and must not trap `Skip to content`. That is an accessibility contract, not a style.                                                                              |
| C7  | Earns its cost          | **PASS** | Small, and it is the substrate for 4.2 and for the sticky Navbar composition.                                                                                                                                                                      |

**ALL PASS → framework component.**

**Fix upstream while porting.** `PageContainer`'s private `useRevealOnScroll` (`page-container.tsx:28-44`)
is two thirds of this component, locked inside one consumer. Extract it, let `Affix` own it, and let
`footerReveal="onScroll"` read the shared implementation — otherwise the library ships the behaviour
twice and tests it once.

**Deliberately NOT ported:** nothing. Do port `onChange`; the shrinking header depends on it.

**Reduced motion:** `Affix` itself animates nothing. The _shrink_ is a composition: a
`data-affixed` attribute plus a height/padding transition on `--duration-fast`/`--ease-standard`.
Under `prefers-reduced-motion: reduce` the header **snaps** to the condensed size — it still
condenses, it just does not tween. It must never fade or disappear.

---

### 4.2 `Anchor`

**antd has it, by that name.** `antd@6.6.5` `Anchor`, fetched 2026-09-21:

| antd prop                    | type                                                            | default                  |
| ---------------------------- | --------------------------------------------------------------- | ------------------------ |
| `items`                      | `{ key, href, title, target, children }[]`                      | –                        |
| `direction`                  | `vertical \| horizontal`                                        | `vertical`               |
| `affix`                      | `boolean \| Omit<AffixProps,'offsetTop'\|'target'\|'children'>` | `true`                   |
| `bounds`                     | `number`                                                        | `5`                      |
| `getContainer`               | `() => HTMLElement`                                             | `() => window`           |
| `getCurrentAnchor`           | `(activeLink: string) => string`                                | –                        |
| `offsetTop` · `targetOffset` | `number`                                                        | `0` · –                  |
| `showInkInFixed`             | `boolean`                                                       | `false`                  |
| `replace`                    | `boolean`                                                       | `false`                  |
| `onChange` · `onClick`       | `(currentActiveLink) => void` · `(e, link) => void`             | –                        |
| `items[].children`           | `AnchorItem[]`                                                  | – (one level of nesting) |

Note antd's own `affix` prop takes `AffixProps` — **`Anchor` is specified on top of `Affix`**, which
is why 4.1 comes first in the ordering.

#### GATE 0 ledger

| #   | criterion               | verdict  | why                                                                                                                                                                                                                                     |
| --- | ----------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Universal               | **PASS** | A long settings page, a legal document, API docs, a marketing page's section nav. `LegalDocumentShell` exists here and has **no** table of contents.                                                                                    |
| C2  | Reusable behaviour      | **PASS** | Resolving "which section is current" from scroll position with a bounds tolerance, keeping the hash in sync without fighting the back button, moving an ink indicator, and smooth-scrolling with an offset that clears a pinned header. |
| C3  | Not composable          | **PASS** | Nothing in the library observes section visibility. `NavList activeId` takes the answer as a prop — it does not compute it.                                                                                                             |
| C4  | Single job + vocabulary | **PASS** | `items` matches `NavList`/`Breadcrumb`. `getCurrentAnchor` stays (it is antd's controlled escape hatch); `offsetTop`/`targetOffset` become logical `offsetBlockStart`/`targetOffsetBlockStart`.                                         |
| C5  | Token-themeable         | **PASS** | `--anchor-ink-width`, `--anchor-ink-color`, `--anchor-item-height`, `--anchor-gap`.                                                                                                                                                     |
| C6  | Earns the contract      | **PASS** | `<nav>` + `aria-current="location"` (not `"page"` — it is a fragment of the current page), and the scroll must not steal focus. Everyone gets this wrong.                                                                               |
| C7  | Earns its cost          | **PASS** | Small; every documentation and marketing page wants one.                                                                                                                                                                                |

**ALL PASS → framework component.**

**Deviations to write down:** physical→logical offsets (above); `direction` stays antd's word since
`Separator`/`Flex` already spell orientation that way — check against `check:prop-vocabulary` before
committing to it. `showInkInFixed` is antd's fix for its own default; keep the behaviour, and if the
name survives review keep the name.

**Reduced motion:** the scroll on click uses `behavior: "smooth"` normally and `"auto"` under
`prefers-reduced-motion: reduce` — it still jumps to the section, instantly. The ink indicator
transitions on `--duration-fast`; reduced motion **snaps** it to the active item. The current item is
never conveyed by motion alone.

---

### 4.3 `Menu` (`mode="horizontal"`) — the MegaMenu

**antd has it, and it is not called MegaMenu.** In antd a megamenu is `Menu mode="horizontal"` whose
`SubMenuType` renders a custom panel through `popupRender`. `antd@6.6.5` `Menu`, fetched 2026-09-21:

| antd prop                                        | type                                                                                               | default                    |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------- | -------------------------- |
| `items`                                          | `ItemType[]`                                                                                       | –                          |
| `mode`                                           | `vertical \| horizontal \| inline`                                                                 | `vertical`                 |
| `selectedKeys` / `defaultSelectedKeys`           | `string[]`                                                                                         | –                          |
| `openKeys` / `defaultOpenKeys`                   | `string[]`                                                                                         | –                          |
| `triggerSubMenuAction`                           | `hover \| click`                                                                                   | `hover`                    |
| `subMenuOpenDelay` / `subMenuCloseDelay`         | `number` (seconds)                                                                                 | `0` / `0.1`                |
| `overflowedIndicator`                            | `ReactNode`                                                                                        | `<EllipsisOutlined />`     |
| `expandIcon` · `forceSubMenuRender`              | `ReactNode \| fn` · `boolean`                                                                      | – · `false`                |
| `popupRender`                                    | `function`                                                                                         | – (**the megamenu panel**) |
| `selectable` · `multiple`                        | `boolean`                                                                                          | `true` · `false`           |
| `theme`                                          | `light \| dark`                                                                                    | `light`                    |
| `onClick`/`onSelect`/`onDeselect`/`onOpenChange` | `function`                                                                                         | –                          |
| `SubMenuType`                                    | `{ key, label, icon, children, popupClassName, popupOffset, popupRender, onTitleClick, disabled }` |                            |
| `MenuItemType`                                   | `{ key, label, icon, extra, title, danger, disabled }`                                             |                            |

**Behavioural prior art for the implementation** (not for the name): Radix `NavigationMenu` —
`Root(value/defaultValue/onValueChange/delayDuration=200/skipDelayDuration=300/orientation)`, `List`,
`Item(value)`, `Trigger`, `Content(onEscapeKeyDown/onPointerDownOutside/forceMount)`, `Link(active/onSelect)`,
`Indicator`, `Viewport`, `Sub`. Its accessibility note is the important part: it follows the **W3C
disclosure-navigation** pattern and deliberately does **not** use `menu`/`menubar` roles, which "are
often considered unnecessary for website navigation".

> ⚠️ **Do not add `@radix-ui/react-navigation-menu`.** `scripts/check-radix-surface.mjs` is a ratchet:
> _"a declared package with no baseline entry → red"_, and the library is mid-migration onto
> `react-aria-components`. Radix is the **pattern** reference here, not the dependency. RAC 1.21.1
> (already installed) ships `Disclosure`, `DisclosureGroup`, `Toolbar`, `Popover`, `NavigationTree`
> — no navigation-menu — so the disclosure-nav composition has to be assembled from those plus
> `react-aria`'s hover/focus utilities. **Budget for that**; it is the reason this item is ranked
> riskiest.

#### GATE 0 ledger

| #   | criterion               | verdict  | why                                                                                                                                                                                                                                                                                          |
| --- | ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Universal               | **PASS** | Every public-facing product has a top nav; so does every admin with more than one product area. `AppLauncher` already fakes part of this with a launchpad.                                                                                                                                   |
| C2  | Reusable behaviour      | **PASS** | Roving focus across triggers; hover-intent open/close delays; one shared viewport so panels cross-fade instead of stacking; Escape closes and returns focus; **Tab moves out of the whole nav, not through 40 hidden links**; overflow collapse; RTL arrow inversion.                        |
| C3  | Not composable          | **PASS** | `DropdownMenu` is the **wrong** primitive, not merely an awkward one: it is `role="menu"`, whose children must be `menuitem`s with menu keyboard semantics. A row of them announces a desktop application menubar for a set of links, and cannot host a panel of headings, links and images. |
| C4  | Single job + vocabulary | **PASS** | `items` (as `Breadcrumb`/`NavList`), `open`/`defaultOpen`/`onOpenChange` for the panel (the house overlay triad, replacing antd's `openKeys` array), `value`/`defaultValue`/`onValueChange` for the current section.                                                                         |
| C5  | Token-themeable         | **PASS** | `--menu-item-height`, `--menu-panel-background`, `--menu-panel-shadow`, `--menu-ink-color`. antd's `theme: light \| dark` is **not** ported — this library inverts by role scoping, as the acme showcase's navy region does.                                                                 |
| C6  | Earns the contract      | **PASS** | This is a component whose entire risk is ARIA and keyboard. It is exactly what C6 exists to pay for.                                                                                                                                                                                         |
| C7  | Earns its cost          | **PASS** | Not small, and worth it: it is the single largest thing standing between this library and a website.                                                                                                                                                                                         |

**ALL PASS → framework component.** But see the ordering (§7): it goes last of the definites, on its
own issue, because it is the only item here that can fail on its own merits.

**The name is a real decision, and it needs the owner.** DESIGN-AUTHORITY says take antd's name, so
the component is **`Menu`**. But antd's `Menu` also covers `vertical` and `inline`, which are
`Sidebar` and `NavList` here — porting all three modes would duplicate two shipped components, and
"do not duplicate what exists" is parity ground-rule 3. **Recommendation:** ship `Menu` with
`mode?: "horizontal"` as the only member today, with the catalog entry stating plainly that
`vertical` → `NavList` and `inline` → `Sidebar`, so the union can grow later without a rename. The
alternative — a house name like `NavMenu` — is a deviation from DESIGN-AUTHORITY and must not be
taken silently.

**Reduced motion:** panel open/close is an opacity+transform on `--duration-fast`/`--ease-standard`.
Under reduced motion the panel **appears and disappears instantly**; nothing about open/closed is
carried by the animation. The indicator that slides between triggers snaps. Hover-intent delays are
_timing_, not motion, and stay — they are what stops the nav flickering under a moving pointer.

---

### 4.4 `Reveal` gains `on="view"` — extend, do not add

**`Reveal` already exists** (`general`, `delay: 0..6`, `asChild`) and is the official entrance
primitive. It animates **on mount**: `src/styles/motion.css` is a plain CSS `animation … both` with
`data-reveal-delay` steps. There is no viewport trigger anywhere in the library.

**A second component would be the duplication this repo keeps paying to delete.** The verdict is
therefore an extension, and the ledger is the extension's:

| #   | criterion               | verdict  | why                                                                                                                                    |
| --- | ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Universal               | **PASS** | Long pages of any kind, not only marketing.                                                                                            |
| C2  | Reusable behaviour      | **PASS** | One shared `IntersectionObserver` with a threshold and a once-latch, plus an SSR/jsdom-safe fallback that renders content **visible**. |
| C3  | Not composable          | **PASS** | No primitive observes viewport entry (§1, measurement 2).                                                                              |
| C4  | Single job + vocabulary | **PASS** | Adds `on?: "mount" \| "view"` (default `"mount"`, so nothing changes), plus `once?: boolean` and `amount?: "some" \| "all" \| number`. |
| C5  | Token-themeable         | **PASS** | Unchanged: `--reveal-distance`, `--reveal-stagger-step`, `--duration-slow`, `--ease-emphasized`.                                       |
| C6  | Earns the contract      | **PASS** | The failure mode is content that never becomes visible. That is a WCAG failure, and it belongs behind one tested implementation.       |
| C7  | Earns its cost          | **PASS** | One file, one observer.                                                                                                                |

**antd has nothing.** Nearest prior art: Motion's `useInView(ref, { root, margin, once, amount, initial })`
— **borrow `once` and `amount` verbatim**, including `amount: "some" | "all" | number`. Do **not**
add `motion`/`framer-motion` as a dependency: the library has no animation runtime today (`package.json`
has none) and this needs ~20 lines of `IntersectionObserver`.

**Reduced motion:** unchanged and non-negotiable — under `prefers-reduced-motion: reduce` the
animation is dropped and the content renders **final, fully visible, in place**. With `on="view"`
there is one extra rule: the observer must not gate _visibility_, only the animation, so a browser
with no `IntersectionObserver` (and jsdom) shows everything. Never `opacity: 0` as the resting state
in the stylesheet.

---

### 4.5 `Marquee`

**antd has nothing.** Verified by listing the 83 component directories of `ant-design/ant-design@master`
on 2026-09-21: no `marquee`, no `ticker`. Nearest prior art, **`react-fast-marquee`** (1.5k★):

| prior-art prop                                 | type                                    | default                    |
| ---------------------------------------------- | --------------------------------------- | -------------------------- |
| `play` · `pauseOnHover` · `pauseOnClick`       | `boolean`                               | `true` · `false` · `false` |
| `direction`                                    | `left \| right \| up \| down`           | `left`                     |
| `speed`                                        | `number` (px/s)                         | `50`                       |
| `delay` · `loop`                               | `number` · `number` (`0` = ∞)           | `0` · `0`                  |
| `autoFill`                                     | `boolean`                               | `false`                    |
| `gradient` · `gradientColor` · `gradientWidth` | `boolean` · `string` · `number\|string` | `false` · `white` · `200`  |
| `onFinish` · `onCycleComplete` · `onMount`     | `() => void`                            | –                          |

Its README documents **no accessibility or reduced-motion behaviour at all**, which is the argument
for owning this rather than telling consumers to install it.

#### GATE 0 ledger

| #   | criterion               | verdict  | why                                                                                                                                                                                                                                                                                                                |
| --- | ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C1  | Universal               | **PASS** | Logo walls, announcement tickers, status strips, "now processing" rails. Weaker than `Affix`, but not marketing-only.                                                                                                                                                                                              |
| C2  | Reusable behaviour      | **PASS** | Measuring content, cloning enough copies to fill the track seamlessly (`autoFill`), keeping the clones out of the accessibility tree, pausing on hover **and on focus**, and honouring an explicit play/pause control.                                                                                             |
| C3  | Not composable          | **PASS** | Nothing loops content. A CSS-only marquee cannot know how many copies it needs, and breaks at every width.                                                                                                                                                                                                         |
| C4  | Single job + vocabulary | **PASS** | `direction: "start" \| "end"` (logical, not `left`/`right`), `speed` as a token ordinal rather than raw px/s, `play`/`defaultPlay`/`onPlayChange` for the triad, `pauseOnHover`.                                                                                                                                   |
| C5  | Token-themeable         | **PASS** | `--marquee-gap-inline`, `--marquee-mask-width` for the edge fade (a mask, not antd-style `gradientColor`, which cannot follow a themed background).                                                                                                                                                                |
| C6  | Earns the contract      | **PASS** | **This is the whole case.** WCAG 2.2.2 (Pause, Stop, Hide) makes a pause mechanism a conformance requirement for content that moves for more than five seconds. Every hand-rolled marquee omits it. One framework component with a built-in, labelled pause control is how the library stops shipping that defect. |
| C7  | Earns its cost          | **PASS** | Tiny; CSS transform plus a measurement.                                                                                                                                                                                                                                                                            |

**ALL PASS → framework component**, with one gate of its own: **it does not merge without the pause
control and the `prefers-reduced-motion` test.** If the pause control is cut, the component is a
liability and should not exist.

**Reduced motion:** under `prefers-reduced-motion: reduce` the marquee **does not animate**. The
track renders as a static, horizontally scrollable row — every item still reachable by keyboard and
by scroll, nothing hidden, no clones. The cycle duration is `--marquee-interval`, declared in
`foundation.css` beside `--activity-interval`, following the precedent recorded there (component
token names must carry a geometry/colour property word and there is none for a duration).

---

### 4.6 Conditional — `Image` / `Image.PreviewGroup` (lightbox)

**antd has it, and the correct name is `Image`, not `Lightbox`.** `antd@6.6.5`, fetched 2026-09-21:

| `Image`                            | type                                   | default |
| ---------------------------------- | -------------------------------------- | ------- |
| `src` · `alt` · `width` · `height` | `string` · `string` · `string\|number` | –       |
| `preview`                          | `boolean \| PreviewType`               | `true`  |
| `placeholder` · `fallback`         | `PlaceholderType` · `string`           | –       |
| `onError`                          | `(event) => void`                      | –       |

| `PreviewType` / `PreviewGroupType`                           | type                                        | default            |
| ------------------------------------------------------------ | ------------------------------------------- | ------------------ |
| `open` · `onOpenChange`                                      | `boolean` · `(open) => void`                | –                  |
| `movable` · `wheel` · `focusTrap`                            | `boolean`                                   | `true`             |
| `minScale` · `maxScale` · `scaleStep`                        | `number`                                    | `1` · `50` · `0.5` |
| `mask`                                                       | `boolean \| { enabled?, blur?, closable? }` | `true`             |
| `imageRender` · `actionsRender` · `closeIcon` · `cover`      | render props                                | –                  |
| `getContainer` · `rootClassName`                             | –                                           | –                  |
| `onTransform`                                                | `{ transform, action }`                     | –                  |
| group-only: `current` · `countRender` · `onChange` · `items` |                                             | –                  |

**The ledger passes on merit** — `parity-backlog.md` already found that, and I agree: C2 (zoom, pan,
wheel scaling, focus trap, group paging) and C3 (`Dialog` + `Thumbnail` gives you a big picture in a
box and nothing else) are clear PASSes. It was deferred on **C7**, and §2.2 above argues C7's stated
reason (bytes) no longer matches the build.

**Verdict: stay deferred, on the restated C7 (maintenance + contract cost), with an explicit
re-decision trigger.** Re-open it when **two or more** of the planned showcase pages need a real
viewer — a product gallery and a case-study page would do it — and decide it then with that number
in hand. Until then the existing catalog note stands: **no hand-rolled lightboxes**. If it is built,
note that `react-aria-components@1.21.1` already ships `SharedElementTransition` / `SharedElement(name)`
— the thumbnail→full-size zoom, in a dependency the library already has.

**Reduced motion:** the open transition is a scale+fade on `--duration-base`; under reduced motion
the viewer **appears instantly** at full size. Zoom and pan are user-driven and stay — they are
direct manipulation, not decorative motion.

---

### 4.7 Conditional — `CountUp` (animated counter)

**antd has nothing for this, and the near-miss is a trap.** `Statistic.Timer` (5.25.0+) has
`type: 'countdown' | 'countup'`, but it counts **elapsed time** against `value` as a timestamp with a
`HH:mm:ss` format — it is not a number tween. `Statistic` itself is static (`value`, `precision`,
`decimalSeparator`, `groupSeparator`, `prefix`, `suffix`, `formatter`, `loading`). Nearest prior art,
**`react-countup`** (2k★): `start=0`, `end`, `duration=2`, `decimals=0`, `separator`, `decimal='.'`,
`prefix`, `suffix`, `useEasing=true`, `easingFn`, `formattingFn`, `enableScrollSpy`, `scrollSpyDelay`,
`scrollSpyOnce`, `preserveValue=false`, `onStart`, `onEnd`, plus a `useCountUp` hook.

| #   | criterion               | verdict  | why                                                                                                                                                                                                                                        |
| --- | ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C1  | Universal               | **➖**   | Honestly: it is a marketing flourish. An admin KPI that animates is usually a bug. antd's deliberate absence is a data point against.                                                                                                      |
| C2  | Reusable behaviour      | **PASS** | rAF tween with an easing curve, cancel-on-unmount, resume on value change, and the announcement discipline.                                                                                                                                |
| C3  | Not composable          | **PASS** | Nothing tweens a number.                                                                                                                                                                                                                   |
| C4  | Single job + vocabulary | **PASS** | `value` / `from` / `duration` (token ordinal), `format` through `Intl.NumberFormat` — **never** `react-countup`'s `separator`/`decimal` strings, which are exactly the locale bug `NumberInput` is being fixed for (parity-backlog P0 #1). |
| C5  | Token-themeable         | **PASS** | Inherits `Text`; `tabular` already exists so digits do not jitter.                                                                                                                                                                         |
| C6  | Earns the contract      | **PASS** | A hand-roll announces sixty intermediate values to a screen reader. The correct behaviour — render the **final** value in the accessibility tree and animate only the visual text — is not obvious and should be written once.             |
| C7  | Earns its cost          | **➖**   | Tiny to build; the cost is one more public API to keep.                                                                                                                                                                                    |

**Verdict: conditional.** Two `➖`s on C1/C7 mean this is not a 7/7 PASS today. **Trigger:** build it
only if, after the showcase in §7 step 3 exists, **at least two** pages want it; otherwise a static
`Text tabular` is the right answer and this stays unbuilt. Name it `CountUp` (prior-art name; antd
has none to defer to) and place it in `general` beside `Reveal`, not in `data-display` — it is a
motion primitive, not a statistic.

**Reduced motion:** under `prefers-reduced-motion: reduce` there is no tween at all — the final value
renders immediately. Under every setting, assistive tech sees the final value from the first frame.

---

### 4.8 Recorded, not touched

- **`Masonry`** — ALREADY BEING PORTED by another agent; spec and GATE 0 ledger (7/7 PASS) in
  `docs/roadmap/list-masonry.md` §2. **This plan touches nothing about it.** Recorded here only so
  that a gallery or card-board section of a website page is built on it and not re-invented.
- **`List`** (antd `Listy`) — same file, §1. A long feed, virtualized.
- **`Watermark`, `Popconfirm`, `Notification`, `Empty`, `Result`, `Spin`, `Rate`, `Tour`** — already
  ruled out (or deferred) by `docs/roadmap/parity-backlog.md`. Not re-litigated here.

---

## 5. Compositions — the primitives, and the missing token

Every row below is a **composition pattern**: it lives in a consumer app or a `docs/` showcase, built
from real primitives and configured by tokens. The only framework work each one generates is in the
right-hand column.

### 5.1 Hero

**Primitives:** `Flex` · `ResponsiveGrid` + `ResponsiveGrid.Item span` · `Heading` · `Text` ·
`Button` · `Badge` (eyebrow) · `AspectRatio`/`Thumbnail` · `Card` · `Reveal` · `.ui-brand-glow`.

**Missing — and it is not a component:**

1. **The display type ramp has tokens but no prop surface.** `--font-size-display` (54px),
   `--font-size-3xl` (≈28), `--4xl` (≈42), `--5xl` exist at `foundation.css:513-521`. The only thing
   in `src/` that reads any of them is `--centered-shell-landing-heading-size`. `Heading` takes
   `level: 1|2|3|4` → `--heading-h1…h4`, whose **top is ≈20px**; `Text size` tops out at `2xl` (≈22px).
   There is no way to render a 42px headline through the public API. Both showcases therefore wrote
   their own `.tx-display` / `.fl-display` class with a raw `font-size`. **Fix: extend the existing
   size vocabulary** — `Text size` gains `3xl | 4xl | 5xl`, and `Heading` gains the same `size`
   override alongside `level` (level keeps owning the semantic tag; size owns the ramp). No new
   token, no new component.
2. **Band spacing** — see 5.9.
3. **`.ui-brand-glow` is shipped and unused.** `src/styles/layout.css:125` plus `--brand-glow`,
   `--brand-glow-size`, `--brand-glow-position`, `--brand-glow-color`, `--brand-glow-alpha` do exactly
   what `.tx-glow-tr`, `.tx-glow-bl`, `.fl-hero-glow` and `.fl-cta-glow` hand-wrote. **Fix is
   documentation plus one showcase that uses it** — the class needs a docs page, not a token.

### 5.2 Navbar

**Primitives:** `Topbar` (an explicitly "PURE SLOT" bar with `start`/`center`/`end`) · `Logo` ·
`Button` · `Menu` (§4.3) · `Sheet` (the mobile drawer) · `Affix` (§4.1) · `Separator`.

**Missing tokens** — both showcases hand-wrote the identical glass bar
(`position: sticky; top: 0; z-index: 30; background: hsl(var(--background) / .85); backdrop-filter: blur(10px)`):

| token                                           | file                                           | note                                                                            |
| ----------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------- |
| `--topbar-background-alpha`                     | `src/tokens/components/shell.css`              | default `100%`; the translucency of a pinned bar                                |
| `--topbar-backdrop-blur-size`                   | `src/tokens/components/shell.css`              | default `0px`; precedent `--app-launcher-launchpad-backdrop-blur-size`          |
| `--affix-inset-block-start` · `--affix-z-index` | `components/affix.css` · `semantic/layout.css` | z-index has no legal component property word; precedent `--overlay-z-index: 50` |

`--topbar-height`, `--topbar-inset`, `--topbar-gap`, `--topbar-gradient` already exist.

### 5.3 Footer

**Primitives:** `ResponsiveGrid columns={12}` + `ResponsiveGrid.Item span` · `Separator` ·
`Text link` · `Logo` · `Flex`.

**Missing: nothing, but one documentation defect.** Both showcases hand-wrote
`grid-template-columns: 1.4fr 1fr 1fr 1fr` because `ResponsiveGrid columns` looks like it only does
equal columns. **`ResponsiveGrid.Item` with `span` ships today** (`responsive-grid.tsx:125-145`) and a
12-column grid with `span={5}/{3}/{2}/{2}` is the asymmetric footer. It is invisible in the MCP
catalog — already logged as catalog drift in `parity-backlog.md`. **Fix: catalog the existing API.**

### 5.4 Pricing table

**Primitives:** `ResponsiveGrid` · `Card accent` + `CardHeader`/`CardContent`/`CardFooter` ·
`FeatureList` (included / limited / excluded — this _is_ the tier list) · `Badge` ("most popular";
antd's `Badge.Ribbon` is a composition here by parity ground-rule 2) · `Segmented` (monthly↔yearly,
with its `count` pill) · `Button` · `Text tabular` for the price.

**Missing: nothing.** This is the strongest evidence that the doctrine is right — the single most
requested "marketing component" needs **zero** new framework surface once §5.9 lands.

### 5.5 Feature grid · 5.6 CTA band · 5.7 Testimonials · 5.8 Logo wall

| pattern      | primitives                                                                                                        | missing                                                                                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature grid | `ResponsiveGrid` · `Card` · `Avatar` square + Lucide glyph (the doctrine's "icon medallion") · `Heading` · `Text` | nothing                                                                                                                                                                 |
| CTA band     | `Card variant` + per-region role scoping · `Heading` · `Text` · `Button` · `.ui-brand-glow`                       | band spacing (5.9); **`--gradient-brand` / `--gradient-hero` / `--gradient-glow` exist with no call site** — give them one documented consumer, as `.ui-brand-glow` has |
| Testimonials | `Card` · `Avatar` · `Text` · `Carousel` + `CarouselDots` · `Rating`                                               | nothing                                                                                                                                                                 |
| Logo wall    | `Flex wrap` / `ResponsiveGrid` · `Thumbnail` · optionally `Marquee` (§4.5)                                        | nothing — third-party marks are images; de-emphasis (`grayscale`) is a brand decision for the consumer stylesheet, not a framework token                                |

### 5.9 The section band and the page shell — the one real token gap

Both showcases hand-wrote a shell (`max-width: 1200px` / `1140px`, `padding-inline: 2rem`) and a band
rhythm (`padding-block: 5rem` / `5.5rem` / `6rem`).

**Why they had to:**

- The φ ladder **stops at φ²**: `--phi-unit: var(--space-4)` (16px) → `--phi-p1` ≈ 26px, `--phi-p2` ≈ 42px
  (`foundation.css:694-699`). The numeric scale stops at `--space-12` (48px). A marketing band is
  64–110px. **There is no step to reach for**, so authors type `5rem`.
- `--page-measure-narrow` (42rem) and `--page-measure-medium` (48rem) exist, and `PageContainer measure`
  accepts `"default" | "narrow" | "medium"`. There is no wide/marketing measure.

**Proposed tokens:**

| token                                | tier / file                      | value                                       | why                                                                                      |
| ------------------------------------ | -------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `--phi-p3` · `--phi-p4`              | `src/tokens/foundation.css`      | `calc(--phi-p2 × φ)` ≈ 68px · `× φ` ≈ 110px | extend the existing ladder by two steps rather than inventing a parallel marketing scale |
| `--space-band` · `--space-band-hero` | `src/tokens/semantic/layout.css` | `var(--phi-p3)` · `var(--phi-p4)`           | the section rhythm, named beside `--space-section` / `--space-stack-*`                   |
| `--page-measure-wide`                | `src/tokens/semantic/layout.css` | `72rem` (1152px outer → 1104px surface)     | + `"wide"` on `PageContainer measure`                                                    |

> **A decision for the owner, not for me.** φ³ ≈ 68px and φ⁴ ≈ 110px do not equal the 80/88/96px the
> showcases used — those were eyeballed. Snapping marketing bands onto the house ladder is the
> principled answer and it will visibly change both showcases. The alternative is a marketing-only
> unit (`--phi-unit-band`), which is a second scale and should be refused unless the ladder genuinely
> cannot carry it. **Do not name these `--space-band-*` plural without checking `--band-height-*`
> first** — `band` already means "control height" in this repo (`foundation.css`, rule #24), and a
> second meaning for the same word is the kind of drift `check:prop-vocabulary` exists to stop. If
> that collision worries the reviewer, `--space-section-band` / `--space-section-hero` are the
> conflict-free spellings.

**RESOLVED in gh#831 — and the φ half of the proposal above was REFUSED, on measurement.** What
shipped:

| token                                                       | tier / file                       | value                                              |
| ----------------------------------------------------------- | --------------------------------- | -------------------------------------------------- |
| `--space-20` · `--space-24`                                 | `src/tokens/foundation.css`       | 80px · 96px — Carbon `$spacing-11` / `$spacing-12` |
| `--space-section-band` · `--space-section-hero`             | `src/tokens/semantic/layout.css`  | `var(--space-20)` · `var(--space-24)`              |
| `--page-measure-wide`                                       | `src/tokens/semantic/layout.css`  | `72rem` (1152px outer → 1104px surface)            |
| `--topbar-background-alpha` · `--topbar-backdrop-blur-size` | `src/tokens/components/shell.css` | `initial` · `initial` — read by `.ui-topbar`       |

`--phi-p3` / `--phi-p4` were NOT minted. Three pieces of evidence, all of them already inside this
repository, say the φ ladder is not the generator of this scale and must not become one:

1. `docs/DESIGN-AUTHORITY.md` (accepted 2026-09-07) assigns **spacing** to **IBM Carbon**, and says
   in as many words that "Carbon keeps geometry (the spacing steps, the 4px grid)".
2. `src/tokens/__tests__/carbon-scale-alignment.test.ts` **enforces** it: every `--space-*` step
   must be a Carbon step or a recorded divergence, and must sit on the 4px grid. Carbon's scale
   already contains 64 / 80 / 96 / 160 — the whole marketing band range. φ³ = 67.8px and
   φ⁴ = 109.7px are on neither the 4px nor the 8px grid, and at `--scaling: 0.92` they are 62.4px
   and 100.9px.
3. `src/tokens/semantic/layout.css` has said since it was written that the semantic steps read the
   linear scale and **not** φ, "because mixing the two left an incoherent density rhythm". That
   experiment was already run here once.

The φ ladder also has **zero** consumers in `src/` — `--phi-p1` / `--phi-p2` appear only in
`docs/`, and `docs/foundation/spacing.tsx` labels `--space-stack-lg` as "= `--phi-p1`" when it is
`var(--space-6)` = 24px against φ¹ = 25.9px. It is a description of the scale, not its generator,
so extending it would have extended a label.

Industry prior art agrees and was checked before the refusal: Tailwind v4 replaced its ladder with
`calc(var(--spacing) * N)`, purely additive; Primer (`--base-size-96/112/128`) and Polaris
(`--p-space-2400/2800/3200`) both end their scales with **+16px flat** steps, the _smallest_ ratios
anywhere in those scales; Atlassian states "every space token is a multiple of this base unit" and
caps layout spacing at 80px; Material 3 does not scale section spacing at all (a flat 24dp pane
spacer from Expanded through Extra-large); and `utopia-core` computes type with
`Math.pow(scale, step)` and space with `base * multiplier` **in the same file**. No system in the
sample generates spacing from φ. Geometric ratios are a TYPE-scale tool.

`PageContainer measure="wide"` was deliberately NOT added with the token. A marketing page is
full-bleed `<section>`s with a centred inner column; `PageContainer` owns page padding and a
header/toolbar/footer scaffold, so neither showcase can consume it — the prop would have shipped
with no call site in the two pages that are its proof, which is the tier-2 mistake `docs/TOKENS.md`
warns about. The token stands on its own as the vocabulary a composition caps its shell with, the
way `--gradient-hero` does.

---

## 6. The animation and motion story

### 6.1 What exists (and is simply undocumented)

| exists                                                                         | where                                                                      | used by                                                                                                        |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `--duration-fast\|base\|slow` (150/250/500ms)                                  | `foundation.css:716-718`                                                   | widely                                                                                                         |
| `--ease-standard\|emphasized\|decelerate\|accelerate`                          | `foundation.css:719-722`                                                   | widely                                                                                                         |
| `--duration-loop` (1400ms) + `--activity-interval` + `--activity-stagger-step` | `foundation.css:735-740`                                                   | `Activity`                                                                                                     |
| `--reveal-distance` (10px) + `--reveal-stagger-step` (60ms)                    | `foundation.css:723-726`                                                   | `Reveal`                                                                                                       |
| `.ui-reveal` entrance + `.ui-activity` loops, both with a reduced-motion block | `src/styles/motion.css` — the one motion file                              | `Reveal`, `Activity`                                                                                           |
| `prefers-reduced-motion` handling                                              | **13 stylesheets** + `src/props/**`                                        | dialog, sheet, shell, tabs, alert, card, float-button, text, navigation, data-display, layout, actions, motion |
| view-transition style shared elements                                          | `react-aria-components@1.21.1` `SharedElementTransition` / `SharedElement` | nothing yet                                                                                                    |

**The motion tier is in better shape than the component tier.** It has one file, one naming
convention, a documented reason for every knob, and reduced-motion coverage in thirteen stylesheets.
Nothing here needs rebuilding.

### 6.2 What is actually missing

| missing                                       | why it matters for a website                                                                                                                                           | the fix                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **a viewport trigger**                        | every website animates on scroll; `Reveal` only fires on mount                                                                                                         | §4.4 — `on="view"`                                       |
| **a scroll-position state**                   | sticky/shrink headers, scrollspy; the machinery is private in `PageContainer`                                                                                          | §4.1, §4.2                                               |
| **an ambient/loop surface beyond `Activity`** | a ticker or logo marquee has no home                                                                                                                                   | §4.5 — `--marquee-interval` beside `--activity-interval` |
| **a documented motion page**                  | `--reveal-*`, `--duration-loop` and `.ui-brand-glow` are invisible to consumers; they hand-roll instead (measured: 4 hand-written radial gradients across 2 showcases) | a `docs/` motion page, not code                          |

**What is NOT missing:** durations, easings, a stagger model, reduced-motion plumbing, or an
animation runtime. **Do not add `framer-motion`/`motion`.** The library has no animation dependency
today and every proposal above is CSS plus one `IntersectionObserver`.

### 6.3 The reduced-motion contract, in one table

The rule for all of it: **reduced motion snaps, it never hides.** No proposal may leave content
invisible, unreachable or unannounced when motion is off.

| proposal           | normal                                  | `prefers-reduced-motion: reduce`                                   |
| ------------------ | --------------------------------------- | ------------------------------------------------------------------ |
| `Affix`            | header condenses over `--duration-fast` | condenses **instantly**; still pinned, still condensed             |
| `Anchor`           | smooth scroll + sliding ink             | `behavior: "auto"` jump; ink **snaps**; `aria-current` unchanged   |
| `Menu` panel       | fade/slide in `--duration-fast`         | appears and disappears **instantly**                               |
| `Reveal on="view"` | fade-up from `--reveal-distance`        | **no animation**; content final and fully visible, no layout shift |
| `Marquee`          | continuous loop at `--marquee-interval` | **no motion**; a static, scrollable row with every item reachable  |
| `CountUp`          | rAF tween                               | final value **immediately**; a11y tree always has the final value  |
| `Image` preview    | scale+fade open                         | opens **instantly**; user-driven zoom/pan unaffected               |

---

## 7. Ordering

Sequenced by _what unblocks the most_ first and _what can fail_ last, not by appetite.

| #   | item                                                                                                            | why here                                                                                                                                                                                                                                                                                  | risk              |
| --- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | **Display type prop surface** — `Text size: 3xl\|4xl\|5xl`, `Heading size`                                      | Cheapest thing here and it unblocks **every** composition in §5. The tokens already exist; this is a union extension plus catalog + prop-registry entries. Deletes 4 hand-rolled classes across 2 showcases on day one.                                                                   | low               |
| 2   | **Marketing tokens** — `--phi-p3/p4`, `--space-band*`, `--page-measure-wide` + `measure="wide"`                 | The other half of what every composition needs, and it needs the owner's ruling on the φ steps (§5.9) — so ask early, not after five pages are built on eyeballed values.                                                                                                                 | low, one decision |
| 3   | **A marketing composition showcase** — hero, feature grid, pricing, testimonial, logo wall, CTA, footer, on 1+2 | This is the item that converts the plan into evidence. It proves 1+2, it produces the acceptance screenshots, and it is what decides §4.6 and §4.7 by measurement instead of opinion. Nothing after this should start before it exists.                                                   | low               |
| 4   | **`Affix`**                                                                                                     | Highest behavioural leverage per line. Small, antd-named, and two thirds already written privately inside `PageContainer` — extracting it fixes a duplication instead of creating one. `Anchor` is specified on top of it, so it must come first.                                         | medium            |
| 5   | **`Anchor`**                                                                                                    | Depends on 4 (antd's own `affix` prop takes `AffixProps`). Also closes a shipped gap that is not marketing at all: `LegalDocumentShell` has no table of contents.                                                                                                                         | medium            |
| 6   | **`Reveal on="view"`**                                                                                          | One file. Deliberately **after** the showcase so it is tuned against real pages rather than a demo — and so it is obvious whether the pages need it at all.                                                                                                                               | low               |
| 7   | **`Menu mode="horizontal"`**                                                                                    | The biggest, the riskiest, and the only item that can fail on its merits: no Radix (ratchet), no RAC navigation-menu, so the disclosure-nav has to be assembled. Give it its own issue and its own reviewer, and start it only when 1–6 are landed, so a failure here costs nothing else. | **high**          |
| 8   | **`Marquee`** — conditional on the logo wall in 3 wanting motion                                                | Cheap, but only real if a page needs it. Ships with the pause control or not at all.                                                                                                                                                                                                      | low               |
| 9   | **`CountUp` / `Image` preview** — deferred, with the triggers in §4.6/§4.7                                      | Decide with a number from 3, not with an opinion now.                                                                                                                                                                                                                                     | —                 |

**Batching.** Per the repo's standing rule, 1–3 land as one batch, and 4–7 as one PR each — these
are public-API changes, so each needs `pnpm ship:surface`, the MCP catalog entry, and the
`godxjp-ui-mcp-catalog-sync` follow-map.

---

## 8. What I recommend NOT doing

1. **No `Hero`, `Navbar`, `Footer`, `PricingTable`, `Testimonials`, `LogoWall`, `FeatureGrid` or
   `CTASection` in `src/components/` — under any name.** The doctrine's §3 decides four of these
   explicitly, and §5 above shows the rest are `ResponsiveGrid` + `Card` + `FeatureList` + `Button`.
   Also refuse the renames: `Banner`, `Section`, `Block`, `MarketingShell`, `LandingShell` are the
   same refused component. `ServiceLauncherCard` is the ONE recorded exception and §3 says in as many
   words that it is not precedent.
2. **No `Parallax`.** antd has nothing. The behaviour is a scroll-linked transform, which CSS now
   expresses natively behind `@supports (animation-timeline: scroll())`, so **C3 fails**. Worse, its
   reduced-motion behaviour is to _not exist_ — a component whose entire value must be switched off
   for the users most at risk from it (WCAG 2.3.3; vestibular triggers) is not a framework component.
   A brand that wants depth gets `.ui-brand-glow` and a tinted section.
3. **No `BorderBeam`, even though antd 6.4.0 ships one.** antd's is a decorative moving beam along a
   border (`color`, `count=1`, `duration=6`, `lineWidth=1px`, `size=100`, `outset`). Parity ground-rule
   2 is explicit that a missing antd component is not automatically a framework component, and this one
   owns no behaviour (C2 ❌) and is a themed CSS class in a consumer stylesheet (C3 ❌). If the owner
   wants it for parity's sake, that is a deliberate override of GATE 0 and should be recorded as one.
4. **No new animation dependency.** Not `framer-motion`, not `motion`, not `gsap`, not
   `react-fast-marquee` or `react-countup` as runtime deps. They are prior art for the **API**; the
   implementations here are CSS plus `IntersectionObserver`. The library ships zero animation runtime
   today and should keep shipping zero.
5. **No `@radix-ui/react-navigation-menu`.** `check:radix-surface` fails on any Radix package without
   a baseline entry, and the library is migrating _off_ Radix. Borrow the pattern, not the package.
6. **No "marketing theme" preset or second design language.** Per-region role scoping plus
   `[data-tenant]` overrides already reach 100% fidelity — `acme-website.tsx` and `futurelastic-web.tsx`
   are the proof. A second preset would be a fork of the theme layer.
7. **No re-litigating `Watermark`, `Tour`, `Popconfirm`, `Empty`, `Result`, `Spin`.**
   `parity-backlog.md` ruled on them. Overturning a ruling needs new evidence, and a website page is
   not new evidence for a watermark.
8. **Do not touch `Masonry` or `List`.** Another agent owns them (`docs/roadmap/list-masonry.md`).
9. **No reading-progress bar, no scroll-driven section counter, no cookie banner, no newsletter
   block.** Each is `Progress`/`Text`/`Form` plus a scroll listener the `Affix`/`Anchor` work already
   makes available, and each is page furniture with a domain in it.

---

## 9. Definition of done (per item in §7)

**For a framework component** (4.1, 4.2, 4.3, 4.5, and 4.4's extension): source + group `index.ts`
export · `XProp` (+ `as XProps`) in the group's `*.prop.ts` **and** `src/props/registry.ts` · a token
file plus its `@import` in `src/tokens/base.css` · i18n keys in **en/vi/ja** · `@testing-library/user-event`
behaviour tests beside the component · an `mcp/src/data/components.ts` entry including the
"deliberately not ported" list · a real-screen `docs/` page with its `/isolate/**` frame · the
reduced-motion row of §6.3 asserted by a test.

**For a composition** (§5): a `docs/showcase/*.tsx` page built from real primitives, with the number
of bespoke CSS classes it needed recorded in its header comment — that count is the measurement that
says whether the token work in §7 step 2 actually worked. The target is that a third marketing brand
needs **fewer than 10** bespoke classes, against the 26 and 32 measured today.

**Gates.** `pnpm typecheck && pnpm lint && pnpm run audit && pnpm check:prop-vocabulary &&
pnpm check:mcp-sync && pnpm check:mcp-orphans && pnpm check:token-tiers && pnpm check:control-sizing &&
pnpm check:example-imports && pnpm check:doc-prop-existence`, then **only** the touched test files
(`pnpm vitest run src/components/<group>/__tests__ --maxWorkers=2`). `pnpm test` and a bare
`pnpm vitest run` are **forbidden**; `pnpm check:frame-axe` is local-only and on request.
