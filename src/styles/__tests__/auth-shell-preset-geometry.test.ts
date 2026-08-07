import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * AuthShell named flow presets (gh#217 · gh#220).
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

const authBlock = (selector: string) =>
  shellStyles.match(
    new RegExp(`\\.ui-auth-shell\\[data-preset="${selector}"\\]\\s*\\{[^}]*\\}`, "g"),
  ) ?? [];

describe("AuthShell flow presets — token-owned geometry", () => {
  it("keeps the canonical defaults untouched (backward compatible)", () => {
    // gh#220: adding the wide device measure must not move the existing canonical 360px/15px flow.
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

  it("registration anchors its card on the canonical SCR-002 y, derived not chosen (gh#256)", () => {
    // These two offsets were INVENTED in the first pass (3rem / 1.5rem) and measured wrong by
    // 133/147px. They are now derived from the canonical artboard quoted in the SCR-002 acceptance
    // review — card y=284 at 1440x900, y=274 at 390x844 — through the column's own arithmetic:
    //   card y = padding-block-start + identity slot + stack gap
    //   284 - 112 - 20 = 152px = 9.5rem      274 - 112 - 20 = 142px = 8.875rem
    // Verified in headless Chromium at both viewports: measured card y == canonical y, delta 0.00px.
    expect(shellTokens).toContain("--auth-shell-registration-main-padding-block-start: 9.5rem;");
    expect(shellTokens).toContain(
      "--auth-shell-registration-main-padding-block-start-mobile: 8.875rem;",
    );
    expect(shellTokens).toContain("--auth-shell-registration-identity-slot-block-size: 7rem;");
    expect(shellTokens).toContain("--auth-shell-registration-card-stack-gap: 1.25rem;");

    // The arithmetic itself, so a future edit to any ONE of the three cannot silently move the
    // anchor while every individual assertion above still passes.
    const px = (token: string) => {
      const rem = shellTokens.match(new RegExp(`${token}:\\s*([\\d.]+)rem;`))?.[1];
      return rem ? parseFloat(rem) * 16 : NaN;
    };
    expect(
      px("--auth-shell-registration-main-padding-block-start") +
        px("--auth-shell-registration-identity-slot-block-size") +
        px("--auth-shell-registration-card-stack-gap"),
    ).toBe(284);
    expect(
      px("--auth-shell-registration-main-padding-block-start-mobile") +
        px("--auth-shell-registration-identity-slot-block-size") +
        px("--auth-shell-registration-card-stack-gap"),
    ).toBe(274);
  });

  it("registration pins the identity track so copy length cannot move the anchor (gh#256)", () => {
    // Without the fixed track the card rides on the identity block's own height (measured 82.69px
    // for one wrapped requester), so the canonical y would hold for exactly one copy length. With
    // it, headless Chromium measured card y=274 identically for absent, short and wrapped
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
    // (a forked `.canonical-auth-shell--wide`) that gh#220 was filed against.
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
