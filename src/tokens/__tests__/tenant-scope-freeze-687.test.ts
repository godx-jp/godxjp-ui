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
const ROLES = [
  "primary",
  "primary-foreground",
  "ring",
  "accent",
  "accent-foreground",
  "focus-ring-color",
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

const binding = new RegExp(`^\\s*(--[a-z0-9-]+):[^;]*var\\(--(?:${ROLES.join("|")})\\)`, "gm");
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
    const readers = focusRing.match(/var\(--focus-outline-color[,)]/g) ?? [];
    expect(readers.length).toBeGreaterThan(0);
    expect(readers.every((read) => read.endsWith(","))).toBe(true);
    expect(focusRing).toContain("var(--focus-outline-color, var(--focus-ring-color, var(--ring)))");
  });
});
