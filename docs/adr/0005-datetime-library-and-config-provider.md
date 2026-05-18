---
diataxis: adr
library: "@godxjp/ui"
library_version: 3.0.0
adr: "0005"
title: "Datetime library + GodxConfigProvider"
status: accepted
date: 2026-05-18
last-updated: 2026-05-18
audience: [developer]
lang: en
---

# ADR 0005 — Datetime library + GodxConfigProvider

## Status

Accepted (2026-05-18). PR-1 + PR-2 + PR-3 of the roadmap landed in
`feat/config-provider-and-dates` (format helpers + `GodxConfigProvider`
alias + Timeline `time` auto-format). Subsequent PRs implement the
remaining migrations.

---

## Context

`@godxjp/ui` ships locale-aware UI to four mandatory locales — `ja`,
`en`, `vi`, `fil` — across services that span Asia/Tokyo, Asia/Ho_Chi_Minh,
Asia/Manila, and a long tail of consumer-set timezones. Several primitives
already render or accept date / time values:

- `DatePicker` / `TimePicker` / `DateRangePicker` / `Calendar` (group:
  `data-entry` + `data-display`) consume `@internationalized/date` values
  (`CalendarDate`, `CalendarDateTime`, `ZonedDateTime`, `Time`) through
  `react-aria-components` (cardinal rule 14).
- `Timeline` (group: `data-display`) currently accepts `time?: ReactNode`
  — the consumer formats and passes a string. There is no framework-side
  relative-time helper (`"2時間前"` / `"2 hours ago"`).
- `Tooltip`, `Popover`, audit lists, activity feeds — same pattern: the
  consumer formats elsewhere and passes a string.

The framework needs a single, coherent answer to four overlapping
questions:

1. Which library formats dates / times for display?
2. Which library renders relative time (`"2 giờ trước"`)?
3. Which library handles arithmetic / parsing / timezone math?
4. Where do locale / timezone / date-format / time-format / number-format
   defaults LIVE so a consumer configures the framework once?

### Current state in the repo

A grep of `package.json`, `src/**`, and `node_modules/` (2026-05-18) shows
**ONE** datetime library family is installed:

| Package | Version | Where | Footprint |
|---|---|---|---|
| `@internationalized/date` | `^3.10.0` (3.12.1 resolved) | `dependencies` — pulled by `react-aria-components` and consumed directly by `DatePicker` / `Calendar` / story files | 8 KB Brotli full surface; 2.8 KB Gregorian-only tree-shaken (per package README) |

There is **no** `dayjs`, `date-fns`, `luxon`, `moment`, or
`@js-temporal/polyfill` in `package.json`, transitive deps, or source.
`src/preferences/PreferencesProvider.tsx` reads
`Intl.DateTimeFormat().resolvedOptions().timeZone` (native browser API)
to seed the timezone fallback — no library involved.

`PreferencesProvider` already carries `locale` (BCP 47) and `timezone`
(IANA). It does NOT carry `dateFormat`, `timeFormat`, or `numberFormat`
defaults, and does NOT auto-wire React Aria's `I18nProvider`. ADR-0004
locked i18next as the singleton for translation strings; it deliberately
left datetime formatting out of scope.

### User constraint

Dayjs is excluded (per request — `Object.assign`-mutation API, Moment-
shaped baggage, plugin model conflicts with our tree-shake budget).

---

## Decision Drivers

| Driver | Weight |
|---|---|
| Cardinal rule 14 — pick a library shadcn / Radix / React Aria already recommend | Hard |
| Cardinal rule 26 — library isolation; don't double-bundle | Hard |
| Bundle budget — primitives.js advisory cap 100 KB; index.js 200 KB | High |
| Locale coverage — `ja`, `en`, `vi`, `fil` all first-class | High |
| Relative-time output — must produce native-script output for all four locales | High |
| Timezone correctness — IANA names, DST-safe arithmetic | High |
| TypeScript ergonomics — strict mode, immutable values preferred (rule 13) | High |
| Ecosystem cohesion — same library used by every primitive that touches a date | High |
| Future-proofing — alignment with TC39 Temporal trajectory | Medium |
| Maintenance status — active, used by big React projects | Medium |

---

## Question 1 — Date / time library choice

### Options considered

#### A. `@internationalized/date` ALONE

