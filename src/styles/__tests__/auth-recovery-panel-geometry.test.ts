import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * AuthShell `preset="account-recovery"` — the SCR-008 password-recovery / sign-in-MFA panel
 * measure (gh#233).
 *
 * The consumer blocker was that the 432px canonical panel could only be hit with a page-local
 * `--auth-shell-card-max-width` override. These tests pin the PUBLIC token contract so the
 * geometry can never drift back into consumer CSS, and they codify the numbers that were MEASURED
 * in headless Chromium (jsdom does no layout, so the arithmetic lives here as declared tokens):
 *
 *   1440 / 1024  panel x=504 / x=296, w=432, 16px page gutter, 382px content column
 *   390          panel x=15, w=360, 15px inline page gutter, 310px content column
 *   OTP row      6 x 36px = 216px at every viewport, one row, no overflow (scrollWidth == clientWidth)
 */
const shellStyles = readFileSync(resolve(process.cwd(), "src/styles/shell-layout.css"), "utf8");
const shellTokens = readFileSync(resolve(process.cwd(), "src/tokens/components/shell.css"), "utf8");
const controlStyles = readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8");
const controlTokens = readFileSync(
  resolve(process.cwd(), "src/tokens/components/control.css"),
  "utf8",
);

const presetRule = (preset: string) =>
  shellStyles.match(
    new RegExp(`\\.ui-auth-shell\\[data-preset="${preset}"\\]\\s*\\{[^}]*\\}`, "g"),
  ) ?? [];

describe("AuthShell preset=account-recovery — token-owned SCR-008 panel measure (gh#233)", () => {
  it("declares the 432px measure and both page gutters as component tokens", () => {
    // 27rem = 432px (the measured panel width at 1440 and 1024).
    expect(shellTokens).toContain("--auth-shell-recovery-card-max-width: 27rem;");
    expect(shellTokens).toContain("--auth-shell-recovery-main-padding: 1rem;");
    // 0.9375rem = 15px inline ⇒ at a 390 viewport the panel renders x=15, width=360.
    expect(shellTokens).toContain("--auth-shell-recovery-main-padding-mobile: 0.9375rem;");
  });

  it("wires the preset rule to those tokens and never hardcodes a length", () => {
    const [rule] = presetRule("account-recovery");
    expect(rule).toBeTruthy();
    expect(rule).toMatch(
      /--auth-shell-card-max-width:\s*var\(--auth-shell-recovery-card-max-width\)/,
    );
    expect(rule).toMatch(/--auth-shell-main-padding:\s*var\(--auth-shell-recovery-main-padding\)/);
    // A literal here is the exact regression the issue was filed against (a forked
    // `.recovery-panel { width: 432px }` in the consumer).
    expect(rule).not.toMatch(/:\s*[\d.]+(rem|px|em)\b/);
  });

  it("is declared AFTER variant=canonical so the two compose", () => {
    const canonical = shellStyles.indexOf('.ui-auth-shell[data-variant="canonical"] {');
    const recovery = shellStyles.indexOf('.ui-auth-shell[data-preset="account-recovery"] {');
    expect(canonical).toBeGreaterThan(-1);
    // Equal specificity (0,2,0) — source order decides, so `variant="canonical"` keeps owning
    // control density / heading size while the preset only re-measures the page.
    expect(recovery).toBeGreaterThan(canonical);
  });

  it("puts the 15px mobile gutter in the shared 30rem block, after the canonical one", () => {
    const mobile = shellStyles.match(/@media \(max-width: 30rem\)\s*\{[\s\S]*?\n {2}\}/)?.[0] ?? "";
    const canonical = mobile.indexOf('[data-variant="canonical"]');
    const recovery = mobile.indexOf('[data-preset="account-recovery"]');
    expect(canonical).toBeGreaterThan(-1);
    expect(recovery).toBeGreaterThan(canonical);
    expect(mobile).toMatch(
      /--auth-shell-main-padding:\s*var\(--auth-shell-recovery-main-padding-mobile\)/,
    );
  });

  it("leaves every pre-existing auth measure untouched (backward compatible)", () => {
    // gh#233 must not move the canonical 360px Login flow, the 24rem un-preset shell, or the two
    // presets that landed before it.
    expect(shellTokens).toContain("--auth-shell-canonical-card-max-width: 22.5rem;");
    expect(shellTokens).toContain("--auth-shell-canonical-main-padding: 1rem;");
    expect(shellTokens).toContain("--auth-shell-canonical-main-padding-mobile: 0.9375rem;");
    expect(shellTokens).toContain("--auth-shell-card-max-width: 24rem;");
    expect(shellTokens).toContain("--auth-shell-device-card-max-width: 23.75rem;");
    expect(shellTokens).toContain("--auth-shell-context-card-max-width: 25rem;");
  });

  it("shares ONE measure between the recovery panel and the MFA challenge panel", () => {
    // Both canonical SCR-008 desktop panels measure w=432, so a single preset owns them; two
    // near-identical presets would be duplication with no theming benefit.
    const recoveryTokens = shellTokens.match(/--auth-shell-recovery-[a-z-]+:/g) ?? [];
    expect(recoveryTokens).toHaveLength(3);
    // Exactly two rules exist: the desktop measure + the <=30rem mobile gutter override.
    expect(presetRule("account-recovery")).toHaveLength(2);
  });
});

describe("InputOTP slot box — --otp-slot-size (gh#233)", () => {
  it("is declared `initial` so the --control-height default resolves at the CALL SITE", () => {
    // The tier-mirror form of docs/TOKENS.md' role-mirror rule. `--otp-slot-size:
    // var(--control-height)` at :root FREEZES at the :root tier (32px) — measured in Chromium, the
    // canonical auth shell's 36px OTP slots silently shrank to 32px. `initial` + a call-site
    // fallback keeps the shell's re-scoped 36px tier reaching the slot.
    // (The token file must therefore never bind the knob to the tier at :root.)
    expect(controlTokens).toMatch(/--otp-slot-size:\s*initial;/);
    const declarations = controlTokens.match(/^\s*--otp-slot-size:.*$/gm) ?? [];
    expect(declarations).toHaveLength(1);
    expect(declarations[0]).not.toMatch(/--otp-slot-size:\s*var\(/);
  });

  it("reads the knob with the tier as the call-site fallback, never an ad-hoc size", () => {
    const rule = controlStyles.match(/\.ui-otp-slot\s*\{[^}]*\}/)?.[0] ?? "";
    expect(rule).toMatch(/width:\s*var\(--otp-slot-size,\s*var\(--control-height\)\)/);
    expect(rule).toMatch(/height:\s*var\(--otp-slot-size,\s*var\(--control-height\)\)/);
    // No literal box and no calc offset — the box is always a named tier (rule #3 / check:control-sizing).
    expect(rule).not.toMatch(/(?:width|height):\s*[\d.]+(?:rem|px|em)/);
    expect(rule).not.toMatch(/calc\(var\(--control-height\)/);
  });
});
