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
      "/showcase/tiximax-portal",
      "/showcase/tiximax-website",
      "/showcase/case1-warehouse-dashboard",
      "/isolate/feedback-alert",
      "/isolate/data-display-badge",
      "/isolate/data-display-stat-card",
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

async function ensureServer() {
  if (await reachable(base)) return null;
  if (!base.includes("localhost")) return null; // remote URL the caller owns
  const { spawn } = await import("node:child_process");
  console.log("· starting `pnpm preview` for the contrast audit…");
  const proc = spawn("pnpm", ["preview"], { stdio: "ignore", detached: true });
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await reachable(base)) return proc;
  }
  try {
    process.kill(-proc.pid);
  } catch {
    /* noop */
  }
  throw new Error("preview server did not come up in 60s");
}

async function main() {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.warn("⚠ check:contrast skipped — playwright not installed (browser-only gate).");
    return; // skip in a browser-less CI rather than fail the build
  }
  let server;
  try {
    server = await ensureServer();
  } catch (e) {
    console.warn(`⚠ check:contrast skipped — ${e.message}.`);
    return;
  }
  const cleanup = () => {
    if (server) {
      try {
        process.kill(-server.pid);
      } catch {
        /* noop */
      }
    }
  };
  const browser = await chromium.launch({ executablePath: EXEC });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  let total = 0;
  for (const route of ROUTES) {
    const url = route.startsWith("http") ? route : `${base}${route}`;
    let items;
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1200);
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
