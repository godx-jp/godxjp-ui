import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * AuthShell named flow presets.
 *
 * The consumer blocker in both issues is that the canonical artboard measures could only be hit by
 * a page-local `--auth-shell-card-max-width` override. These tests pin the PUBLIC token contract so
 * the geometry can never silently drift back into consumer CSS: every measure is a component token,
 * the presets are declared AFTER `variant="canonical"` (equal specificity → source order decides,
 * which is what lets `variant="canonical" preset="…"` compose), and the mobile gutters live in the
 * one shared `max-width: 30rem` block. jsdom does no layout, so the arithmetic that the artboards
 * assert (390 − 2×5 = 380) is verified here as the declared token values.
 */
const shellStyles = readFileSync(resolve(process.cwd(), "src/styles/shell-layout.css"), "utf8");
const shellTokens = readFileSync(resolve(process.cwd(), "src/tokens/components/shell.css"), "utf8");
/** Every shipped layer, so a probe class is checked against the whole stylesheet set. */
const allLayerCss = readdirSync(resolve(process.cwd(), "src/styles"))
  .filter((f) => f.endsWith(".css"))
  .map((f) => readFileSync(resolve(process.cwd(), "src/styles", f), "utf8"))
  .join("\n");

const authBlock = (selector: string) =>
  shellStyles.match(
    new RegExp(`\\.ui-auth-shell\\[data-preset="${selector}"\\]\\s*\\{[^}]*\\}`, "g"),
  ) ?? [];

