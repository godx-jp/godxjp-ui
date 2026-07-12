/**
 * Shared plumbing for the /frame/** headless gates (check-frame-axe, frame-geometry,
 * frame-coverage). One source of truth for: spinning up `pnpm preview`, resolving a
 * Chromium binary, loading the machine-readable story manifest, and reading the public
 * component inventory. Keeping this in one place means the axe gate, the geometry sweep
 * and the coverage tracker can never drift on which frames exist.
 */
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const DEFAULT_BASE = "http://localhost:6008";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(HERE, "..");

/** Viewport baseline required by docs/FRAME-COVERAGE-STANDARD.md (issue #163 §5). */
export const VIEWPORT_MATRIX = [320, 375, 390, 768, 1024, 1280, 1440, 1920];

/** The two axe viewports (issue #157): desktop + mobile-sm. */
export const AXE_VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900 },
  { id: "mobile", width: 375, height: 667 },
];

const EXEC =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  "/opt/pw-browsers/chromium-1228/chrome-linux64/chrome";

export function resolveChromiumExecutable() {
  return EXEC && existsSync(EXEC) ? EXEC : undefined;
}

/** Optional-peer loader — playwright + @axe-core/playwright are optional peers. */
export async function loadDeps({ axe = true } = {}) {
  const { chromium } = await import("playwright");
  if (!axe) return { chromium };
  const axeMod = await import("@axe-core/playwright");
  return { chromium, AxeBuilder: axeMod.default ?? axeMod.AxeBuilder };
}

async function reachable(url) {
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 1500);
    await fetch(url, { signal: c.signal });
    clearTimeout(t);
    return true;
  } catch {
    return false;
  }
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    import("node:child_process").then(({ spawn }) => {
      const p = spawn(cmd, args, { stdio: "ignore", cwd: REPO_ROOT });
      p.on("close", (code) =>
        code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} exited ${code}`)),
      );
      p.on("error", reject);
    });
  });
}

/**
 * Ensure a preview server answers at `base`. If one is already up (a running `pnpm preview`
 * dev server, or a remote base) it is reused. Otherwise we build the preview and serve the
 * STATIC output with `vite preview`. The dev server recompiles per request and its cold
 * optimizeDeps reload + degradation over a long frame sweep made the gate flaky; the built
 * output is deterministic and stable under sustained headless load. Returns a cleanup fn.
 */
export async function ensurePreviewServer(base = DEFAULT_BASE) {
  if (await reachable(base)) return () => {};
  if (!base.includes("localhost")) return () => {};
  const port = new URL(base).port || "6008";

  console.log("· building static preview (pnpm preview:build)…");
  await run("pnpm", ["preview:build"]);

  const { spawn } = await import("node:child_process");
  console.log(`· serving built preview on :${port} (vite preview)…`);
  const proc = spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "preview",
      "--config",
      "preview/vite.config.ts",
      "--port",
      port,
      "--strictPort",
    ],
    { stdio: "ignore", detached: true, cwd: REPO_ROOT },
  );
  const cleanup = () => {
    try {
      process.kill(-proc.pid);
    } catch {
      /* noop */
    }
  };
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await reachable(base)) return cleanup;
  }
  cleanup();
  throw new Error("static preview server did not come up in 60s");
}

/**
 * Load the frame manifest from the running preview. Navigates to `/` (which sets
 * `window.__STORY_MANIFEST__` in main.tsx) and returns the slim entries.
 */
export async function loadManifest(page, base = DEFAULT_BASE) {
  // A COLD Vite dev server pre-bundles deps on the first `/` hit and forces a full reload,
  // which destroys the page execution context mid-read. Re-navigating on a warm server is
  // reliable, so retry the whole goto+read for up to 90s rather than reading once.
  const deadline = Date.now() + 90_000;
  let attempt = 0;
  while (Date.now() < deadline) {
    attempt++;
    try {
      await page.goto(`${base}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await page.waitForTimeout(1500); // let module execution + any optimizeDeps reload settle
      const m = await page.evaluate(() => window.__STORY_MANIFEST__ ?? null);
      if (Array.isArray(m) && m.length > 0) return m;
    } catch {
      /* execution context destroyed by an optimizeDeps reload — retry on the warm server */
    }
    await page.waitForTimeout(1000);
  }
  throw new Error(
    `window.__STORY_MANIFEST__ never populated after ${attempt} attempt(s) — is preview built ` +
      "from this branch (main.tsx exposes it)?",
  );
}

/**
 * Filter the manifest to component-contract frames. Showcases (full standalone product
 * pages under `docs/showcase/**`) are a different surface and are excluded from the
 * component-frame gates by default; pass `{ includeShowcase: true }` to keep them.
 */
export function componentFrames(manifest, { includeShowcase = false } = {}) {
  return manifest.filter((m) => {
    const isShowcase = m.groupPath?.some?.((g) => /showcase/i.test(g)) || /^showcase-/.test(m.id);
    return includeShowcase || !isShowcase;
  });
}

/**
 * Public component inventory parsed from the MCP catalog (`mcp/src/data/components.ts`) —
 * the canonical published surface. Returns [{ name, group, deprecated }]. Parsing the TS
 * source with a scoped regex avoids a build step and keeps the tracker dependency-free.
 */
export function loadComponentInventory() {
  const src = readFileSync(path.join(REPO_ROOT, "mcp/src/data/components.ts"), "utf8");
  const start = src.indexOf("export const COMPONENTS");
  const body = start >= 0 ? src.slice(start) : src;
  const entries = [];
  // Match each object head: name → (…) → group, tolerating props in between.
  const re = /\n {4}name: "([^"]+)",\n {4}group: "([^"]+)",/g;
  let m;
  while ((m = re.exec(body))) {
    const name = m[1];
    const group = m[2];
    // deprecated flag may appear later in the same entry (before the next `name:`)
    const next = re.lastIndex;
    const nextName = body.indexOf('\n    name: "', next);
    const slice = body.slice(next, nextName < 0 ? undefined : nextName);
    const deprecated = /\n {4}deprecated: true,/.test(slice);
    entries.push({ name, group, deprecated });
  }
  return entries;
}

/** kebab-case a component / frame token for fuzzy frame↔component matching. */
export function kebab(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