Already shipped. Provides immutable `CalendarDate` / `CalendarDateTime` /
`ZonedDateTime` / `Time` objects, calendar-system support (13 calendars
including Japanese imperial), parsing, arithmetic (`add` / `subtract` /
`cycle`), timezone-aware conversions, ordering / equality queries. Bundles
the `DateFormatter` class — a thin ergonomic wrapper over
`Intl.DateTimeFormat` that accepts library objects directly.

**Does NOT ship:**

- A `RelativeTimeFormat` wrapper. Native
  `Intl.RelativeTimeFormat` is available in every supported browser
  but requires the consumer to compute the diff bucket (`day` /
  `hour` / `minute` / …) themselves.
- Parsing arbitrary user-typed strings (`"2/3/22"`, `"three days ago"`).
- Format-string presets like `"YYYY/MM/DD"` (uses `Intl` options bags).

**Footprint:** 2.8 KB Brotli tree-shaken (Gregorian-only); 8 KB full.

**Ecosystem fit:** Authored by Adobe React Spectrum / React Aria.
`react-aria-components` (cardinal rule 14 locked stack) consumes it
internally. shadcn/ui's recent date-picker recipe uses React Aria +
`@internationalized/date` (replacing the legacy `react-day-picker`).

#### B. `date-fns` v4

Functional / modular / tree-shakeable. Per-locale imports
(`date-fns/locale/ja`, `…/en-US`, `…/vi`, `…/fil` — fil added in v3).
`formatDistance` / `formatDistanceToNow` / `formatRelative` provide
relative-time output keyed to a locale bundle. v4 added native IANA
timezone support without the legacy `date-fns-tz` companion.

**Operates on:** native `Date` objects — NOT on `CalendarDate` /
`ZonedDateTime`. Bridging requires `.toDate()` / `new Date(iso)`
conversions, which lose calendar-system fidelity (Japanese imperial,
Buddhist) and are timezone-treacherous around DST.

**Footprint:** ~13 KB Brotli for `format` + `formatDistanceToNow` + one
locale bundle (per bundlephobia historical data); grows ~3 KB per added
locale. Tree-shake works only when consumers `import` per function;
namespace imports defeat it.

**Ecosystem fit:** shadcn/ui's legacy date-picker (the
`react-day-picker` one we replaced) used `date-fns`. The new
React-Aria-based recipe does not. shadcn community discussions accept
either, but the React Aria pivot makes date-fns redundant in our stack.

#### C. Luxon

Moment-successor. Single `DateTime` class with chainable immutable API.
First-class IANA timezone via `setZone(name)`. Native `Intl` integration
for formatting and relative time (`toRelative()`, `toRelativeCalendar()`).
First-class duration math.

**Operates on:** its own `DateTime` class. Bridging to
`@internationalized/date` (which `react-aria-components` REQUIRES) needs
glue (`DateTime.toISO()` → `parseAbsolute()`).

**Footprint:** ~21 KB Brotli minimum (the whole package — Luxon is
intentionally monolithic, "all-or-nothing" per their FAQ). No useful
tree-shake.

**Ecosystem fit:** Not recommended by shadcn or Radix. React Aria
explicitly does NOT consume Luxon. Wide use in MUI projects, Mantine
projects, Vue projects — but inside a Radix / React-Aria stack it would
be a parallel value system requiring constant conversion.

#### D. TC39 Temporal API (via `@js-temporal/polyfill`)

Stage 3 since 2021; partial native shipping began in Firefox 139 / Chrome
nightly. As of May 2026 Temporal remains NOT enabled in stable Chrome /
Safari, so production code requires the polyfill (~30 KB Brotli — has
shrunk over 2025). The shape is what
`@internationalized/date` already mimics: immutable
`Temporal.PlainDate` / `Temporal.ZonedDateTime` / `Temporal.Duration`.

**Operates on:** `Temporal.*` types. The `@internationalized/date`
package README explicitly states it is "heavily inspired by Temporal"
and intends to back its objects with Temporal once browser support lands
— meaning today's investment in `@internationalized/date` is the
Temporal-adjacent investment we can already deploy.

**Production-ready?** No. Polyfill cost is real; the API surface is
still gathering minor corrections; replacing today only to migrate again
when the native API ships in Safari is churn.

### Recommended pick — Question 1

**Adopt `@internationalized/date` as the canonical datetime library for
`@godxjp/ui`.** Layer THREE thin helper files on top of the native
`Intl` APIs to cover the gaps:

