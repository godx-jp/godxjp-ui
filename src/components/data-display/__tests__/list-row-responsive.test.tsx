import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { renderWithUi, screen, userEvent } from "@/test/render";
import { Button } from "../../general/button";
import { Card, CardContent } from "../card";
import { ListRow } from "../list-row";

/**
 * gh#224 — a long title plus two trailing Buttons must never make
 * `document.documentElement.scrollWidth > window.innerWidth` at a responsive acceptance viewport,
 * and gh#225 — a notification row must keep that guarantee with the unread indicator + timestamp.
 *
 * jsdom performs NO layout, so a real scrollWidth measurement is impossible here (same reasoning
 * as src/styles/__tests__/scroll-containment.test.ts). These tests therefore split the guarantee:
 *   1. the CSS CONTRACT that produces the behaviour is asserted against the stylesheet, so it
 *      cannot be silently removed (shrinkable row + content column, wrapping trailing actions);
 *   2. the RENDERED CONTRACT (structure, keyboard order, focusability) is asserted at the two
 *      acceptance widths with long JA/EN/VI labels and two trailing Buttons.
 * Real pixel behaviour is re-verified in a browser at ship time (display-runtime evidence).
 */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const layoutCss = read("../../../styles/data-display-layout.css");
const tokenCss = read("../../../tokens/components/list-row.css");
const rule = (selector: string) => {
  const at = layoutCss.indexOf(selector + " {");
  expect(at, `missing CSS rule for ${selector}`).toBeGreaterThan(-1);
  return layoutCss.slice(at, layoutCss.indexOf("}", at) + 1);
};

/** Long organization / notification titles — JA, EN and VI (issue #224 + #225). */
const LONG_TITLE = {
  ja: "グローバル・トランスフォーメーション推進本部 デジタルプラットフォーム統括部",
  en: "Acme Global Transformation Office — Data Platform Division (Asia Pacific)",
  vi: "Trung tâm Điều phối Chuyển đổi số và Quản trị Dữ liệu Doanh nghiệp Toàn cầu",
} as const;

function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", { value: width, configurable: true, writable: true });
}

