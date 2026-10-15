import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { compile } from "tailwindcss";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * gh#1220 (v32 row 6) in Chromium, against the real stylesheet.
 *
 * The package defaults went neutral; `themes/godx.css` + `godxPreset` must give back EXACTLY what
 * 31.x painted. The 31.x column below was measured with this same page against 31.31.8's own
 * stylesheet (`git archive 385c7915 src/styles src/tokens`, its `styles/index.css` — which still
 * loaded the bundled fonts — compiled the same way), and is pinned here so the comparison does not
 * depend on a git ref being present on the runner.
 *
 * gh#1345 (33.5.0) re-seeded the preset on purpose: violet #7A00FF / #DCBCFF became emerald-teal
 * #008066 / #5CD6BE. The COLOUR rows below are the new seed (31.31.8 painted rgb(122, 0, 255) /
 * rgb(220, 188, 255), link #6500d4 / #dcbcff); fonts, labels, ring wiring and the mark are still
 * 31.x's, unchanged.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { AppPresetContext } from "./src/app/preset";
import { godxPreset } from "./src/themes/godx";
import { AuthIdentity } from "./src/components/layout/auth-identity";
import { Button } from "./src/components/general/button";
import { Link } from "./src/components/general/typography";
const params = new URLSearchParams(location.search);
const theme = params.get("theme") === "dark" ? "dark" : "light";
const preset = params.get("preset") === "godx" ? godxPreset : undefined;
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" theme={theme} persist={false}>
    <AppPresetContext.Provider value={preset}>
      <AuthIdentity title="Sign in" />
      <Button>Continue</Button>
      <Link href="#">Forgot password</Link>
    </AppPresetContext.Provider>
  </AppProvider>,
);
`;

/** The package stylesheet (`styles/core`), optionally followed by more sheets, compiled for `candidates`. */
async function compileCss(candidates: string[], after: string[] = []): Promise<string> {
  const loadStylesheet = async (id: string, base: string) => {
    let path: string;
    if (id.startsWith(".") || id.startsWith("/")) path = resolve(base, id);
    else {
      const pkg = join(ROOT, "node_modules", id);
      if (existsSync(pkg) && statSync(pkg).isFile()) path = pkg;
      else if (existsSync(join(pkg, "package.json"))) {
        const manifest = JSON.parse(readFileSync(join(pkg, "package.json"), "utf8"));
        path = join(pkg, manifest.exports?.["."]?.style ?? manifest.style ?? "index.css");
      } else return { path: pkg, base, content: "" };
    }
    return { path, base: dirname(path), content: readFileSync(path, "utf8") };
  };
  const base = join(ROOT, "src/styles");
  const entry = [`@import "./core.css";`, ...after.map((p) => `@import "${p}";`)].join("\n");
  const compiler = await compile(entry, { base, loadStylesheet });
  return compiler.build(candidates);
}

const TOKENS = ["--primary", "--primary-foreground", "--brand", "--brand-foreground", "--ring"];

interface Measured {
  tokens: Record<string, string>;
  button: { background: string; color: string };
  link: string;
  font: string;
  mark: string | null;
  /** The mark box's own fill. `tone: "primary"` (gh#1345) must not paint a --primary square
   * behind the artwork: the `[data-mark="godx"]` rule keeps it transparent. */
  markBackground: string | null;
}

/** The body font stack 31.x painted, with its bundled faces loaded by `styles/index.css`. */
const GODX_FONT =
  '"Noto Sans JP", "Noto Sans JP Fallback", "Hiragino Sans", "Hiragino Kaku Gothic ProN", ' +
  '"Yu Gothic Medium", YuGothic, "M PLUS 2", Meiryo, -apple-system, "system-ui", "Segoe UI", ' +
  "Roboto, system-ui, sans-serif";

/** 31.31.8, measured as described above — with the gh#1345 colour (see the header). */
const GODX: Record<"light" | "dark", Measured> = {
  light: {
    tokens: {
      "--primary": "168 100% 25%",
      "--primary-foreground": "60 33% 99%",
      "--brand": "168 100% 25%",
      "--brand-foreground": "60 33% 99%",
      "--ring": "168 100% 25%",
    },
    button: { background: "rgb(0, 128, 102)", color: "rgb(253, 253, 252)" },
    // The link ink derives one ramp step down at the call site (relative colour) — 168 100% 16.6%.
    link: "color(srgb 0 0.332 0.2656)",
    font: GODX_FONT,
    mark: "godx",
    markBackground: "rgba(0, 0, 0, 0)",
  },
  dark: {
    tokens: {
      "--primary": "168 60% 60%",
      "--primary-foreground": "48 9% 9%",
      "--brand": "168 60% 60%",
      "--brand-foreground": "48 9% 9%",
      "--ring": "168 60% 60%",
    },
    button: { background: "rgb(92, 214, 190)", color: "rgb(25, 24, 21)" },
    link: "color(srgb 0.36 0.84 0.744)",
    font: GODX_FONT,
    mark: "godx",
    markBackground: "rgba(0, 0, 0, 0)",
  },
};

let js = "";
let neutralCss = "";
let godxCss = "";
let godxTokensCss = "";
let browser: Browser;

beforeAll(async () => {
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  try {
    const { build } = await import("esbuild");
    const out = await build({
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: ROOT, sourcefile: "entry.tsx" },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      absWorkingDir: ROOT,
    });
    js = out.outputFiles![0]!.text;
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  const candidates = [...new Set(js.match(/[\w:./[\]()%#!=-]+/g) ?? [])];
  neutralCss = await compileCss(candidates);
  godxCss = await compileCss(candidates, ["../themes/godx.css"]);
  godxTokensCss = await compileCss(candidates, ["../themes/godx-tokens.css"]);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function measure(css: string, query: string): Promise<Measured> {
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  await page.goto(`about:blank?${query}`);
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator('[data-slot="auth-identity"]').waitFor();
  const result = await page.evaluate(async (tokens) => {
    // AppProvider writes the theme after the first paint, and a control transitions its colours:
    // read the settled values, not a frame of the cross-fade.
    await Promise.all(document.getAnimations().map((a) => a.finished));
    const root = getComputedStyle(document.documentElement);
    const button = getComputedStyle(document.querySelector("button")!);
    return {
      tokens: Object.fromEntries(tokens.map((t) => [t, root.getPropertyValue(t).trim()])),
      button: { background: button.backgroundColor, color: button.color },
      link: getComputedStyle(document.querySelector('[data-slot="text"][data-link]')!).color,
      // Chromium serialises the `BlinkMacSystemFont` alias as "system-ui" on macOS and verbatim on
      // Linux (CI); that is the renderer, not the stylesheet, so both read as the same token.
      font: getComputedStyle(document.body).fontFamily.replace(
        /BlinkMacSystemFont/g,
        '"system-ui"',
      ),
      mark: document.querySelector('[data-slot="logo"]')?.getAttribute("data-mark") ?? null,
      markBackground: (() => {
        const logo = document.querySelector('[data-slot="logo"]');
        return logo ? getComputedStyle(logo).backgroundColor : null;
      })(),
    };
  }, TOKENS);
  await page.close();
  return result;
}

describe(
  "the GoDX preset reproduces 31.x, in the gh#1345 colour (gh#1220)",
  { timeout: 60_000 },
  () => {
    it.each(["light", "dark"] as const)("%s", async (theme) => {
      const got = await measure(godxCss, `theme=${theme}&preset=godx`);
      expect(got).toEqual(GODX[theme]);
    });
  },
);

describe("without the preset the identity is neutral (gh#1220)", { timeout: 60_000 }, () => {
  it("light: ink primary, near-white label, ring = primary, no mark", async () => {
    const got = await measure(neutralCss, "theme=light");
    expect(got.tokens).toEqual({
      "--primary": "240 6% 10%",
      "--primary-foreground": "60 33% 99%",
      "--brand": "240 6% 10%",
      "--brand-foreground": "60 33% 99%",
      "--ring": "240 6% 10%",
    });
    expect(got.button.background).toBe("rgb(24, 24, 27)");
    expect(got.mark).toBeNull();
    // Fonts are opt-in since v32 (#1221): the neutral stack is not the GoDX one.
    expect(got.font).not.toBe(GODX.light.font);
  });

  it("dark: near-white primary on an ink label, no mark", async () => {
    const got = await measure(neutralCss, "theme=dark");
    expect(got.tokens).toEqual({
      "--primary": "0 0% 98%",
      "--primary-foreground": "48 9% 9%",
      "--brand": "0 0% 98%",
      "--brand-foreground": "48 9% 9%",
      "--ring": "0 0% 98%",
    });
    expect(got.button.background).toBe("rgb(250, 250, 250)");
    expect(got.mark).toBeNull();
  });
});

describe("GoDX colour tokens without fonts, for a shadow root (gh#1228)", () => {
  it("godx-tokens.css paints the GoDX colour and declares no @font-face", async () => {
    // The Dock compiles styles/core into a shadow root, where @font-face is ignored; it needs the
    // GoDX colours alone. godx.css = these tokens + the fonts; importing both doubled every face.
    expect(godxTokensCss).not.toMatch(/@font-face/);
    expect(godxCss).toMatch(/@font-face/);
    const got = await measure(godxTokensCss, "theme=light&preset=godx");
    expect(got.tokens).toEqual(GODX.light.tokens);
    expect(got.button).toEqual(GODX.light.button);
  });
});
