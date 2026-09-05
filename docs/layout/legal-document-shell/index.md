--- title: Overview viewport: 1440x900 ---

The long-form **legal / policy document** surface — terms of service, privacy policy, DPA, cookie policy, SLA, EULA. It renders semantic `article` / `nav` / `section` landmarks and **real anchors**, while every word of legal text stays owned by the consumer (`sections`).

## What the shell owns (so no app re-implements it)

| Capability           | Behaviour                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Readable measure     | `--legal-document-measure-max-width` (46rem) caps the header, the body and the footer at every viewport.                                   |
| Sticky contents rail | At **≥56rem of shell width** the contents pin beside a measure-capped column and span the whole scroll.                                    |
| Compact/mobile rail  | Below 56rem the shell is one column: header → contents → sections → footer. The rail is **static** — never pinned, never capped.           |
| Scroll spy           | An `IntersectionObserver` marks the section at the reading line `aria-current="location"` (+ a marker + a weight — never colour alone).    |
| Hash navigation      | `#section-id` on arrival selects that section; activating an entry rewrites the hash with `history.replaceState` (Back is never hijacked). |
| Scroll offset        | `scroll-margin-block-start: var(--legal-document-scroll-offset)` — a jump lands below sticky chrome with no offset arithmetic.             |
| Focus handoff        | The target `<section tabIndex={-1}>` takes focus (`preventScroll`) with a **visible ring**, so keyboard users arrive inside it.            |
| Reduced motion       | The smooth scroll degrades to an instant jump under `prefers-reduced-motion: reduce`.                                                      |
| i18n                 | `effectiveDate` takes **ISO 8601** in and is rendered with `Intl.DateTimeFormat` in the active locale, inside `<time dateTime>`.           |

## Breakpoint is a CONTAINER query, not a viewport query

Dropped into a narrow pane on a 1440px screen it correctly stays single-column; given a wide pane on a small screen it can split. See the three viewport fixtures under **Examples**.

## API

```tsx
<LegalDocumentShell
  title="利用規約"
  version="2.4"
  effectiveDate="2026-04-01" // ISO 8601 in → Intl.DateTimeFormat out
  summary={summary}
  contentsLabel="目次"
  sections={sections} // { id, title, content }[]
  activeSection={activeSection} // controlled …
  onActiveSectionChange={setActiveSection} // … pair; omit both for uncontrolled
  documentNavigation={switcher} // rail slot, above the contents
  footerAction={actions} // below the last section
/>
```

`defaultActiveSection` gives the uncontrolled form (defaults to the first section).

## Theming

Every value is a `--legal-document-*` component token — the measure, the rail width/offset, the section rhythm, the body leading, the active-entry colours (role-mirror knobs, so a scoped `[data-tenant]` / `.dark` override reaches them).

```css
--legal-document-toc-border: 1px solid hsl(var(--border));
--legal-document-header-border: 1px solid hsl(var(--border));
```

A consumer needs **no** `className` and no `.legal-*` CSS.