describe("AuthShell flow presets — token-owned geometry", () => {
  it("keeps the canonical defaults untouched (backward compatible)", () => {
    // Adding the wide device measure must not move the existing canonical 360px/15px flow.
    expect(shellTokens).toContain("--auth-shell-canonical-card-max-width: 22.5rem;");
    expect(shellTokens).toContain("--auth-shell-canonical-main-padding: 1rem;");
    expect(shellTokens).toContain("--auth-shell-canonical-main-padding-mobile: 0.9375rem;");
    // …and the un-preset shell keeps its own 24rem measure.
    expect(shellTokens).toContain("--auth-shell-card-max-width: 24rem;");
  });

  it("login owns one stable SCR-001 card anchor across all canonical viewports (gh#237)", () => {
    expect(shellTokens).toContain("--auth-shell-login-card-max-width: 22.5rem;");
    expect(shellTokens).toContain("--auth-shell-login-flow-offset-block: 14.4375rem;");
    expect(shellTokens).toContain("--auth-shell-login-flow-offset-block-mobile: 13.8125rem;");
    expect(shellTokens).toContain("--auth-shell-login-identity-slot-block-size: 7rem;");
    expect(shellTokens).toContain("--auth-shell-login-card-stack-gap: 1.25rem;");

    const [desktop] = authBlock("login");
    expect(desktop).toMatch(
      /--auth-shell-card-max-width:\s*var\(--auth-shell-login-card-max-width\)/,
    );
    expect(desktop).toMatch(/--auth-shell-main-align:\s*flex-start/);
    expect(shellStyles).toMatch(
      /data-preset="login"[^}]*\.ui-auth-shell-card\s*\{[^}]*grid-template-rows:\s*var\(--auth-shell-login-identity-slot-block-size\) auto auto;/s,
    );
    expect(shellStyles).toMatch(
      /data-preset="login"[^}]*\.ui-auth-requester > :last-child\s*\{[^}]*overflow-wrap:\s*anywhere;/s,
    );
  });

  it("device-authorization owns a 380px card measure and a 5px mobile inline gutter (gh#220)", () => {
    // 23.75rem = 380px; 0.3125rem = 5px → at a 390px viewport the card is x=5px, width=380px.
    expect(shellTokens).toContain("--auth-shell-device-card-max-width: 23.75rem;");
    expect(shellTokens).toContain("--auth-shell-device-main-padding: 1rem;");
    expect(shellTokens).toContain("--auth-shell-device-main-padding-mobile: 0.9375rem 0.3125rem;");

    const [desktop] = authBlock("device-authorization");
    expect(desktop).toMatch(
      /--auth-shell-card-max-width:\s*var\(--auth-shell-device-card-max-width\)/,
    );
    expect(desktop).toMatch(/--auth-shell-main-padding:\s*var\(--auth-shell-device-main-padding\)/);
  });

  it("device-authorization also owns its CODE FIELD measure (gh#12)", () => {
    // The preset's SUBJECT is the code. Left on the generic square --otp-slot-size it fell back to
    // the canonical 36px control tier, so two 4-slot `appearance="grouped"` boxes rendered 146x38
    // against a 112x54 artboard: 4 x 36 + 2 x 1px group border = 146 wide, 36 + 2 = 38 tall.
    // 1.71875rem = 27.5px → 4 x 27.5 + 2 = 112. 3.25rem = 52px → 52 + 2 = 54.
    expect(shellTokens).toContain("--auth-shell-device-otp-slot-inline-size: 1.71875rem;");
    expect(shellTokens).toContain("--auth-shell-device-otp-slot-block-size: 3.25rem;");

    const [desktop] = authBlock("device-authorization");
    expect(desktop).toMatch(
      /--otp-slot-inline-size:\s*var\(--auth-shell-device-otp-slot-inline-size\)/,
    );
    expect(desktop).toMatch(
      /--otp-slot-block-size:\s*var\(--auth-shell-device-otp-slot-block-size\)/,
    );
    // Handed to the PUBLIC per-axis knobs, never to a `.ui-otp-*` selector inside the shell —
    // a shell that reaches into another component's internals is the fork this preset replaces.
    expect(shellStyles).not.toMatch(/data-preset="device-authorization"[^{]*\.ui-otp-/);
  });

  it("context-selection owns a 25rem card measure and an edge-to-edge mobile gutter (gh#217)", () => {
    expect(shellTokens).toContain("--auth-shell-context-card-max-width: 25rem;");
    expect(shellTokens).toContain("--auth-shell-context-main-padding-mobile: var(--space-6) 0;");
    expect(shellTokens).toContain("--auth-shell-context-card-stack-gap: 1rem;");

    const [desktop] = authBlock("context-selection");
    expect(desktop).toMatch(
      /--auth-shell-card-max-width:\s*var\(--auth-shell-context-card-max-width\)/,
    );
    expect(desktop).toMatch(
      /--auth-shell-card-stack-gap:\s*var\(--auth-shell-context-card-stack-gap\)/,
    );
  });

  it("puts every preset mobile gutter in the shared 30rem block, after the canonical one", () => {
    const mobile = shellStyles.match(/@media \(max-width: 30rem\)\s*\{[\s\S]*?\n {2}\}/)?.[0] ?? "";
    const canonical = mobile.indexOf('[data-variant="canonical"]');
    const login = mobile.indexOf('[data-preset="login"]');
    const device = mobile.indexOf('[data-preset="device-authorization"]');
    const context = mobile.indexOf('[data-preset="context-selection"]');

    expect(canonical).toBeGreaterThan(-1);
    expect(login).toBeGreaterThan(canonical);
    // Equal specificity (0,2,0) — the preset MUST come last or canonical's 15px inset would win.
    expect(device).toBeGreaterThan(canonical);
    expect(context).toBeGreaterThan(canonical);
    expect(mobile).toMatch(
      /--auth-shell-main-padding:\s*var\(--auth-shell-device-main-padding-mobile\)/,
    );
    expect(mobile).toMatch(
      /--auth-shell-main-padding:\s*var\(--auth-shell-context-main-padding-mobile\)/,
    );
    expect(mobile).toMatch(/var\(--auth-shell-login-flow-offset-block-mobile\)/);
  });

  it("registration owns the 360px sign-up measure and a 15px mobile inline gutter (gh#256)", () => {
    // 22.5rem = 360px, matching preset="login" exactly; 0.9375rem = 15px ⇒ at 390 the card is
    // x=15, width=360, so sign-in → sign-up never shifts the surface on a phone.
    expect(shellTokens).toContain("--auth-shell-registration-card-max-width: 22.5rem;");
    expect(shellTokens).toContain("--auth-shell-registration-main-padding-inline: 1rem;");
    expect(shellTokens).toContain(
      "--auth-shell-registration-main-padding-inline-mobile: 0.9375rem;",
    );

    const [desktop] = authBlock("registration");
    expect(desktop).toMatch(
      /--auth-shell-card-max-width:\s*var\(--auth-shell-registration-card-max-width\)/,
    );
    expect(desktop).toMatch(
      /--auth-shell-card-stack-gap:\s*var\(--auth-shell-registration-card-stack-gap\)/,
    );

    // The mobile gutter must live in the ONE shared max-width:30rem block, after the canonical
    // mobile inset, so it wins at equal specificity like every other preset.
    const mobileBlock = shellStyles.match(/@media \(max-width: 30rem\)\s*\{[\s\S]*?\n {2}\}/)?.[0];
    expect(mobileBlock).toMatch(
      /data-preset="registration"[^}]*--auth-shell-registration-main-padding-inline-mobile/s,
    );
  });

  it("registration places its card with auto margins, never a scroll-making inset (gh#256)", () => {
    /*
     * The SCR-002 anchor (card y=284 at 1440x900) used to be held by an unconditional 9.5rem
     * block-start inset. Measured in Chromium at 1440x900 that produced 152px of EMPTY SPACE +
     * 793px of content + 48px = 993px in a 900px viewport: the page scrolled 93px and the
     * scrolled region was blank. Decoration above the fold is not worth a scrollbar, so the
     * anchor yields to auto margins — the same technique `measure="wide"` uses one screen up.
     *
     * Auto margins absorb only free space that exists: roomy viewport ⇒ centred, full viewport ⇒
     * they resolve to 0 and the card sits at the gutter, so every scrolled pixel is content.
     * Verified in a consumer at 1440x{1080,900,800,720} and 390x844: card top
     * 127 / 37 / 16 / 16 / 17 with overflow 0 / 0 / 57 / 137 / 0 — and the two overflows are
     * content taller than the viewport, not padding.
     */
    expect(shellStyles).toMatch(
      /\.ui-auth-shell\[data-preset="registration"\] \.ui-auth-shell-card\s*\{[^}]*margin-block:\s*auto/s,
    );
    // The block-start is now an ordinary page gutter, matching the inline one, NOT the artboard
    // offset. If it ever goes back to a multi-rem constant the scrollbar comes back with it.
    expect(shellTokens).toContain("--auth-shell-registration-main-padding-block-start: 1rem;");
    expect(shellTokens).toContain(
      "--auth-shell-registration-main-padding-block-start-mobile: 0.9375rem;",
    );
    const px = (token: string) => {
      const rem = shellTokens.match(new RegExp(`${token}:\\s*([\\d.]+)rem;`))?.[1];
      return rem ? parseFloat(rem) * 16 : NaN;
    };
    expect(px("--auth-shell-registration-main-padding-block-start")).toBeLessThanOrEqual(24);

    // The parts the anchor was built from stay pinned: the identity track still absorbs copy
    // length so the card cannot ride on it, and the stack rhythm is unchanged.
    expect(shellTokens).toContain("--auth-shell-registration-identity-slot-block-size: 7rem;");
    expect(shellTokens).toContain("--auth-shell-registration-card-stack-gap: 1.25rem;");
  });

  it("registration pins the identity track so copy length cannot move the anchor (gh#256)", () => {
    // Without the fixed track the card rides on the identity block's own height, so the canonical
    // y would hold for exactly one copy length. With it, absent / short / wrapped two-line
    // identity copy changes only the empty space above the content. Content aligns to the slot
    // END, as `login` does.
    expect(shellStyles).toMatch(
      /data-preset="registration"\][^{]*\.ui-auth-shell-card > \.ui-auth-identity\s*\{[^}]*block-size:\s*var\(--auth-shell-registration-identity-slot-block-size\)/s,
    );
    expect(shellStyles).toMatch(
      /data-preset="registration"\][^{]*\.ui-auth-shell-card > \.ui-auth-identity\s*\{[^}]*justify-content:\s*flex-end/s,
    );
  });

  it("registration is start-aligned like login — a tall sign-up card must scroll (gh#256)", () => {
    // A vertically CENTRED tall card overflows ABOVE the scroll origin on a short viewport, which
    // makes its first field unreachable. This is the whole reason the preset exists separately
    // from re-using a centred measure, so it is pinned rather than left to a future "tidy-up" to
    // undo. The three centred presets stay centred (they never touch the alignment knob).
    const [desktop] = authBlock("registration");
    expect(desktop).toMatch(/--auth-shell-main-align:\s*flex-start/);

    for (const other of ["device-authorization", "context-selection", "account-recovery"]) {
      const [rule] = authBlock(other);
      expect(rule).not.toMatch(/--auth-shell-main-align/);
    }
  });

  it("registration keeps footer clearance on its own knob, not mirrored from the top inset", () => {
    // At the end of a long scroll the legal/consent footer must not sit flush against the submit
    // button, so the block-end inset is a knob of its own. It is deliberately NOT derived from the
    // block-start offset: that one is pinned to the canonical card anchor (see the anchor test),
    // which says nothing about how much room the footer needs below a long form.
    expect(shellTokens).toContain("--auth-shell-registration-main-padding-block-end: 3rem;");
    expect(shellTokens).toContain("--auth-shell-registration-main-padding-block-end-mobile: 2rem;");
  });

  it("declares the preset rules after the canonical variant so the two compose", () => {
    const canonical = shellStyles.indexOf('.ui-auth-shell[data-variant="canonical"] {');
    const login = shellStyles.indexOf('.ui-auth-shell[data-preset="login"] {');
    const device = shellStyles.indexOf('.ui-auth-shell[data-preset="device-authorization"] {');
    const context = shellStyles.indexOf('.ui-auth-shell[data-preset="context-selection"] {');
    expect(canonical).toBeGreaterThan(-1);
    expect(login).toBeGreaterThan(canonical);
    expect(device).toBeGreaterThan(canonical);
    expect(context).toBeGreaterThan(canonical);
  });

  it("gives a preset a tokenized intro/card/remember rhythm that is quiet by default", () => {
    // Rule #44 — chrome is a token whose default is the quietest state, so the un-preset shell
    // (and every existing single-card consumer) is byte-for-byte unchanged.
    expect(shellTokens).toContain("--auth-shell-card-stack-gap: 0px;");
    expect(shellStyles).toMatch(
      /\.ui-auth-shell\[data-preset\] \.ui-auth-shell-card\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;[^}]*gap:\s*var\(--auth-shell-card-stack-gap\);/s,
    );
  });

  it("registration owns the 360px sign-up measure and a 15px mobile inline gutter (gh#256)", () => {
    // 22.5rem = 360px, matching preset="login" exactly; 0.9375rem = 15px ⇒ at 390 the card is
    // x=15, width=360, so sign-in → sign-up never shifts the surface on a phone.
    expect(shellTokens).toContain("--auth-shell-registration-card-max-width: 22.5rem;");
    expect(shellTokens).toContain("--auth-shell-registration-main-padding-inline: 1rem;");
    expect(shellTokens).toContain(
      "--auth-shell-registration-main-padding-inline-mobile: 0.9375rem;",
    );

    const [desktop] = authBlock("registration");
    expect(desktop).toMatch(
      /--auth-shell-card-max-width:\s*var\(--auth-shell-registration-card-max-width\)/,
    );
    expect(desktop).toMatch(
      /--auth-shell-card-stack-gap:\s*var\(--auth-shell-registration-card-stack-gap\)/,
    );

    // The mobile gutter must live in the ONE shared max-width:30rem block, after the canonical
    // mobile inset, so it wins at equal specificity like every other preset.
    const mobileBlock = shellStyles.match(/@media \(max-width: 30rem\)\s*\{[\s\S]*?\n {2}\}/)?.[0];
    expect(mobileBlock).toMatch(
      /data-preset="registration"[^}]*--auth-shell-registration-main-padding-inline-mobile/s,
    );
  });

  it("keeps the identity track and stack rhythm the anchor was built from (gh#256)", () => {
    /*
     * This case used to assert the anchor arithmetic itself —
     *   padding-block-start + identity slot + stack gap === 284 (and 274 on mobile)
     * — which is no longer the contract: the block-start is a page gutter and the auto margins in
     * shell-layout.css decide the placement. See the placement case above for why the artboard
     * anchor yielded (152px of empty space manufactured a 93px scrollbar at 1440x900).
     *
     * The other two terms still matter and stay pinned. The 112px identity track is what absorbs
     * absent / one-line / two-line copy, so the card never rides on the identity block's own
     * height; the 20px stack gap is the section rhythm shared with login.
     */
    expect(shellTokens).toContain("--auth-shell-registration-identity-slot-block-size: 7rem;");
    expect(shellTokens).toContain("--auth-shell-registration-card-stack-gap: 1.25rem;");
    expect(shellStyles).toMatch(
      /data-preset="registration"\][^{]*\.ui-auth-shell-card > \.ui-auth-identity\s*\{[^}]*block-size:\s*var\(--auth-shell-registration-identity-slot-block-size\)/s,
    );
  });

  it("registration pins the identity track so copy length cannot move the anchor (gh#256)", () => {
    // With it, headless Chromium measured card y=274 identically for absent, short and wrapped
    // two-line requester copy. Content aligns to the slot END, as `login` does.
    expect(shellStyles).toMatch(
      /data-preset="registration"\][^{]*\.ui-auth-shell-card > \.ui-auth-identity\s*\{[^}]*block-size:\s*var\(--auth-shell-registration-identity-slot-block-size\)/s,
    );
    expect(shellStyles).toMatch(
      /data-preset="registration"\][^{]*\.ui-auth-shell-card > \.ui-auth-identity\s*\{[^}]*justify-content:\s*flex-end/s,
    );
  });

  it("registration is the ONLY start-aligned preset — a tall sign-up card must scroll (gh#256)", () => {
    // A vertically CENTRED tall card overflows ABOVE the scroll origin on a short viewport, which
    // makes its first field unreachable. This is the whole reason the preset exists separately
    // from `login`, so it is pinned rather than left to a future "tidy-up" to undo.
    const [desktop] = authBlock("registration");
    expect(desktop).toMatch(/--auth-shell-main-align:\s*flex-start/);

    for (const other of ["device-authorization", "context-selection", "account-recovery"]) {
      const [rule] = authBlock(other);
      expect(rule).not.toMatch(/--auth-shell-main-align/);
    }
  });

  it("registration keeps footer clearance on its own knob, not mirrored from the top inset", () => {
    // At the end of a long scroll the legal/consent footer must not sit flush against the submit
    // button, so the block-end inset is a knob of its own. It is deliberately NOT derived from the
    // block-start offset: that one is pinned to the canonical card anchor (see the anchor test),
    // which says nothing about how much room the footer needs below a long form.
    expect(shellTokens).toContain("--auth-shell-registration-main-padding-block-end: 3rem;");
    expect(shellTokens).toContain("--auth-shell-registration-main-padding-block-end-mobile: 2rem;");
  });

  it("routes the auth column's block alignment through a knob (rule #45)", () => {
    expect(shellTokens).toContain("--auth-shell-main-align: center;");
    expect(shellStyles).toMatch(
      /\.ui-auth-shell-main\s*\{[^}]*justify-content:\s*var\(--auth-shell-main-align\);/s,
    );
  });

  it("never hardcodes a preset measure in the stylesheet", () => {
    // Every preset length must live in the token tier — a literal here is the exact regression
    // (a forked `.canonical-auth-shell--wide`) that the presets exist to prevent.
    const presetRules = [
      ...authBlock("login"),
      ...authBlock("registration"),
      ...authBlock("device-authorization"),
      ...authBlock("context-selection"),
      ...authBlock("account-recovery"),
    ];
    expect(presetRules.length).toBeGreaterThan(0);
    for (const rule of presetRules) {
      expect(rule).not.toMatch(/:\s*[\d.]+(rem|px|em)\b/);
    }
  });
});