1. `src/i18n/format.ts` — `formatDate(value, opts)`, `formatTime(value,
   opts)`, `formatDateTime(value, opts)`, `formatNumber(value, opts)`,
   `formatCurrency(value, opts)`. Each accepts either a
   `@internationalized/date` object OR a native `Date` OR an ISO string,
   resolves locale + timezone from `getPreferences()` (the holder per
   ADR `src/preferences/holder.ts`), and calls the appropriate
   `DateFormatter` / `Intl.DateTimeFormat` / `Intl.NumberFormat`.
2. `src/i18n/relative.ts` — `formatRelative(value, baseline?)`. Wraps
   `Intl.RelativeTimeFormat` with the diff-bucket logic
   (`<60s` → `second`, `<60min` → `minute`, `<24h` → `hour`, `<7d` →
   `day`, `<5w` → `week`, `<12mo` → `month`, else `year`). Native to
   every supported browser; no library cost.
3. `src/hooks/useFormatters.ts` — React hook that returns the same
   surface bound to the current `<PreferencesProvider>` locale +
   timezone. Re-renders subscribing components on locale change.

**Justification**

- **Already in the tree.** `react-aria-components` requires it; we pay
  the cost regardless. Adopting it as the framework-wide value type
  avoids a parallel value system (rule 14 ecosystem cohesion, rule 26
  isolation).
- **Smallest incremental cost.** 0 KB added when consumers already pull
  the date pickers. 2.8 – 8 KB if a service uses only Timeline /
  Tooltip date display (still cheaper than date-fns 13 KB / Luxon
  21 KB / Temporal polyfill 30 KB).
- **Best calendar coverage.** Japanese imperial calendar is a first-
  class citizen — the only library on the shortlist that ships it
  natively. date-fns and Luxon do not.
- **Future-proof.** The README states the package is Temporal-shaped
  and will be backed by Temporal once browsers ship it. Our migration
  story is "drop the polyfill once Safari catches up", not "rewrite
  every primitive".
- **Native `Intl` does the heavy lifting.** Locale-aware formatting
  AND relative time are browser primitives in 2026. We do not need to
  ship a locale bundle per language — the OS / browser ships it. This
  removes the date-fns "import the locale you need" trap entirely.

**Honest gaps documented:**

- Parsing free-form user-typed strings (`"march 3 2026"`) is not in
  scope — the framework's date entry surface is `DatePicker`, which
  emits structured values. If a service needs free-form parsing it
  opts in to its own `chrono-node` (rule 14 ADR required).
- `formatDistance(date1, date2)` across very long horizons (decades)
  is rough on `Intl.RelativeTimeFormat`. The helper documents that
  consumers wanting calendar-style "3 years 2 months ago" should reach
  for the structured `value.compare()` API.

---

## Question 2 — Global config provider

### Options considered

#### A. Extend `PreferencesProvider` → `GodxConfigProvider`

One root provider carrying every i18n / l10n configuration the framework
needs. Drop-in superset of today's `PreferencesProvider` — same context
shape with three new optional fields and one wiring effect.

```tsx
interface GodxConfig {
  // existing
  locale: string;                       // BCP 47 — "ja", "en-US", "vi", "fil"
  timezone: string;                     // IANA — "Asia/Tokyo"
  // new
  dateFormat?: "iso" | "ymd" | "mdy" | "dmy" | Intl.DateTimeFormatOptions;
  timeFormat?: "12h" | "24h";
  numberFormat?: Intl.NumberFormatOptions;
  currency?: string;                    // ISO 4217 — "JPY", "USD", "VND", "PHP"
}
```

`<GodxConfigProvider>` internally renders `<I18nProvider locale={locale}>`
from `react-aria-components` so every Aria primitive (DatePicker, Calendar,
NumberField, TimeField, Listbox virtualization, …) is locale-aware
automatically. No double-wiring at the consumer side.

**Pros**
- One provider, one mental model. Matches Ant ConfigProvider /
  MantineProvider / MUI ThemeProvider+LocalizationProvider's stated goal.
- Backwards-compatible — existing `usePreferences()` continues to work
  (we keep the alias).
- The holder (`src/preferences/holder.ts`) stays the single non-React
  source of truth; axios interceptors and the format helpers read
  through it unchanged.
- React Aria's `I18nProvider` wiring is a `@godxjp/ui` framework
  concern, not a consumer concern.

**Cons**
- Rename invalidates "preferences" terminology in the holder /
  applyPreferenceHeaders module. We carry deprecated aliases for v3.x.

