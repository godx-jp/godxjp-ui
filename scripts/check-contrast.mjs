#!/usr/bin/env node
/**
 * check:contrast — WCAG 2.2 SC 1.4.3 text-contrast guard (browser-rendered).
 *
 * jsdom/axe-in-vitest cannot see colour (no layout/paint), so a "dark text on a dark scoped region"
 * bug (e.g. an outline Button inheriting the body's dark colour onto an on-navy hero → label
 * near-invisible) slips every static check. This guard renders real pages in Chromium, computes the
 * effective background behind every text node, and fails on any pair below the WCAG AA threshold
 * (4.5:1 normal text · 3:1 large text ≥24px or ≥18.66px bold).
 *
 * Exemptions (WCAG): logotypes (`[data-logotype]`), disabled/inactive text (opacity < 0.4), and
 * pure-decorative/placeholder nodes. Add `data-logotype` to a brand wordmark to exempt it.
 *
 * Usage:  node scripts/check-contrast.mjs [baseUrl] [route ...]
 *   default baseUrl = http://localhost:6008 (a running `pnpm preview`); default routes = the
 *   showcases + a few representative default-theme pages. Exits 1 on any failure.
 */
const base = process.argv[2]?.startsWith("http") ? process.argv[2] : "http://localhost:6008";
const routeArgs = process.argv.slice(2).filter((a) => !a.startsWith("http"));
// Default audit set — the two brand re-theme showcases (a consumer's design reproduced from tokens
// must be AA clean) PLUS representative default-theme surfaces where coloured status text lives
// (KPI deltas, status badges, alerts). Pass routes as args to audit any other page.
const ROUTES = routeArgs.length
  ? routeArgs
  : [
      // The brand re-theme showcases — a consumer's design reproduced from tokens alone must be AA
      // clean. These read `acme-*`, not the `tiximax-*` this list carried for a long time after the
      // rename: those two routes rendered "Showcase not found" and the sweep reported the empty
      // page AA clean, so the coverage this comment claims did not exist. The not-found guard below
      // is what makes that impossible to repeat. `futurelastic-web` is the dark-ground third brand.
      "/showcase/acme-portal",
      "/showcase/acme-website",
      "/showcase/futurelastic-web",
      "/showcase/case1-warehouse-dashboard",
      "/isolate/feedback-alert",
      "/isolate/data-display-badge",
      "/isolate/data-display-stat-card",
      // gh#199 — destructive Button labels (incl. AlertDialog actions) must stay AA on their fill,
      // audited in BOTH themes (the dark default previously sat at 4.54:1 and slipped this guard,
      // which only covered default-theme text). Deterministic token coverage: destructive-contrast.test.
      "/isolate/feedback-alert-dialog",
      "/isolate/feedback-alert-dialog?theme=dark",
      // gh#320 — the Button counter pill. The id is `general-button-index` (docs/general/button/
      // index.tsx); `general-button` resolves to nothing.
      "/isolate/general-button-index",
      "/isolate/general-button-index?theme=dark",
    ];

const EXEC =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  "/opt/pw-browsers/chromium-1228/chrome-linux64/chrome";

const lum = ([r, g, b]) => {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, c) => {
  const L1 = lum(a),
    L2 = lum(c);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
};

// Runs in the page: collect {fg, bg, size, weight, text, sel} for every leaf text element.
function collect() {
  const parse = (c) => {
    const m = c && c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(",").map((s) => parseFloat(s));
    return { rgb: [p[0], p[1], p[2]], a: p[3] === undefined ? 1 : p[3] };
  };
  const effBg = (el) => {
    let n = el;
    while (n) {
      const s = getComputedStyle(n);
      const bg = parse(s.backgroundColor);
      if (bg && bg.a > 0.5) return bg.rgb;
      n = n.parentElement;
    }
    return [255, 255, 255];
  };
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    if (el.closest("[data-logotype]")) continue;
    const txt = el.textContent && el.textContent.trim();
    if (!txt || txt.length < 2) continue;
    // leaf text only (has a non-empty direct text node)
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none" || parseFloat(s.opacity) < 0.4) continue;
    const fg = parse(s.color);
    const bg = effBg(el);
    if (!fg || fg.a < 0.5 || !bg) continue;
    out.push({
      fg: fg.rgb,
      bg,
      size: parseFloat(s.fontSize),
      weight: parseInt(s.fontWeight) || 400,
      text: txt.slice(0, 44),
      tag: el.tagName.toLowerCase(),
      cls: (el.className && el.className.toString().split(/\s+/)[0]) || "",
    });
  }
  return out;
}

