import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");

describe("DXS hi-fi visual contract", () => {
  it("keeps application chrome on the 48px flat-surface shell", () => {
    const tokens = read("../../tokens/components/shell.css");
    const shell = read("../shell-layout.css");

    // The 48px band reads its step — `--band-height-2xl` IS 3rem.
    expect(tokens).toMatch(/--app-shell-bar-height:\s*var\(--band-height-2xl\)/);
    expect(read("../../tokens/foundation.css")).toMatch(/--band-height-2xl:\s*3rem;/);
    expect(shell).toMatch(
      /grid-template-rows:\s*var\(--app-shell-bar-height\) minmax\(0, 1fr\) auto/,
    );
    /*
     * THE SHELL SIZES ITSELF TO THE VIEWPORT IT OWNS, which is not always the whole one.
     *
     * A bare `100vh` says "the window is mine", and chrome outside the application then has nowhere
     * to be: a platform bar docked to an edge reserves its band by padding the root element, the
     * shell keeps claiming the full viewport regardless, and the document ends up taller than the
     * window. Measured with the bar on the bottom edge, before the knob existed: 40px of document
     * scroll, `.app-root` still 900px in a 900px window, and the topbar at y = -40 — off the screen
     * — once the page was scrolled to the end. With it: no scroll, root 860, topbar at 0.
     *
     * The default is `0px`, so a page that owns its window is byte-for-byte unchanged.
     */
    expect(shell).toMatch(/height:\s*calc\(100vh - var\(--app-shell-viewport-inset, 0px\)\)/);
    expect(tokens).toMatch(/--app-shell-viewport-inset:\s*0px;/);
    expect(shell).toMatch(/\.app-topbar\s*\{[^}]*background:\s*hsl\(var\(--card\)\)/s);
    // FLAT means the BAR is flat. This used to scan the whole stylesheet for `backdrop-filter`,
    // which held only while nothing else in the file had one; the launcher's launchpad scrim now
    // does, and it is not chrome — it is the surface the chrome opens on top of. Scoped to the
    // rule the claim was always about, so the guarantee survives and the proxy does not.
    const topbarRule = shell.slice(
      shell.indexOf(".app-topbar {"),
      shell.indexOf("}", shell.indexOf(".app-topbar {")) + 1,
    );
    expect(topbarRule).not.toBe("");
    expect(topbarRule).not.toMatch(/backdrop-filter/);
  });

  it("keeps the warm main surface and 1280px left-aligned page boundary", () => {
    const tokens = read("../../tokens/components/shell.css");
    const shell = read("../shell-layout.css");

    expect(tokens).toMatch(/--app-shell-page-max-width:\s*80rem/);
    // Product override (direct instruction): the search trigger now fills its Topbar center slot
    // by default instead of floating as a fixed ~420px box with dead space on either side.
    expect(tokens).toMatch(/--topbar-search-max-width:\s*none/);
    // gh#399 — the ground is a per-theme ROLE now, not a `--muted` derivation baked at :root: the
    // knob is `initial` and the call site falls back to --surface-recessed, whose LIGHT value is
    // the identical composite this used to assert.
    expect(tokens).toMatch(/--app-shell-main-background:\s*initial/);
    expect(read("../../tokens/semantic/layout.css")).toMatch(
      /--surface-recessed:\s*hsl\(var\(--muted\) \/ 0\.4\)/,
    );
    expect(shell).toMatch(
      /background-color: var\(--app-shell-main-background, var\(--surface-recessed\)\)/,
    );
    expect(shell).toMatch(
      /\.app-main \.ui-page-container\s*\{[^}]*max-width:\s*var\(--app-shell-page-max-width\)/s,
    );
    expect(shell).not.toMatch(/\.app-main \.ui-page-container\s*\{[^}]*max-width:\s*none/s);
  });

  it("uses the compact DXS sidebar rhythm and 900px drawer breakpoint", () => {
    const tokens = read("../../tokens/components/shell.css");
    const shell = read("../shell-layout.css");

    expect(tokens).toMatch(/--sidebar-nav-item-height:\s*var\(--band-height-md\)/);
    expect(read("../../tokens/foundation.css")).toMatch(/--band-height-md:\s*2rem;/);
    // The rail's label step is a STEP, not the hi-fi source's 13px. 13 sits between
    // --font-size-xs (≈12.47) and the 14px base, so the whole rail read off the system's type
    // rhythm and stayed behind whenever a service retuned --font-size-base. The row's own rhythm —
    // the 2rem height this test is really about — is unchanged, and 1.5 × 12.47 = 18.7px keeps the
    // same headroom inside it.
    expect(tokens).toMatch(/--sidebar-nav-item-font-size:\s*var\(--font-size-xs\)/);
    expect(tokens).not.toMatch(/--sidebar-nav-item-font-size:\s*[\d.]/);
    expect(shell).toMatch(/@media \(width <= 56\.25rem\)/);
    expect(shell).toMatch(/\.sb-section \+ \.sb-section\s*\{[^}]*margin-top:/s);
  });

  it("uses the DXS 10px card radius and shadow-sm surface", () => {
    const card = read("../../tokens/components/card.css");

    expect(card).toMatch(/--card-radius:\s*var\(--radius-xl\)/);
    expect(card).toMatch(/--card-shadow:\s*var\(--shadow-sm\)/);
  });

  it("bundles Noto Sans JP as the default product face (product override, direct instruction)", () => {
    const fonts = read("../fonts.css");

    expect(fonts).toContain('@import "@fontsource/noto-sans-jp/400.css"');
    expect(fonts).toMatch(/--font-sans-base:\s*\n\s*"Noto Sans JP"/);
    expect(fonts).not.toContain("@fontsource/montserrat");
  });
});