describe("AppSettingPicker compact trigger — token-owned geometry (gh#217)", () => {
  const navTokens = readFileSync(
    resolve(process.cwd(), "src/tokens/components/navigation.css"),
    "utf8",
  );
  const navStyles = readFileSync(
    resolve(process.cwd(), "src/styles/navigation-layout.css"),
    "utf8",
  );

  it("re-tiers the box from the official --control-height-sm tier, never a literal", () => {
    expect(navTokens).toContain(
      "--app-setting-picker-compact-control-height: var(--control-height-sm);",
    );
    expect(navStyles).toMatch(
      /\.ui-app-setting-picker-compact\s*\{[^}]*--control-height:\s*var\(--app-setting-picker-compact-control-height\);/s,
    );
    const rule = navStyles.match(/\.ui-app-setting-picker-compact\s*\{[^}]*\}/)?.[0] ?? "";
    expect(rule).not.toMatch(/height:\s*[\d.]/);
    expect(rule).not.toMatch(/calc\(var\(--control-height\)/);
  });

  it("keeps padding, gap and font-size themeable", () => {
    for (const token of [
      "--app-setting-picker-compact-padding-x",
      "--app-setting-picker-compact-gap",
      "--app-setting-picker-compact-font-size",
    ]) {
      expect(navTokens).toContain(`${token}:`);
    }
  });
});

