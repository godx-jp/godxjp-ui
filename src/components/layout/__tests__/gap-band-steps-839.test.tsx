import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { Flex } from "../flex";
import { flexGapClass, padStepToken } from "../../../lib/variants";

/**
 * The two BAND steps, and why a token with no caller is a defect (gh#839).
 *
 * 28.8.0 shipped `--space-section-band` (80px) and `--space-section-hero` (96px) so the vertical
 * rhythm two brand showcases had hand-written became framework vocabulary. Nothing could read
 * them: `Flex pad` and `ResponsiveGrid pad` take a `GapProp` whose numeric ladder stopped at `12`
 * (`--space-12`, 48px), and 80/96 are off the end of it. So the one spacing a marketing page
 * needs most was the one spacing the layout primitives could not state, and the page that proved
 * the composition doctrine had to write an inline `style` at every band.
 *
 * `--phi-p1` and `--phi-p2` are the cautionary example this repo already carries: declared, zero
 * consumers, and a docs page labelling a 24px step "= --phi-p1" when φ¹ is 25.9px. A scale nobody
 * can reach stops describing the system and starts describing an intention.
 *
 * 20 and 24 are the SAME scale, not a second vocabulary: Carbon $spacing-11 and $spacing-12, which
 * `docs/DESIGN-AUTHORITY.md` makes this library's spacing authority and
 * `carbon-scale-alignment.test.ts` enforces.
 */
const layoutCss = readFileSync(join(process.cwd(), "src/styles/layout.css"), "utf8");

describe("gap/pad reach the marketing band steps (gh#839)", () => {
  it.each([20, 24] as const)("step %i maps to a class AND that class exists in the CSS", (step) => {
    expect(flexGapClass[step]).toBe(`ui-flex-gap-${step}`);
    // jsdom applies no author cascade, so the rule is asserted in the source — the same reason
    // gh#826's step test reads text rather than computed style.
    expect(layoutCss).toMatch(
      new RegExp(`\\.ui-flex-gap-${step}\\s*\\{\\s*gap:\\s*var\\(\\s*--space-${step}\\s*\\)`),
    );
  });

  it.each([20, 24] as const)("pad step %i resolves to the base scale, not a literal", (step) => {
    expect(padStepToken(step)).toBe(`var(--space-${step})`);
  });

  /**
   * The values, pinned. If someone retunes `--space-20` the band moves with the scale — that is
   * the point — but the ALIAS must keep pointing at the same step, or the two spellings drift and
   * a page mixing them gets two different bands.
   */
  it("the semantic aliases still name these exact steps", () => {
    const semantic = readFileSync(join(process.cwd(), "src/tokens/semantic/layout.css"), "utf8");
    expect(semantic).toMatch(/--space-section-band:\s*var\(\s*--space-20\s*\)/);
    expect(semantic).toMatch(/--space-section-hero:\s*var\(\s*--space-24\s*\)/);
  });
});

/**
 * The OTHER half of gh#839: the centred inner column.
 *
 * `--page-measure-wide` shipped in the same release as the band steps and had the same defect —
 * vocabulary with no caller. `PageContainer measure="wide"` was refused for a reason that holds
 * (a marketing page is full-bleed `<section>`s and cannot consume PageContainer's page padding or
 * its header scaffold), and the refusal left "full-bleed outside, measured column inside" owned by
 * nobody: `docs/showcase/marketing-page.tsx` wrote it as an inline `style` constant,
 * `acme-website.tsx` as `.tx-shell` and `futurelastic-web.tsx` as `.fl-shell` — the SAME four
 * declarations in three unrelated files, which `docs/TOKENS.md` calls tier 1.
 *
 * So the prop sits on `Flex`, the primitive a full-bleed `<section>` can actually put inside
 * itself, and it reads the tokens rather than printing a length.
 */
describe("Flex measure — the centred, capped column (gh#839)", () => {
  it("omitted emits NO attribute, so no rule can match", () => {
    render(<Flex data-testid="plain">x</Flex>);
    expect(screen.getByTestId("plain").hasAttribute("data-measure")).toBe(false);
  });

  it.each(["narrow", "medium", "wide"] as const)("measure=%s lands on the DOM", (value) => {
    render(
      <Flex data-testid={`m-${value}`} measure={value}>
        x
      </Flex>,
    );
    expect(screen.getByTestId(`m-${value}`)).toHaveAttribute("data-measure", value);
  });

  /**
   * jsdom applies no author cascade, so the rule is asserted in the source — the same reason the
   * gap-step test above reads text rather than computed style.
   */
  it.each(["narrow", "medium", "wide"] as const)(
    "the %s cap is the page-measure TOKEN, never a literal",
    (value) => {
      expect(layoutCss).toMatch(
        new RegExp(
          `\\.ui-flex\\[data-measure="${value}"\\]\\s*\\{\\s*max-inline-size:\\s*var\\(\\s*--page-measure-${value}\\s*\\)`,
        ),
      );
    },
  );

  /**
   * The centring half. `inline-size: 100%` is load-bearing beside `margin-inline: auto`: a Flex is
   * often a flex ITEM, and a parent that is not `align-items: stretch` shrinks it to its content,
   * at which point auto margins centre a box of the wrong size.
   */
  it("centres with logical properties only, so check:rtl needs no exception", () => {
    const rule = layoutCss.match(/\.ui-flex\[data-measure\]\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toContain("margin-inline: auto");
    expect(rule).toContain("inline-size: 100%");
    expect(rule).not.toMatch(/margin-(?:left|right)|max-width/);
  });

  /**
   * It must NOT own a gutter. `pad` already does, and one band with two padding owners is how a
   * measure and its inset drift apart — which is the whole reason three showcases each wrote
   * their own four declarations instead of sharing one.
   */
  it("adds no padding of its own", () => {
    const block =
      layoutCss.match(/\.ui-flex\[data-measure[\s\S]*?--page-measure-wide[^}]*\}/)?.[0] ?? "";
    expect(block).not.toMatch(/padding/);
  });
});