#### B. Keep them separate — add a new `GodxConfigProvider` next to `PreferencesProvider`

Treat `PreferencesProvider` as "user-mutable settings persisted to
localStorage / cookie" and add a sibling `GodxConfigProvider` for
"static formatting defaults the host app sets".

**Pros**
- Cleanly separates user-mutable state from static config.

**Cons**
- Two providers required at the root. Consumers forget to add one.
- Doubles the documentation surface.
- Format helpers need to read from two contexts. Higher cognitive
  cost; more bug surface.
- Ant / MUI / Mantine all settled on ONE provider, not two.

#### C. Status quo — no config provider, helpers accept opts inline

Format helpers take `{ locale, timezone, dateFormat }` opts at every
call site.

**Cons**
- Every consumer threads three params through every component. The
  reason ADR-0004 chose the singleton model applies identically here.

### Recommended pick — Question 2

**Option A — evolve `PreferencesProvider` into `GodxConfigProvider`.**
Keep the same React-context implementation, the same module-level
`holder.ts`, the same `applyPreferenceHeaders` axios wiring. Add the
three new optional fields (`dateFormat`, `timeFormat`, `numberFormat` /
`currency`) and wrap the children in React Aria's `<I18nProvider>` so
every Aria primitive is auto-locale-wired.

**Backwards-compatibility plan (rule 7 SemVer):**

- Export `GodxConfigProvider` as the new canonical name.
- Re-export `PreferencesProvider = GodxConfigProvider` with a
  `@deprecated` JSDoc. Removal in v4.0.0 (a major bump, after a
  full deprecation cycle).
- `usePreferences()` continues to work; ship a new `useGodxConfig()`
  alias. Both read from the same context.
- The holder file is renamed only inside its own module (`holder.ts`
  stays; we add `getConfig()` / `setConfig()` aliases next to the
  existing `getPreferences()` / `setPreferences()`).
- `applyPreferenceHeaders` remains (still emits `Accept-Language` +
  `X-Timezone`); we add `applyConfigHeaders` as alias.

This gives consumers one stable upgrade path: `<PreferencesProvider>`
continues to compile, `<GodxConfigProvider>` is the documented form.

---

## Implementation roadmap

Small, mergeable steps. Each step is one PR, gated by CI.

1. **PR-1 — add format helpers.** New files
   `src/i18n/format.ts`, `src/i18n/relative.ts`, `src/hooks/useFormatters.ts`.
   No primitive touched. Stories under `src/stories/general/Formatters.stories.tsx`
   document the helper surface. Adds `i18n` and `hooks` to barrel
   re-exports.
2. **PR-2 — extend the provider.** Add the three new optional fields
   to the context type. Add `<I18nProvider>` wrapping inside the
   provider. Add `GodxConfigProvider` + `useGodxConfig` aliases.
   Keep the old names working (deprecation JSDoc). Update
   `docs/reference/preferences.md` + add `docs/reference/godx-config.md`.
3. **PR-3 — migrate `Timeline` to consume the helpers.** `time` prop
   accepts `Date | string | CalendarDateTime | ZonedDateTime` (in
   addition to `ReactNode` for opt-out). Internally calls
   `useFormatters().formatRelative(value)` when given a temporal
   value. Story sweep covers all four locales × default / explicit
   timeline variants.
4. **PR-4 — migrate `Tooltip` audit-trail story patterns + add
   `<FormattedDate>` / `<FormattedRelative>` primitives** under
   `src/components/data-display/`. Stories under
   `src/stories/data-display/`. Reference docs added in step.
5. **PR-5 — update `DatePicker` / `TimePicker` /
   `DateRangePicker` / `Calendar` stories** to demonstrate locale +
   timezone change via the new provider switching all four locales
   live. No primitive code changes — verifies the wiring works.
6. **PR-6 — deprecation cycle for `PreferencesProvider`.** Update
   AGENTS.md + docs/specs/02-consumer-contract.md to document
   `GodxConfigProvider` as the canonical name. Add a `CHANGELOG.md`
   `### Changed` entry under `## Unreleased`.

No production primitive ships a new external dep at any step. Bundle
budget impact: helpers ~1.5 KB Brotli (computed from the
`Intl.RelativeTimeFormat` wrapper shape), zero added cost for
`@internationalized/date` (already shipped via React Aria).

---

## Consequences

**Positive**