/**
 * `align` — the block-axis choice, orthogonal to `preset`.
 *
 * It exists because a preset could previously be re-aimed only by re-declaring its own offset
 * tokens from a consumer stylesheet (Platform #838 centred SCR-001 that way for months), which is
 * the page-local-vertical-offset anti-pattern the presets replaced. These cases pin the two halves
 * that make the axis real: the alignment itself, and the block-start collapse WITHOUT which
 * `justify-content: center` fights a 231px block-start inset and the card still is not centred.
 */
describe("AuthShell align — block-axis placement", () => {
  const alignBlock = (value: string, preset?: string) =>
    shellStyles.match(
      new RegExp(
        preset === undefined
          ? `\\.ui-auth-shell\\[data-align="${value}"\\]\\s*\\{[^}]*\\}`
          : `\\.ui-auth-shell\\[data-preset="${preset}"\\]\\[data-align="${value}"\\]\\s*\\{[^}]*\\}`,
        "g",
      ),
    ) ?? [];

  it("declares both directions, so neither is reachable only by omission", () => {
    expect(alignBlock("center")[0]).toMatch(/--auth-shell-main-align:\s*center/);
    expect(alignBlock("anchored")[0]).toMatch(/--auth-shell-main-align:\s*flex-start/);
  });

  it("is declared AFTER the presets, which decide the same property at equal specificity", () => {
    // `.ui-auth-shell[data-preset="login"]` and `.ui-auth-shell[data-align="center"]` are both
    // (0,2,0). Source order is the whole contract; earlier and the preset would win silently.
    const preset = shellStyles.indexOf('.ui-auth-shell[data-preset="login"] {');
    const align = shellStyles.indexOf('.ui-auth-shell[data-align="center"] {');
    expect(preset).toBeGreaterThan(-1);
    expect(align).toBeGreaterThan(preset);
  });

  it("collapses login's block-start inset to its block-end one, desktop AND mobile", () => {
    // Without the mobile line the phone viewport keeps the 13.8125rem anchor and only the desktop
    // looks centred — the asymmetry a token-level override is easy to half-fix.
    const rule = alignBlock("center", "login")[0] ?? "";
    expect(rule).toMatch(
      /--auth-shell-login-flow-offset-block:\s*var\(--auth-shell-login-main-padding-block-end\)/,
    );
    expect(rule).toMatch(
      /--auth-shell-login-flow-offset-block-mobile:\s*var\(--auth-shell-login-main-padding-block-end\)/,
    );
  });

  it("retargets the offset TOKENS, never the --auth-shell-main-padding shorthand", () => {
    // The `max-width: 30rem` block recomposes that shorthand from the `*-mobile` tokens, so
    // re-declaring it here would freeze the inline gutters the preset owns.
    for (const rule of [
      alignBlock("center", "login")[0],
      alignBlock("center", "registration")[0],
    ]) {
      expect(rule).toBeDefined();
      expect(rule).not.toMatch(/--auth-shell-main-padding:/);
    }
  });

  it("gives registration the same collapse, mobile token included", () => {
    const rule = alignBlock("center", "registration")[0] ?? "";
    expect(rule).toMatch(
      /--auth-shell-registration-main-padding-block-start:\s*var\(\s*--auth-shell-registration-main-padding-block-end\s*\)/s,
    );
    expect(rule).toMatch(
      /--auth-shell-registration-main-padding-block-start-mobile:\s*var\(\s*--auth-shell-registration-main-padding-block-end-mobile\s*\)/s,
    );
  });

  it("leaves every preset default untouched when align is not passed", () => {
    // The prop is opt-in: `data-align` is omitted unless stated, so these stay the defaults.
    expect(authBlock("login")[0]).toMatch(/--auth-shell-main-align:\s*flex-start/);
    expect(authBlock("registration")[0]).toMatch(/--auth-shell-main-align:\s*flex-start/);
  });
});

