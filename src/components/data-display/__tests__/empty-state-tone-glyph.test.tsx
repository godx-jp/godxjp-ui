import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Inbox } from "lucide-react";

import { EmptyState } from "../empty-state";

/**
 * Regression — `tone` must actually colour the GLYPH, not just the medallion tint.
 *
 * `.ui-empty-state-icon` sets `color: var(--empty-state-icon-foreground, hsl(var(--muted-foreground)))`
 * and each `[data-tone="…"]` rule re-points that token. But the component used to render the icon
 * with a hard-coded `className="text-muted-foreground size-6"`; the utility out-specified the
 * inherited colour, so EVERY tone painted a muted glyph and only the medallion fill varied — the
 * token was half-dead. Measured in Chromium before the fix: medallion colour tracked the tone
 * (success rgb(105,191,142) · warning rgb(250,183,0) · destructive rgb(184,40,48) ·
 * info rgb(77,109,179)) while the svg stayed rgb(112,110,102) for all five.
 *
 * jsdom does not cascade the real stylesheet, so this guard pins the two halves that make the
 * cascade work: (a) the component ships NO colour utility on the glyph, and (b) the stylesheet
 * still routes the medallion colour through the role-mirror token.
 */

const layoutCss = readFileSync(join(process.cwd(), "src/styles/layout.css"), "utf8");
const feedbackTokens = readFileSync(
  join(process.cwd(), "src/tokens/components/feedback.css"),
  "utf8",
);

const TONES = ["muted", "success", "warning", "destructive", "info"] as const;

describe("EmptyState tone → glyph colour", () => {
  it("renders the glyph with NO colour utility, so it inherits the tone token", () => {
    const { container } = render(<EmptyState icon={Inbox} title="なし" tone="success" />);
    const svg = container.querySelector(".ui-empty-state-icon svg")!;
    expect(svg).toBeInTheDocument();
    // The exact bug: any text-* colour utility re-pins the glyph and defeats every tone.
    expect(svg.getAttribute("class")).not.toMatch(/\btext-[a-z-]*foreground\b/);
    expect(svg.getAttribute("class")).not.toMatch(/\btext-(muted|primary|destructive)\b/);
    // Geometry moved into `.ui-empty-state-icon svg` so the glyph and its medallion scale
    // together from --empty-state-icon-glyph-size / --empty-state-icon-size (#319). The glyph
    // now carries NO class at all, which is the stronger statement: nothing on it can re-pin
    // either the colour this test guards or the size.
    // (lucide stamps its own `lucide-*` marker, so assert the absence of a SIZE utility rather
    // than the absence of any class.)
    expect(svg.getAttribute("class") ?? "").not.toMatch(/\bsize-\d/);
  });

  it("stamps every tone on the root so the CSS rule can retarget the token", () => {
    for (const tone of TONES) {
      const { container } = render(<EmptyState icon={Inbox} title="なし" tone={tone} />);
      expect(container.querySelector('[data-slot="empty-state"]')).toHaveAttribute(
        "data-tone",
        tone,
      );
    }
  });

  it("defaults to tone=muted — the untoned rendering is unchanged", () => {
    const { container } = render(<EmptyState icon={Inbox} title="なし" />);
    expect(container.querySelector('[data-slot="empty-state"]')).toHaveAttribute(
      "data-tone",
      "muted",
    );
  });

  it("medallion colour + tint read their knobs with the role default at the CALL SITE", () => {
    // Role-mirror rule (docs/TOKENS.md): `initial` at :root, role default in the var() fallback —
    // otherwise a scoped [data-tenant]/.dark override of --muted-foreground never reaches the glyph.
    expect(feedbackTokens).toMatch(/--empty-state-icon-foreground:\s*initial/);
    expect(feedbackTokens).toMatch(/--empty-state-icon-tint:\s*initial/);
    expect(layoutCss).toMatch(
      /color:\s*var\(--empty-state-icon-foreground,\s*hsl\(var\(--muted-foreground\)\)\)/,
    );
    expect(layoutCss).toMatch(
      /background-color:\s*var\(--empty-state-icon-tint,\s*hsl\(var\(--muted\)\)\)/,
    );
  });

  it("keeps the glyph decorative — tone is never the only carrier of meaning", () => {
    // The glyph uses the RAW role (`hsl(var(--success))`), matching the shipped Alert convention
    // (`[data-slot="alert-icon"][data-tone="success"] { color: hsl(var(--success)) }`), NOT the
    // contrast-tuned `--text-*` role that Alert reserves for its TITLE. Measured in Chromium the
    // two now agree: EmptyState success 2.00:1 / warning 1.62:1 vs Alert 2.11:1 / 1.69:1 on the
    // same ~12% tint. That is legitimate only because the glyph is decorative — `aria-hidden`, with
    // the meaning carried by the title + description — so WCAG 2.2 SC 1.4.11 (which covers graphics
    // "required to understand the content") does not apply. This test pins BOTH halves of that
    // bargain: if the glyph ever stops being aria-hidden, the low-contrast tint palette becomes a
    // real violation and this fails.
    const { container } = render(
      <EmptyState
        icon={Inbox}
        title="承認済み"
        description="端末は承認されました。"
        tone="success"
      />,
    );
    const svg = container.querySelector(".ui-empty-state-icon svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    // Meaning lives in text, not in the tone colour.
    expect(container.querySelector(".ui-empty-state-title")).toHaveTextContent("承認済み");
    expect(container.querySelector(".ui-empty-state-description")).toHaveTextContent(
      "端末は承認されました。",
    );
  });

  it("each non-muted tone re-points BOTH the glyph colour and the medallion tint", () => {
    for (const [tone, role] of [
      ["success", "success"],
      ["warning", "warning"],
      ["destructive", "destructive"],
      ["info", "info"],
    ] as const) {
      const rule = layoutCss.slice(
        layoutCss.indexOf(`.ui-empty-state[data-tone="${tone}"]`),
        layoutCss.indexOf(`.ui-empty-state[data-tone="${tone}"]`) + 260,
      );
      expect(rule).toContain(`--empty-state-icon-foreground: hsl(var(--${role}))`);
      expect(rule).toContain(`--empty-state-icon-tint: hsl(var(--${role}) / 0.12)`);
    }
  });
});