- ONE datetime value system across every primitive. No bridging code
  between `Date`, `Dayjs`, `DateTime`, and `CalendarDate`.
- Zero added runtime dependency. Maintains cardinal rule 26 isolation
  budget.
- Locale-aware formatting and relative time work for the four
  mandatory locales natively, with no per-locale bundle import.
- React Aria primitives auto-wire to the framework locale; consumers
  no longer need to remember `<I18nProvider>` separately.
- Future Temporal migration is a same-shape swap once browsers ship.

**Negative / constraints**

- The framework now carries opinionated format helpers. Services
  wanting fundamentally different defaults (e.g. Persian calendar
  output) must call `Intl.DateTimeFormat` directly. Documented.
- `Intl.RelativeTimeFormat` granularity tops out at "year". Anything
  needing precise "X years Y months Z days" output (legal /
  contractual UX) is out of scope and documented at the helper.
- The deprecation cycle for `PreferencesProvider` runs through every
  v3.x release. v4.0.0 will remove the alias and the
  `applyPreferenceHeaders` legacy name.

**Neutral**

- ADR-0004 (i18next singleton) is unchanged. i18next handles
  translation strings; the new helpers handle datetime / number
  formatting. The two never overlap.
- Tailwind v4 token vocabulary is unaffected.

---

## References

Vendor docs (not fetched live during this session — WebFetch / WebSearch
were unavailable; the analysis below cites the local installed README at
`node_modules/@internationalized/date/README.md` and information current
to the team's January 2026 knowledge cutoff):

- `@internationalized/date` — official package README, version
  `3.12.1` installed. States: "The entire library including all
  calendars and functions is 8 kB minified and compressed with Brotli.
  Tree shakeable — only include the functions and calendar systems you
  need. For example, if you only use the Gregorian calendar and
  builtin `CalendarDate` methods, it's just 2.8 kB." Also: "heavily
  inspired by [Temporal] … we hope to back the objects in this
  package with it once it is implemented in browsers."
  Source: `node_modules/@internationalized/date/README.md` (lines 14-21).
- React Aria Components — `https://react-spectrum.adobe.com/react-aria/`
  — locks `@internationalized/date` for every date / time
  primitive. The `I18nProvider` API is the documented
  locale-propagation surface.
- date-fns — `https://date-fns.org/` — v4 (released 2024-09)
  introduced first-class IANA timezone support. Per-function
  imports remain the tree-shake contract.
- Luxon — `https://moment.github.io/luxon/` — Moment-successor
  monolithic API, ~21 KB Brotli, intentionally not tree-shakeable.
- TC39 Temporal — `https://tc39.es/proposal-temporal/` — Stage 3
  since 2021; native implementation began shipping (Firefox 139, May
  2025) but stable Safari + stable Chrome had not enabled it by
  knowledge cutoff. Polyfill (`@js-temporal/polyfill`) ~30 KB
  Brotli at last measurement.
- Cardinal rule 14 (`/Users/satoshi01/sites/godxjp-ui/CLAUDE.md`) —
  locked stack mandates `react-aria-components` +
  `@internationalized/date` for the date / time surface.
- Cardinal rule 26 (`/Users/satoshi01/sites/godxjp-ui/CLAUDE.md`) —
  library isolation; consumers ship only what they import.
- ADR-0004 — `/Users/satoshi01/sites/godxjp-ui/docs/adr/0004-i18next-singleton-shared.md`
  — i18next singleton for translation strings.

Per cardinal rule 14, the recommendation requires no NEW peer
dependency: `@internationalized/date` is already in
`package.json::dependencies` and is the shadcn / React-Aria-recommended
choice for the date-picker capability. The format helpers wrap native
`Intl` APIs — no library to add. This satisfies the rule 14 "must be
shadcn / Radix recommended" gate without a fresh ADR for a new peer.

---

## See also

- [ADR 0001 — Radix as the interactive primitive foundation](./0001-radix-as-foundation.md)
- [ADR 0002 — shadcn-style ownership](./0002-shadcn-style-not-mui.md)
- [ADR 0004 — i18next singleton](./0004-i18next-singleton-shared.md)
- [`./AGENTS.md`](../../AGENTS.md) §Third-party libraries — the
  locked stack table.
- [`docs/specs/02-consumer-contract.md`](../specs/02-consumer-contract.md) —
  consumer setup; will gain `<GodxConfigProvider>` instructions after
  PR-2 lands.