/**
 * Guards for three drifts found by running visual-audit against a real consumer page, each of
 * which had gone unnoticed because nothing asserted the thing it claimed to cover.
 */
describe("audit + a11y drift guards", () => {
  const dataDisplay = readFileSync(
    resolve(process.cwd(), "src/styles/data-display-layout.css"),
    "utf8",
  );
  const foundation = readFileSync(resolve(process.cwd(), "src/tokens/foundation.css"), "utf8");
  const auditScript = readFileSync(resolve(process.cwd(), "scripts/visual-audit.mjs"), "utf8");

  it("probes every layer with a class the stylesheets actually declare", () => {
    // The card-layout probe used `.ui-card` — a class Card never renders and no rule targets — so
    // it could not pass on any page and reported a permanent false error. A probe aimed at a class
    // nothing styles is indistinguishable from a genuinely missing layer, which is the expensive
    // half: it trains readers to ignore the finding.
    const probes = [...auditScript.matchAll(/probe\("([^"]+)",\s*"([^"]+)"/g)].map(
      ([, layer, className]) => ({ layer, className }),
    );
    expect(probes.length).toBeGreaterThan(0);
    const allCss = allLayerCss;
    for (const { layer, className } of probes) {
      // A SELECTOR, not a substring: `.ui-card` is contained in `.ui-card-inset-x`, so a
      // `includes()` check would have called the very bug this guard exists for "declared".
      const declared = new RegExp(`\\.${className}(?![\\w-])`).test(allCss);
      expect(`${layer}:${className}`, `probe class .${className} is declared somewhere`).toBe(
        declared ? `${layer}:${className}` : `${layer}:<undeclared>`,
      );
    }
  });

  it("sizes a bare glyph in the ListRow leading slot from the control tier", () => {
    // Without this the slot had no icon metric, so every caller — including this package's own
    // docs/data-display/list-row.tsx — reached for className="size-4". A library that documents
    // the utility it forbids is teaching the anti-pattern.
    expect(dataDisplay).toMatch(
      /\[data-slot="list-row-leading"\] > svg:not\(\[class\*="size-"\]\)\s*\{[^}]*width:\s*var\(--list-row-leading-icon-size,\s*var\(--control-icon-size\)\)/s,
    );
    // `> svg` only, and an explicit caller size still wins: an Avatar or Badge in the slot brings
    // its own box and must not be squeezed into an icon measure.
    expect(dataDisplay).toContain('[data-slot="list-row-leading"] > svg:not([class*="size-"])');
  });

  it("floors the auth footer's interactive targets at the WCAG 2.2 AA size", () => {
    expect(foundation).toMatch(/--touch-target-min:\s*1\.5rem/);
    expect(shellTokens).toMatch(/--auth-footer-target-min-size:\s*var\(--touch-target-min\)/);
    const rule = shellStyles.match(/\.ui-auth-legal-footer :is\(a, button\)\s*\{[^}]*\}/)?.[0];
    expect(rule).toBeDefined();
    // inline-flex is load-bearing: min-block-size does nothing to an inline anchor, so dropping
    // the display line would leave a rule that reads correct and measures 19px.
    expect(rule).toMatch(/display:\s*inline-flex/);
    expect(rule).toMatch(/min-block-size:\s*var\(--auth-footer-target-min-size\)/);
  });

  it("does not let the footer's inline picker rule undo that floor", () => {
    // `[data-slot="auth-legal-footer"] .ui-app-setting-picker-inline` is (0,2,0) and the footer's
    // own floor is (0,1,1), so a `min-height: 0` here silently won and the locale trigger stayed
    // 19px on every auth page. Measured: 33x19 before, against a 24px AA floor.
    const nav = readFileSync(resolve(process.cwd(), "src/styles/navigation-layout.css"), "utf8");
    const rule = nav.match(
      /\[data-slot="auth-legal-footer"\] \.ui-app-setting-picker-inline\s*\{[^}]*\}/,
    )?.[0];
    expect(rule).toBeDefined();
    expect(rule).toMatch(/min-block-size:\s*var\(--auth-footer-target-min-size\)/);
    expect(rule, "the zeroed floor must not come back").not.toMatch(/min-height:\s*0/);
  });
});

