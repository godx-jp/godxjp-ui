import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/*
 * gh#687 — a token tier binding to a role a tenant re-scopes freezes at :root.
 *
 * `--focus-outline-color: var(--focus-ring-color, var(--ring))` on :root computed ONCE, against the
 * root's --ring, and every element inherited that computed value. A nested scope such as
 * `body[data-tenant] { --primary: …; --ring: … }` therefore kept the root-coloured keyboard focus
 * outline while its hover and press followed (docs/TOKENS.md, the freeze rule). The same shape
 * froze the selected radio-button bar, the active slider dot, BackTop's progress ring, the accent
 * hovers of Topbar / AppLauncher / Segmented / filled controls, and the brand glow.
 *
 * The rule this holds: no token tier file binds a custom property to a tenant-scoped role. The
 * knob is `initial` and the role is the fallback at the call site. `--ring: var(--primary)` is the
 * one declared exception — a public role read bare by consumers, so it cannot become an empty
 * knob; nested scopes set it alongside --primary (CHANGELOG 26.0.0).
 */
const TOKENS = join(process.cwd(), "src/tokens");
/* WHY THE TEXT TIER IS IN THIS LIST. It was not, and that is exactly how `--mark-primary:
 * var(--text-primary)` sat on `:root` unnoticed: the binding is the same defect gh#687 names, in a
 * family the list did not name. Measured before the fix — a `[data-tenant]` setting
 * `--text-primary: 140 80% 25%` kept `--mark-primary` at `268 100% 34.5%` and painted a violet rail
 * on a green brand. A role belongs here the moment a consumer is told they may re-theme it, and
 * CUSTOMER-THEMING tells them they may re-theme all of these. */
const ROLES = [
  "primary",
  "primary-foreground",
  "ring",
  "accent",
  "accent-foreground",
  "focus-ring-color",
  "text-primary",
  "text-link",
  "text-brand",
  "text-success",
  "text-warning",
  "text-info",
  "text-error",
];
const ALLOWED = new Set(["derived.css --ring"]);

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "__tests__") return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return cssFiles(path);
    return entry.name.endsWith(".css") ? [path] : [];
  });
}

const binding = new RegExp(`^\\s*(--[a-z0-9-]+):[^;]*var\\(\\s*--(?:${ROLES.join("|")})\\)`, "gm");
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

describe("no token tier freezes a tenant-scoped role at :root (gh#687)", () => {
  it("every role-mirror knob is `initial`, with its default at the call site", () => {
    const frozen: string[] = [];
    for (const file of cssFiles(TOKENS)) {
      const css = stripComments(readFileSync(file, "utf8"));
      for (const [, name] of css.matchAll(binding)) {
        const key = `${file.slice(TOKENS.length).replace(/^\//, "")} ${name}`;
        if (!ALLOWED.has(key)) frozen.push(key);
      }
    }
    expect(frozen).toEqual([]);
  });

  it("the focus outline reads its default at the focused element", () => {
    const focusRing = readFileSync(join(process.cwd(), "src/styles/focus-ring.css"), "utf8");
    const readers = focusRing.match(/var\(\s*--focus-outline-color[,)]/g) ?? [];
    expect(readers.length).toBeGreaterThan(0);
    expect(readers.every((read) => read.endsWith(","))).toBe(true);
    expect(focusRing).toContain("var(--focus-outline-color, var(--focus-ring-color, var(--ring)))");
  });
});

/**
 * THE BRAND TEXT FAMILY IS A KNOB, NOT A LITERAL (gh#664).
 *
 * `--text-link` / `--text-brand` were authored values on `:root`, and hue 204° — the pre-v2.3 blue
 * — is what they still held a release after the seed moved to violet. Declaring them `initial`
 * with the formula at the call site is what makes them follow a `--primary` in ANY scope, including
 * a `[data-tenant]` below `<html>`, which a `:root` binding cannot do (docs/TOKENS.md, the freeze
 * rule). So the shape is the contract, and these assert the shape rather than a value.
 */
describe("the brand text roles derive from the --primary in scope (gh#664)", () => {
  const derived = readFileSync(join(process.cwd(), "src/tokens/derived.css"), "utf8");
  const BRAND_TEXT = ["text-link", "text-brand"] as const;

  it.each(BRAND_TEXT)("declares --%s as an `initial` knob, never a value", (name) => {
    expect(derived).toMatch(new RegExp(`^\\s*--${name}:\\s*initial;`, "m"));
  });

  it.each(BRAND_TEXT)("declares --%s-channels in BOTH themes", (name) => {
    const light = derived.slice(derived.indexOf(":root {"), derived.indexOf("\n.dark,"));
    const dark = derived.slice(derived.indexOf("\n.dark,"));
    expect(light).toMatch(new RegExp(`--${name}-channels:`));
    expect(dark).toMatch(new RegExp(`--${name}-channels:`));
  });

  it.each(BRAND_TEXT)("has no --%s literal left in foundation.css", (name) => {
    const foundation = stripComments(
      readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8"),
    );
    expect(foundation).not.toMatch(new RegExp(`^\\s*--${name}:`, "m"));
  });

  /* Every reader must carry the fallback. A bare `hsl(var(--text-link))` paints NOTHING once the
   * knob is `initial` — the failure is silent and total, and it is why this asserts on the call
   * sites rather than trusting that they were all updated. */
  it.each(BRAND_TEXT)("every rule that reads --%s carries the derived fallback", (name) => {
    const styles = join(process.cwd(), "src/styles");
    const bare: string[] = [];
    for (const file of cssFiles(styles)) {
      const css = stripComments(readFileSync(file, "utf8"));
      if (new RegExp(`var\\(\\s*--${name}\\)`).test(css)) bare.push(file.slice(styles.length));
    }
    expect(bare, `a bare var(--${name}) resolves to nothing and paints no colour`).toEqual([]);
  });
});
