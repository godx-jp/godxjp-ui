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

// Port có thể override qua env PREVIEW_BASE — BẮT BUỘC trên runner self-hosted chung host:
// nhiều job (axe/coverage/geometry) dùng chung harness; nếu cùng port 6008 thì
// ensurePreviewServer thấy "reachable" sẽ TÁI DÙNG server của job khác, job đó xong gọi
// cleanup() giết server → job đang chạy mất server giữa chừng (CONNECTION_REFUSED). Mỗi job
// 1 port riêng → mỗi job tự sở hữu server của mình.
export const DEFAULT_BASE = process.env.PREVIEW_BASE || "http://localhost:6008";

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

/**
 * Is a preview answering at `url`?
 *
 * Probes the loopback ADDRESS as well as the name. `vite preview` binds 127.0.0.1 and says so
 * ("Network: use --host to expose"), while `localhost` may resolve to ::1 first — and on a host
 * where the IPv4 fallback is slower than the probe's own abort, every attempt times out while the
 * server sits there perfectly healthy. Asking both removes name resolution from the question
 * entirely; the abort is also 3s rather than 1500ms, since the old budget could expire during a
 * fallback rather than because nothing was listening.
 */
async function reachable(url) {
  const candidates = [url];
  try {
    const u = new URL(url);
    if (u.hostname === "localhost") {
      u.hostname = "127.0.0.1";
      candidates.push(u.toString());
    }
  } catch {
    /* not a URL we can rewrite — probe it as given */
  }
  for (const candidate of candidates) {
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 3000);
      await fetch(candidate, { signal: c.signal });
      clearTimeout(t);
      return true;
    } catch {
      /* try the next candidate */
    }
  }
  return false;
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

  // Assert the build produced an artefact instead of trusting its exit code. `pnpm preview:build`
  // finished in 2.4s on CI — too fast to have built this app — and then `vite preview` served
  // nothing for three minutes while the error blamed the server. An exit code says a command ran;
  // it does not say it wrote anything.
  const { existsSync, readdirSync } = await import("node:fs");
  const outDir = path.join(REPO_ROOT, "preview/dist");
  if (!existsSync(path.join(outDir, "index.html"))) {
    throw new Error(
      `preview:build exited 0 but produced no preview/dist/index.html` +
        (existsSync(outDir)
          ? ` (dir holds: ${readdirSync(outDir).slice(0, 8).join(", ")})`
          : " (no dir at all)"),
    );
  }

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
    // BOTH streams captured. stderr alone was not enough: it held only a config warning while the
    // server sat there not answering for three minutes. `vite preview` announces the address it is
    // actually listening on via STDOUT — which was being discarded — so the one line that
    // distinguishes "never listened" from "listened but nothing could reach it" was the one line
    // being thrown away.
    { stdio: ["ignore", "pipe", "pipe"], detached: true, cwd: REPO_ROOT },
  );
  // Echoed LIVE, not buffered for the error path. A previous attempt captured stdout into a
  // variable and then failed to print it — the string edit that was meant to add it to the
  // timeout message silently did not match, so seven rounds of instrumenting produced a log that
  // still said nothing. Streaming it to the console cannot be defeated that way: whatever the
  // server prints appears in CI, whether the wait succeeds or not.
  let serverStderr = "";
  proc.stdout?.on("data", (c) => process.stdout.write(`[vite preview] ${c}`));
  proc.stderr?.on("data", (c) => {
    serverStderr += String(c);
    process.stdout.write(`[vite preview:err] ${c}`);
  });

  const cleanup = () => {
    try {
      process.kill(-proc.pid);
    } catch {
      /* noop */
    }
  };
  // 60s was enough when one gate ran at a time. The rendered-runtime matrix puts five of these
  // on one self-hosted host at once, beside another workflow's five test shards, and `vite preview`
  // then takes longer than a minute just to bind. Env-tunable so a busier pool can raise it without
  // a code change — but note the matrix is also throttled with `max-parallel`, because a budget is
  // the wrong place to absorb oversubscription.
  const budget = Number(process.env.PREVIEW_START_TIMEOUT_MS ?? 180_000) / 1000;
  for (let i = 0; i < budget; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await reachable(base)) return cleanup;
  }
  cleanup();
  throw new Error(
    `static preview server did not come up in ${budget}s on ${base}.\n` +
      `Everything the server printed is above, prefixed [vite preview]. If there is no such line ` +
      `at all, it never reported listening.` +
      (serverStderr ? `\n--- stderr ---\n${serverStderr}` : ""),
  );
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
