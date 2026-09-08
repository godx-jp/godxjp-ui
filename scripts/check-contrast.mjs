#!/usr/bin/env node
/**
 * check:contrast — WCAG 2.2 SC 1.4.3 text-contrast guard (browser-rendered). jsdom/axe-in-vitest
 * cannot see colour (no layout/paint), so a "dark text on a dark scoped region" bug (e.g. an
 * outline Button inheriting the body's dark colour onto an on-navy hero → label near-invisible)
 * slips every static check. This guard renders real pages in Chromium, computes the effective
 * background behind every text node, and fails on any pair below the WCAG AA threshold (4.5:1
 * normal text · 3:1 large text ≥24px or ≥18.66px bold).
 */
const base = process.argv[2]?.startsWith("http") ? process.argv[2] : "http://localhost:6008";
const routeArgs = process.argv.slice(2).filter((a) => !a.startsWith("http"));
// must be AA clean) PLUS representative default-theme surfaces where coloured status text lives
// (KPI deltas, status badges, alerts). Pass routes as args to audit any other page.
const ROUTES = routeArgs.length
  ? routeArgs
  : [
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
      // AlertDialog actions) must stay AA on their fill,
      // which only covered default-theme text). Deterministic token coverage: destructive-contrast.test.
      "/isolate/feedback-alert-dialog",
      "/isolate/feedback-alert-dialog?theme=dark",
      // The id is `general-button-index` (docs/general/button/
      // index.tsx); `general-button` resolves to nothing.
      "/isolate/general-button-index",
      "/isolate/general-button-index?theme=dark",
      // TOAST — the surfaces this sweep could NOT see, by construction, until `?toast=` existed.
      //
      // Every other route here is measured by loading it: whatever the page paints on mount is
      // what gets collected. A toast paints on NOTHING — it exists only after a user action — so
      // for as long as this list has existed, zero toast pixels have ever been measured, and the
      // gate reported "AA clean" while saying nothing at all about the four richest coloured
      // surfaces the library ships. That is not a threshold that was set too loosely; it is a
      // surface that was never in the sample. `?toast=<type>` fires exactly one toast (see
      // PREPARE) and then the ordinary sweep runs against it.
      //
      // Four types × two themes, because the tone triple (`--<type>-bg` / `-border` / `-text`) is
      // composed per type AND retuned per theme: eight independent pairs, so eight measurements.
      "/isolate/feedback-toast?toast=success",
      "/isolate/feedback-toast?toast=error",
      "/isolate/feedback-toast?toast=warning",
      "/isolate/feedback-toast?toast=info",
      "/isolate/feedback-toast?toast=success&theme=dark",
      "/isolate/feedback-toast?toast=error&theme=dark",
      "/isolate/feedback-toast?toast=warning&theme=dark",
      "/isolate/feedback-toast?toast=info&theme=dark",
    ];

/**
 * Per-route setup, run after the page has loaded and before anything is measured.
 *
 * A route whose surface only exists after an interaction needs one of these, or the sweep audits
 * an empty stage and calls it clean.
 *
 * SETTLING IS PART OF THE SETUP, NOT AN OPTIMISATION. Sonner ramps `opacity` 0→1 over 400ms on
 * the toast and, separately, on its children. Sampling inside that ramp measures text flattened
 * against its own surface at a fractional alpha — measured on this very page at α=.026 → 1.01:1
 * and α=.758 → 4.43:1, for a toast whose settled ratios are 6.61:1 and 6.68:1. Those are frames
 * of an animation, not states of the UI, and a gate that reports them is reporting noise. Wait
 * for `[data-title]` to reach full opacity, then measure what a reader actually gets.
 */
const PREPARE = {
  "/isolate/feedback-toast": async (page, params) => {
    const type = params.get("toast");
    if (!type) throw new Error("feedback-toast needs ?toast=<success|error|warning|info>");
    await page.getByRole("button", { name: type, exact: true }).first().click();
    await page.waitForSelector(`[data-sonner-toast][data-type="${type}"] [data-title]`, {
      timeout: 10000,
    });
    await page.waitForFunction(
      (t) => {
        const el = document.querySelector(`[data-sonner-toast][data-type="${t}"]`);
        if (!el) return false;
        let opacity = 1;
        for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
          opacity *= parseFloat(getComputedStyle(n).opacity);
        }
        return opacity > 0.999;
      },
      type,
      { timeout: 10000 },
    );
  },
};

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
    if (!c) return null;
    const rgb = c.match(/rgba?\(([^)]+)\)/);
    if (rgb) {
      const p = rgb[1]
        .split(/[,\s/]+/)
        .filter(Boolean)
        .map(parseFloat);
      return { rgb: [p[0], p[1], p[2]], a: p[3] === undefined ? 1 : p[3] };
    }
    // `color(srgb r g b)` — what Chromium returns for a computed `color-mix()`, and the ONLY
    // shape every tinted surface in this system resolves to (Toast's `--success-bg` and friends
    // are `color-mix(in srgb, hsl(var(--hue)) 5%, hsl(var(--popover)))`). The rgba()-only regex
    // returned null for those, `effBg` treated the element as having no background and kept
    // walking, and the sweep ended up measuring coloured text against the page — or against the
    // [255,255,255] fallback. Every ratio it reported for a tinted surface was the wrong pair.
    const srgb = c.match(/color\(srgb\s+([^)]+)\)/);
    if (srgb) {
      const p = srgb[1]
        .split(/[\s/]+/)
        .filter(Boolean)
        .map(parseFloat);
      return { rgb: [p[0] * 255, p[1] * 255, p[2] * 255], a: p[3] === undefined ? 1 : p[3] };
    }
    return null;
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
  // hand-rolled copy.
  // `stdio: "ignore"`, a 60s budget, and a probe that asked only the NAME `localhost`. Every
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
  // Otherwise fall back to
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
      // A ROUTE THAT ASKS FOR DARK MUST HAVE GOT DARK. `/isolate/**` read `?theme` nowhere until
      // now, so `…?theme=dark` rendered the light theme and this list's two "dark" entries were
      // byte-identical re-runs of the two light ones above them — eleven routes, nine surfaces,
      // and a dark theme nobody had measured through this entry point. Same lesson as the
      // not-found guard: a query string that resolves to nothing must fail, not pass quietly.
      const params = new URL(url).searchParams;
      if (params.get("theme") === "dark") {
        const applied = await page.evaluate(() => document.documentElement.dataset.theme);
        if (applied !== "dark") {
          console.error(
            `✗ ${route}: asked for ?theme=dark and got <html data-theme="${applied ?? ""}"> — the ` +
              `page ignored the switch, so this route is a duplicate of its light twin.`,
          );
          total++;
          continue;
        }
      }
      const prepare = PREPARE[new URL(url).pathname];
      if (prepare) await prepare(page, params);
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
