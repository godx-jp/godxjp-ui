import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../data-display/card";
import { Button } from "../../general/button";
import { Field } from "../../data-entry/field";
import { Input } from "../../data-entry/input";
import { AuthShell } from "../auth-shell";
import { expectNoA11yViolations } from "@/test/a11y";
import { renderWithUi, screen } from "@/test/render";

/**
 * gh#232 — the canonical compact AuthShell card must be tunable on the BLOCK axis through
 * `--auth-shell-card-padding-block-compact` alone, with the INLINE column still owned by
 * `--auth-shell-compact-card-inset`.
 *
 * The cascade arithmetic is proven in `src/styles/__tests__/card-axis-independence.test.ts` (it
 * resolves the real `var()` chains out of the shipped stylesheets). What is proven HERE is the other
 * half a token needs to actually work: the DOM the selectors key off. The block padding is delivered
 * by `.ui-auth-shell[data-density="compact"] .ui-auth-shell-card` → `[data-slot="card-content"]`, so
 * the shell must emit `data-density="compact"`, the card slot must be the ancestor of the card, and
 * `CardContent` must carry the slot/flags the block rules match — at desktop AND mobile, since the
 * compact density is NOT breakpoint-scoped (only the page gutter is).
 *
 * Measured in headless Chromium on the built preview (`/isolate/layout-auth-shell`), IDENTICAL at
 * 1440×900 and 390×844 (the compact axes are not breakpoint-scoped) — `[data-slot="card-content"]`
 * computed `padding`, with the pre-gh#232 stylesheet re-injected for the A/B:
 *
 *   case                             before            after
 *   default                          12px 24px 24px    12px 24px 24px   ← unchanged (card 279.5px)
 *   knob = 14px                      14px 24px 24px    12px 24px 14px   ← card 281.5px → 259.5px
 *   knob = 14px + inset = 20px       14px 20px 20px    12px 20px 14px   ← axes now independent
 *   solo body, knob = 14px           24px              14px 24px        ← the issue's repro
 *   solo body, default               24px              24px             ← unchanged (card 217px)
 *
 * "before / knob = 14px" is the bug: the knob only moved the header↔body GAP and made the card 2px
 * TALLER, while the block edges stayed pinned to the 24px inline inset.
 */
const shellStyles = readFileSync(resolve(process.cwd(), "src/styles/shell-layout.css"), "utf8");

const VIEWPORTS = [
  ["desktop 1440", 1440],
  ["mobile 390", 390],
] as const;

function setViewport(px: number) {
  Object.defineProperty(window, "innerWidth", { value: px, configurable: true, writable: true });
}

describe.each(VIEWPORTS)("Canonical AuthShell login card at %s (gh#232)", (_label, width) => {
  it("delivers the compact block-padding scope down to the rendered card content", () => {
    setViewport(width);
    const { container } = renderWithUi(
      <AuthShell variant="canonical" brand={<span>GodX ID</span>}>
        <Card>
          <CardHeader>
            <CardTitle level={1}>ログイン</CardTitle>
            <CardDescription>アカウントにサインインしてください。</CardDescription>
          </CardHeader>
          <CardContent>
            <Field id="auth-email" label="メールアドレス">
              <Input id="auth-email" type="email" />
            </Field>
            <Button fullWidth>続ける</Button>
          </CardContent>
        </Card>
      </AuthShell>,
    );

    const shell = container.querySelector('[data-slot="auth-shell"]') as HTMLElement;
    const cardSlot = container.querySelector(".ui-auth-shell-card") as HTMLElement;
    const content = container.querySelector('[data-slot="card-content"]') as HTMLElement;

    // `[data-density="compact"] .ui-auth-shell-card` is the only hop that carries the three axis
    // tokens; if any link breaks, the public knob silently stops reaching the card again.
    expect(shell).toHaveAttribute("data-density", "compact");
    expect(cardSlot).toBeInTheDocument();
    expect(cardSlot.contains(content)).toBe(true);
    expect(content.closest('[data-slot="card"]')).toBeTruthy();
    // Block padding comes from the stylesheet, never an inline style or a Tailwind p-* utility.
    expect(content.getAttribute("style")).toBeNull();
    expect(content.className || "").not.toMatch(/\bp[btxy]?-/);
  });

  it("keeps the block edges tunable for a header-less (solo) card too", () => {
    setViewport(width);
    const { container } = renderWithUi(
      <AuthShell variant="canonical">
        <Card>
          <CardContent solo>
            <Button fullWidth>パスキーで続ける</Button>
          </CardContent>
        </Card>
      </AuthShell>,
    );

    const content = container.querySelector('[data-slot="card-content"]') as HTMLElement;
    // `solo` is the no-header body: its TOP edge is the card's block shell padding (not the
    // header↔body gap), so both of its block edges follow --auth-shell-card-padding-block-compact.
    expect(content).toHaveAttribute("data-solo", "");
    expect(content).not.toHaveAttribute("data-tight");
    expect(screen.getByRole("button", { name: "パスキーで続ける" })).toBeInTheDocument();
  });

  it("does not apply the compact axis scope at comfortable density", () => {
    setViewport(width);
    const { container } = renderWithUi(
      <AuthShell>
        <Card>
          <CardContent solo>x</CardContent>
        </Card>
      </AuthShell>,
    );
    // The three knobs are compact-only; a default AuthShell keeps the plain card rhythm.
    expect(container.querySelector('[data-slot="auth-shell"]')).toHaveAttribute(
      "data-density",
      "comfortable",
    );
  });

  it("has no axe violations for the canonical login card", async () => {
    setViewport(width);
    await expectNoA11yViolations(
      <AuthShell variant="canonical" brand={<span>GodX ID</span>}>
        <Card>
          <CardHeader>
            <CardTitle level={1}>Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            <Field id={`axe-email-${width}`} label="Email">
              <Input id={`axe-email-${width}`} type="email" />
            </Field>
            <Button fullWidth>Continue</Button>
          </CardContent>
        </Card>
      </AuthShell>,
    );
  });
});

describe("AuthShell compact card block padding is not breakpoint-scoped (gh#232)", () => {
  it("declares the axis scope outside every media query, so it holds at 1440 and 390", () => {
    const scopeAt = shellStyles.indexOf(
      '.ui-auth-shell[data-density="compact"] .ui-auth-shell-card {',
    );
    const firstMediaAt = shellStyles.indexOf("@media (max-width: 30rem)");
    expect(scopeAt).toBeGreaterThan(-1);
    expect(firstMediaAt).toBeGreaterThan(-1);
    // Only the page gutter is responsive; the card's own axes must not change with the viewport.
    expect(scopeAt).toBeLessThan(firstMediaAt);
    const mobileBlock = shellStyles.slice(firstMediaAt, shellStyles.indexOf("\n  }", firstMediaAt));
    expect(mobileBlock).not.toMatch(/--card-space-(shell-y|inset|body-y)/);
  });
});
