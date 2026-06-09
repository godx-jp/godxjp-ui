import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// These guard the actual CSS fixes for the "phantom scroll-height / shell containment" family
// (gh#103 body-stretch void, gh#104 shell leak, gh#105 hidden form-fallback). jsdom does no layout,
// so a real scrollHeight measurement isn't possible here — we assert the fix rules are present so
// they can't be silently removed. Real scroll behaviour is verified in a browser at ship time.
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

describe("scroll-containment CSS contract", () => {
  it("AppShell .app-main establishes a paint-containment boundary (gh#104)", () => {
    const css = read("../shell-layout.css");
    const appMain = css.match(/\.app-main\s*\{[^}]*\}/)?.[0] ?? "";
    expect(appMain).toMatch(/contain:\s*paint/);
  });

  it("hidden form-fallback + sr-only nodes are clamped to top-left (gh#105)", () => {
    const css = read("../index.css");
    // the clamp targets Radix BubbleSelect/BubbleInput (aria-hidden + tabindex=-1) and .sr-only
    expect(css).toMatch(/\[aria-hidden="true"\]\[tabindex="-1"\]/);
    const clamp = css.slice(css.indexOf('[aria-hidden="true"][tabindex="-1"]'));
    const rule = clamp.slice(0, clamp.indexOf("}") + 1);
    expect(rule).toMatch(/\.sr-only/);
    expect(rule).toMatch(/top:\s*0/);
    expect(rule).toMatch(/left:\s*0/);
  });
});
