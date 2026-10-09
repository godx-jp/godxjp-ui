import * as React from "react";

import { useTranslation } from "../i18n/use-translation";
import { useControlledLatch } from "../lib/hooks";
import { cn } from "../lib/utils";
import { Heading } from "../components/general/typography";
import type { LegalDocumentShellProp } from "../props/components/layout.prop";

export type {
  LegalDocumentSectionProp,
  LegalDocumentShellProp,
  LegalDocumentShellProp as LegalDocumentShellProps,
} from "../props/components/layout.prop";

/**
 * Scroll-spy band. A section becomes "active" while its box crosses the strip between 10% and 25%
 * of the scrollport height — the standard reading line.
 */
const SPY_ROOT_MARGIN = "-10% 0px -75% 0px";

/**
 * Separator for the `sectionIdsKey` dependency string.
 *
 * It is a NUL because a section id cannot contain one, so no set of ids can collide on the joined
 * key. It is a NAMED constant, and a `\u0000` escape rather than a literal NUL byte, because the
 * literal was in this file and made it BINARY: `file` reported `data` and every `grep` in the
 * repository skipped it in silence. That is not cosmetic. The measurement in
 * docs/roadmap/website-components.md, "`grep -rln IntersectionObserver src/components/` returns
 * exactly one non-test file", is wrong for exactly this reason — this file is the second one, and
 * grep could not see it. The runtime value is unchanged.
 */
const SECTION_ID_SEPARATOR = "\u0000";

const ISO_CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** `true` when the user asked for reduced motion (falsy/unsupported environments say no). */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/**
 * ISO 8601 in → locale-formatted out, via `Intl.DateTimeFormat` (never a hand-built pattern). A
 * bare `yyyy-MM-dd` is a CALENDAR date, not an instant: it is anchored at UTC midnight and
 * formatted in the IANA `UTC` zone, so "2026-04-01" never renders as March 31 for a reader west of
 * Greenwich.
 */
function formatEffectiveDate(value: string, locale: string): string {
  const iso = value.trim();
  const isCalendarDate = ISO_CALENDAR_DATE.test(iso);
  const date = new Date(isCalendarDate ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(isCalendarDate ? { timeZone: "UTC" } : {}),
  }).format(date);
}

/**
 * LegalDocumentShell — the long-form **legal / policy document** surface: terms of service,
 * privacy policy, DPA, cookie policy, SLA, EULA, security policy. Semantics: `<article>` labelled
 * by the `<h1>` · a NAMED `<nav>` for the contents · REAL `<a href="#…">` anchors
 * (middle-clickable, deep-linkable, work before JS boots) · one `<section>` per entry labelled by
 * its `<h2>`.
 */