describe("Truncating boxes contain their own ink", () => {
  it("never pairs a clipped overflow with a tight line box", () => {
    /*
     * `overflow: hidden` is what makes `text-overflow: ellipsis` work, and it clips whatever the
     * line box does not cover — so in a truncating rule the line-height is the CLIPPING BOUNDARY,
     * not a rhythm choice. 1.25 was picked against Latin, where a `g` descender still lands inside
     * the box. Vietnamese does not: measured on the org switcher's meta line at 11.11px in a
     * 13.88px box, the dot-below of `ị` in 「Quản trị viên」 was cut at the baseline edge. Japanese
     * and every other diacritic-stacking script sit in the same trap, so this is a family, not one
     * selector — three rules carried the pair when it was first swept.
     */
    const offenders: string[] = [];
    for (const file of readdirSync(resolve(process.cwd(), "src/styles")).filter((f) =>
      f.endsWith(".css"),
    )) {
      const css = readFileSync(resolve(process.cwd(), "src/styles", file), "utf8");
      for (const [, selector, body] of css.matchAll(/([.[][^{}]{0,90}?)\s*\{([^}]*)\}/g)) {
        const clips = body.includes("text-overflow: ellipsis") || body.includes("overflow: hidden");
        // ANY line box under 1.4, not just the named tight step. The first version of this guard
        // matched `--line-height-tight` and literals up to 1.1, and four rules carrying 1.2 / 1.3
        // walked straight through it — the exact values that were clipping.
        const lh = /line-height:\s*([^;]+);/.exec(body)?.[1]?.trim();
        const literal = lh && /^[\d.]+$/.test(lh) ? Number.parseFloat(lh) : null;
        const tight = Boolean(
          lh && (lh.includes("--line-height-tight") || (literal !== null && literal < 1.4)),
        );
        if (clips && tight) offenders.push(`${file}: ${selector.trim().replace(/\s+/g, " ")}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