async function ensureServer() {
  // Delegates to the ONE preview-server implementation CI has proven, instead of a fourth
  // hand-rolled copy. This gate used to spawn `pnpm preview` — the DEV server — with
  // `stdio: "ignore"`, a 60s budget, and a probe that asked only the NAME `localhost`. Every
  // failure mode fixed elsewhere in gh#333 lived here at once, which is exactly why this gate was
  // still red after the other five went green. The helper builds, serves the static output, binds
  // 127.0.0.1 explicitly, echoes what the server prints, and waits a budget suited to CI.
  const { ensurePreviewServer } = await import("./frame-harness.mjs");
  return ensurePreviewServer(base);
}

async function main() {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.warn("⚠ check:contrast skipped — playwright not installed (browser-only gate).");
    return; // skip in a browser-less CI rather than fail the build
  }
  let stopServer;
  try {
    stopServer = await ensureServer();
  } catch (e) {
    // A preview that will not start is a BROKEN GATE, not a gate with nothing to do. Skipping it
    // let three browser gates report success on CI for weeks while never once loading a page —
    // and that green is what made me spend six rounds asking why the OTHER shards were red, when
    // none of them had ever worked. `CI=true` is the honest line: locally a missing browser or a
    // busy port is a reason to step aside, but on CI it is the failure itself.
    if (process.env.CI) throw e;
    console.warn(`⚠ check:contrast skipped — ${e.message}.`);
    return;
  }
  const cleanup = () => stopServer?.();
  // Use the pinned executable only when it actually exists (dev machines /
  // self-hosted runners with a fixed /opt browser). Otherwise fall back to
  // Playwright's own resolution so `playwright install chromium` on a stock CI
  // runner works too.
  const { existsSync } = await import("node:fs");
  const execPath = EXEC && existsSync(EXEC) ? EXEC : undefined;
  const browser = await chromium.launch(execPath ? { executablePath: execPath } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  let total = 0;
  for (const route of ROUTES) {
    const url = route.startsWith("http") ? route : `${base}${route}`;
    let items;
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1200);
      // A route that does not resolve renders a small "not found" card, and a card with four
      // legible words passes every contrast check there is. Two showcases and the Button page sat
      // in this list for months reporting "AA clean" on exactly that page. A sweep that cannot
      // tell "nothing failed" from "nothing was there" is not evidence, so this is now an error.
      const missing = await page.evaluate(() => {
        const text = document.body.innerText;
        const m = text.match(/(Showcase|Preview) not found[\s\S]{0,40}?Unknown id: (\S+)/);
        return m ? m[2] : null;
      });
      if (missing) {
        console.error(
          `✗ ${route}: route does not resolve (unknown id "${missing}") — the page rendered a ` +
            `not-found card, so auditing it proves nothing. Fix the route, do not delete it.`,
        );
        total++;
        continue;
      }
      items = await page.evaluate(collect);
    } catch (e) {
      console.error(
        `✗ ${route}: failed to load (${e.message.split("\n")[0]}). Is \`pnpm preview\` running?`,
      );
      total++;
      continue;
    }
    const fails = [];
    for (const e of items) {
      const r = ratio(e.fg, e.bg);
      const large = e.size >= 24 || (e.size >= 18.66 && e.weight >= 700);
      const min = large ? 3 : 4.5;
      if (r < min - 0.01)
        fails.push(
          `    ✗ ${r.toFixed(2)} (need ${min}) <${e.tag}.${e.cls}> "${e.text}"  fg=${e.fg.join(",")} bg=${e.bg.join(",")}`,
        );
    }
    if (fails.length) {
      console.error(`✗ ${route} — ${fails.length} contrast failure(s):`);
      for (const f of fails) console.error(f);
      total += fails.length;
    } else {
      console.log(`✓ ${route} — text contrast AA clean (${items.length} text nodes)`);
    }
  }
  await browser.close();
  cleanup();
  if (total) {
    console.error(
      `\n✗ check:contrast — ${total} WCAG AA text-contrast failure(s). Darken the token or fix the colour.`,
    );
    process.exit(1);
  }
  console.log("\n✓ check:contrast — all audited pages pass WCAG AA text contrast.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