export const LegalDocumentShell = React.forwardRef<HTMLDivElement, LegalDocumentShellProp>(
  function LegalDocumentShell(
    {
      title,
      version,
      effectiveDate,
      summary,
      contentsLabel,
      sections,
      activeSection,
      defaultActiveSection,
      onActiveSectionChange,
      documentNavigation,
      footerAction,
      id,
      className,
    },
    ref,
  ) {
    const { t, locale } = useTranslation();
    const generatedId = React.useId();
    const baseId = id ?? generatedId;
    const titleId = `${baseId}-title`;
    const contentsId = `${baseId}-contents`;

    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const isControlled = useControlledLatch(activeSection !== undefined);
    const [internalActive, setInternalActive] = React.useState<string | undefined>(
      () => defaultActiveSection ?? sections[0]?.id,
    );
    const active = isControlled ? activeSection : internalActive;

    const emit = React.useCallback(
      (sectionId: string) => {
        if (!isControlled) setInternalActive(sectionId);
        onActiveSectionChange?.(sectionId);
      },
      [isControlled, onActiveSectionChange],
    );

    // Latest-value refs keep the observer effect stable: it is re-created only when the SET of
    // section ids changes, never on every render or handler identity change.
    const activeRef = React.useRef(active);
    const emitRef = React.useRef(emit);
    React.useEffect(() => {
      activeRef.current = active;
      emitRef.current = emit;
    });

    const sectionIdsKey = sections.map((section) => section.id).join(SECTION_ID_SEPARATOR);

    // Hash deep link — `/legal/terms#data-retention` selects (and, natively, scrolls to) that
    // section on arrival. Runs once; after that the scroll spy owns the active state.
    const hashHandledRef = React.useRef(false);
    React.useEffect(() => {
      if (hashHandledRef.current || typeof window === "undefined") return;
      hashHandledRef.current = true;
      const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (hash && sectionIdsKey.split(SECTION_ID_SEPARATOR).includes(hash)) emitRef.current(hash);
    }, [sectionIdsKey]);

    // Scroll spy. jsdom/SSR-safe: no IntersectionObserver → the contents simply stay on whatever
    // the anchors / hash selected, which is still a correct (just non-tracking) document.
    React.useEffect(() => {
      const root = rootRef.current;
      if (!root || typeof IntersectionObserver === "undefined") return;

      const ids = sectionIdsKey ? sectionIdsKey.split(SECTION_ID_SEPARATOR) : [];
      const intersecting = new Map<string, boolean>();

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const entryId = (entry.target as HTMLElement).dataset.legalSection;
            if (entryId) intersecting.set(entryId, entry.isIntersecting);
          }
          // Document order wins when several short sections share the band.
          const next = ids.find((sectionId) => intersecting.get(sectionId));
          if (next && next !== activeRef.current) emitRef.current(next);
        },
        { rootMargin: SPY_ROOT_MARGIN, threshold: 0 },
      );

      for (const element of root.querySelectorAll<HTMLElement>("[data-legal-section]")) {
        observer.observe(element);
      }
      return () => observer.disconnect();
    }, [sectionIdsKey]);

    const handleContentsClick = (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      // Never hijack a modified click — the anchor is real, so open-in-new-tab keeps working.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      emit(sectionId);

      const target = typeof document === "undefined" ? null : document.getElementById(sectionId);
      if (!target) return; // No target yet → let the browser's native hash navigation handle it.

      event.preventDefault();
      // replaceState (not pushState): the URL stays shareable/deep-linkable without turning every
      window.history?.replaceState?.(null, "", `#${sectionId}`);
      target.scrollIntoView?.({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
      target.focus({ preventScroll: true });
    };

    const contentsName = contentsLabel ?? t("layout.legalDocumentShell.contents");

    return (
      <div
        ref={setRefs}
        id={id}
        data-slot="legal-document-shell"
        className={cn("ui-legal-document-scope", className)}
      >
        <article className="ui-legal-document" aria-labelledby={titleId}>
          <header className="ui-legal-document-header">
            <Heading level={1} id={titleId}>
              {title}
            </Heading>

            {/* The metadata / contents-caption / summary chrome is plain markup styled by
             * `--legal-document-*` tokens (the CenteredShell + SplitPane precedent), NOT `Text`:
             * `[data-slot="text"][data-size]` outranks a single class from a stylesheet that loads
             * earlier, so a `Text` here would silently ignore the component's own size token. Real
             * typographic primitives are still used where they own the scale — `Heading` for the
             * document h1 and every section h2. */}
            {(version !== undefined || effectiveDate !== undefined) && (
              <div className="ui-legal-document-meta">
                {version !== undefined && (
                  <span>{t("layout.legalDocumentShell.version", { version })}</span>
                )}
                {effectiveDate !== undefined && (
                  // <time dateTime> keeps the MACHINE-readable value as the ISO 8601 input while
                  // the visible text is the Intl-formatted, locale-correct rendering.
                  <time dateTime={effectiveDate}>
                    {t("layout.legalDocumentShell.effectiveDate", {
                      date: formatEffectiveDate(effectiveDate, locale),
                    })}
                  </time>
                )}
              </div>
            )}

            {summary !== undefined && (
              // A <div> (not <p>): the summary slot may carry block content, and a <p> inside a <p>
              // is invalid HTML the browser silently un-nests.
              <div className="ui-legal-document-summary">{summary}</div>
            )}
          </header>

          <div className="ui-legal-document-rail">
            {documentNavigation !== undefined && (
              <div data-slot="legal-document-navigation">{documentNavigation}</div>
            )}
            <nav className="ui-legal-document-toc" aria-labelledby={contentsId}>
              <p id={contentsId} className="ui-legal-document-toc-title">
                {contentsName}
              </p>
              <ol className="ui-legal-document-toc-list">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="ui-legal-document-toc-link"
                      data-active={section.id === active ? "" : undefined}
                      aria-current={section.id === active ? "location" : undefined}
                      onClick={(event) => handleContentsClick(event, section.id)}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <div className="ui-legal-document-content">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                tabIndex={-1}
                data-legal-section={section.id}
                aria-labelledby={`${section.id}-heading`}
                className="ui-legal-document-section"
              >
                <Heading level={2} id={`${section.id}-heading`}>
                  {section.title}
                </Heading>
                <div className="ui-legal-document-section-body">{section.content}</div>
              </section>
            ))}
          </div>

          {footerAction !== undefined && (
            <footer className="ui-legal-document-footer">{footerAction}</footer>
          )}
        </article>
      </div>
    );
  },
);
LegalDocumentShell.displayName = "LegalDocumentShell";