describe("ListRow overflow CSS contract (gh#224)", () => {
  it("lets the ROW itself shrink and wrap instead of widening its container", () => {
    const row = rule('[data-slot="list-row"]');
    expect(row).toMatch(/min-inline-size:\s*0/);
    expect(row).toMatch(/flex-wrap:\s*wrap/);
    // logical properties only — the row must flip under dir="rtl"
    expect(row).not.toMatch(/(?:^|[^-])(?:margin|padding)-(?:left|right)\s*:/);
  });

  it("lets the CONTENT COLUMN shrink below its intrinsic width, clamped to the container", () => {
    const body = rule('[data-slot="list-row-body"]');
    // min(…, 100%) is load-bearing: a container narrower than the knob must NOT be widened by it.
    expect(body).toMatch(/min-inline-size:\s*min\(var\(--list-row-body-min-width[^)]*\),\s*100%\)/);
    expect(body).not.toMatch(/(?:^|[^-])min-width\s*:/);
    expect(tokenCss).toMatch(/--list-row-body-min-width:\s*\S+/);
  });

  it("wraps the trailing actions onto their own line at narrow widths", () => {
    const trailing = rule('[data-slot="list-row-trailing"]');
    expect(trailing).toMatch(/flex-wrap:\s*wrap/);
    expect(trailing).toMatch(/max-inline-size:\s*100%/);
    expect(trailing).toMatch(/gap:\s*var\(--list-row-trailing-gap/);
    // still end-aligned, via a LOGICAL margin (RTL-safe)
    expect(trailing).toMatch(/margin-inline-start:\s*auto/);
    expect(tokenCss).toMatch(/--list-row-trailing-gap:\s*\S+/);
  });

  it("breaks long unbroken tokens in overflow='wrap' so they cannot widen the row", () => {
    expect(layoutCss).toMatch(
      /\[data-slot="list-row"\]\[data-overflow="wrap"\][^{]*\{[^}]*overflow-wrap:\s*anywhere/,
    );
  });

  it("tokenizes the unread / read surfaces as role-mirror knobs (gh#225)", () => {
    // `initial` at :root + the role default at the CALL SITE (docs/TOKENS.md — the :root freeze rule)
    expect(tokenCss).toMatch(/--list-row-unread-background:\s*initial/);
    expect(tokenCss).toMatch(/--list-row-read-background:\s*initial/);
    expect(tokenCss).toMatch(/--list-row-indicator-color:\s*initial/);
    expect(rule('[data-slot="list-row"]')).toMatch(
      /background:\s*var\(--list-row-read-background,\s*transparent\)/,
    );
    expect(layoutCss).toMatch(
      /\[data-slot="list-row"\]\[data-unread\]\s*\{[^}]*background:\s*var\(--list-row-unread-background,\s*hsl\(var\(--muted\)\)\)/,
    );
    expect(layoutCss).toMatch(/hsl\(var\(--list-row-indicator-color,\s*var\(--primary\)\)\)/);
    // the dot keeps its gutter on read rows (titles stay on one optical axis) but paints nothing
    expect(rule('[data-slot="list-row-indicator"]')).toMatch(/background:\s*transparent/);
  });
});

/**
 * gh#246 — `density="compact"` is the compact inline-actions geometry: inside the canonical 358px
 * card (326px content) a 36px Avatar, a shrinkable title/description and two small trailing Buttons
 * must stay on ONE line, and a history Badge + date must stay inline with the title — WITHOUT
 * giving up the #224 wrap that keeps the page root from scrolling.
 *
 * Browser evidence (Playwright/Chromium, preview `data-display-list-row`, `documentElement`
 * scrollWidth === clientWidth at every width):
 *   390 — default invitation rows 126 / 147 / 101px tall, trailing cluster WRAPPED to its own line;
 *         compact invitation rows 62 / 62 / 62px, trailing cluster INLINE (body 141–180px);
 *         compact history rows (Badge + ISO date) 40–41px, inline — canonical 42px.
 *   1024 / 1440 — compact invitation 62px, history 40–41px, all clusters inline.
 *   A compact row whose actions genuinely cannot fit (186px cluster in a 324px column) still wraps:
 *   134px tall at 390 with scrollWidth 390 === clientWidth — the #224 safety net is intact.
 */
describe("ListRow compact inline-actions CSS contract (gh#246)", () => {
  it("lowers the body threshold for compact rows, still clamped to the container", () => {
    const body = rule('[data-slot="list-row"][data-density="compact"] [data-slot="list-row-body"]');
    // min(…, 100%) is load-bearing here too — compact must never widen a narrower container (#224)
    expect(body).toMatch(
      /min-inline-size:\s*min\(var\(--list-row-compact-body-min-width[^)]*\),\s*100%\)/,
    );
    expect(body).toMatch(/flex-basis:\s*var\(--list-row-compact-body-min-width/);
    expect(tokenCss).toMatch(/--list-row-compact-body-min-width:\s*\S+/);
  });

  it("tightens the compact row inset and gap through tokens only", () => {
    const row = rule('[data-slot="list-row"][data-density="compact"]');
    expect(row).toMatch(/gap:\s*var\(--list-row-compact-gap/);
    expect(row).toMatch(/padding:\s*var\(--list-row-compact-padding-y/);
    expect(row).toMatch(/var\(--list-row-compact-padding-x/);
    // logical only — the compact inset must flip under dir="rtl"
    expect(row).not.toMatch(/(?:^|[^-])(?:margin|padding)-(?:left|right)\s*:/);
    // no literal geometry: every compact constant is a documented knob (#45)
    expect(row).not.toMatch(/:\s*\d+(?:\.\d+)?(?:px|rem)/);
  });

  it("declares the compact spacing knobs `initial` so density scopes re-resolve them", () => {
    // docs/TOKENS.md — a :root binding to a density-scaled token freezes compact rows at the :root
    // density; `initial` + a call-site default lets a `.ui-density-*` subtree re-resolve it.
    for (const token of [
      "--list-row-compact-padding-y",
      "--list-row-compact-padding-x",
      "--list-row-compact-gap",
    ]) {
      expect(tokenCss).toMatch(new RegExp(`${token}:\\s*initial`));
    }
  });

  it("leaves the #224 overflow contract (row + trailing wrap) untouched for compact rows", () => {
    // compact must not re-declare flex-wrap / min-inline-size on the row or the trailing cluster
    const row = rule('[data-slot="list-row"][data-density="compact"]');
    expect(row).not.toMatch(/flex-wrap/);
    expect(row).not.toMatch(/min-inline-size/);
    expect(layoutCss).not.toMatch(
      /\[data-density="compact"\][^{]*\[data-slot="list-row-trailing"\][^{]*\{[^}]*flex-wrap:\s*nowrap/,
    );
  });
});

describe.each([
  ["720px content column", 720],
  ["390px viewport", 390],
])("ListRow at %s with long JA/EN/VI titles + two trailing Buttons", (_label, width) => {
  const originalWidth = window.innerWidth;
  beforeEach(() => setViewport(width));
  afterEach(() => setViewport(originalWidth));

  const rows = (
    <Card>
      <CardContent flush style={{ inlineSize: `${width}px` }}>
        {(["ja", "en", "vi"] as const).map((locale) => (
          <ListRow
            key={locale}
            align="start"
            overflow="wrap"
            unread={locale === "ja"}
            title={LONG_TITLE[locale]}
            description="2026-07-30 09:12"
            trailing={
              <>
                <Button size="xs" variant="ghost">
                  {`Decline ${locale}`}
                </Button>
                <Button size="xs" variant="outline">
                  {`Accept ${locale}`}
                </Button>
              </>
            }
          />
        ))}
      </CardContent>
    </Card>
  );

  it("renders every row with a shrinkable body and a wrapping trailing slot", () => {
    const { container } = renderWithUi(rows);
    const listRows = container.querySelectorAll('[data-slot="list-row"]');
    expect(listRows).toHaveLength(3);
    for (const row of listRows) {
      expect(row.querySelector('[data-slot="list-row-body"]')).not.toBeNull();
      expect(row.querySelectorAll('[data-slot="list-row-trailing"] button')).toHaveLength(2);
      // wrap mode: the title is NOT clamped to one line, so nothing is visually lost at 390px
      expect(row.querySelector('[data-slot="text"]')).not.toHaveAttribute("data-truncate");
    }
    expect(screen.getByText(LONG_TITLE.ja)).toBeInTheDocument();
    expect(screen.getByText(LONG_TITLE.en)).toBeInTheDocument();
    expect(screen.getByText(LONG_TITLE.vi)).toBeInTheDocument();
  });

  it("keeps keyboard order in DOM order and every action focusable", async () => {
    const user = userEvent.setup();
    renderWithUi(rows);
    const expected = ["ja", "en", "vi"].flatMap((locale) => [
      `Decline ${locale}`,
      `Accept ${locale}`,
    ]);
    for (const name of expected) {
      await user.tab();
      expect(screen.getByRole("button", { name })).toHaveFocus();
    }
  });
});

describe.each([
  ["720px container", 720],
  ["390px viewport", 390],
])("ListRow density='compact' at %s (gh#246)", (_label, width) => {
  const originalWidth = window.innerWidth;
  beforeEach(() => setViewport(width));
  afterEach(() => setViewport(originalWidth));

  const compact = (
    <Card>
      <CardContent flush style={{ inlineSize: `${width}px` }}>
        {(["ja", "en", "vi"] as const).map((locale) => (
          <ListRow
            key={locale}
            density="compact"
            leading={<span aria-hidden="true">◐</span>}
            title={LONG_TITLE[locale]}
            description="2026-07-30"
            trailing={
              <>
                <Button size="xs" variant="ghost">
                  {`Decline ${locale}`}
                </Button>
                <Button size="xs" variant="outline">
                  {`Accept ${locale}`}
                </Button>
              </>
            }
          />
        ))}
      </CardContent>
    </Card>
  );

  it("marks the row compact so it picks up the compact geometry", () => {
    const { container } = renderWithUi(compact);
    const listRows = container.querySelectorAll('[data-slot="list-row"]');
    expect(listRows).toHaveLength(3);
    for (const row of listRows) {
      expect(row).toHaveAttribute("data-density", "compact");
      expect(row.querySelectorAll('[data-slot="list-row-trailing"] button')).toHaveLength(2);
    }
  });

  it("keeps the default density attribute-free (no compact geometry unless asked)", () => {
    const { container } = renderWithUi(<ListRow title="既定" />);
    expect(container.querySelector('[data-slot="list-row"]')).not.toHaveAttribute("data-density");
  });

  it("keeps keyboard order and focusability unchanged in compact rows", async () => {
    const user = userEvent.setup();
    renderWithUi(compact);
    const expected = ["ja", "en", "vi"].flatMap((locale) => [
      `Decline ${locale}`,
      `Accept ${locale}`,
    ]);
    for (const name of expected) {
      await user.tab();
      expect(screen.getByRole("button", { name })).toHaveFocus();
    }
  });

  it("still supports the #224 escape hatches (overflow='wrap' + align='start') when compact", () => {
    const { container } = renderWithUi(
      <ListRow density="compact" align="start" overflow="wrap" title={LONG_TITLE.ja} />,
    );
    const row = container.querySelector('[data-slot="list-row"]');
    expect(row).toHaveAttribute("data-density", "compact");
    expect(row).toHaveAttribute("data-overflow", "wrap");
    expect(row).toHaveAttribute("data-align", "start");
  });
});
