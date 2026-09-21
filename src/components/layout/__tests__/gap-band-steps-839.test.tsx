import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

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
