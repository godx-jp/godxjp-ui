#!/usr/bin/env node
/**
 * godxjp-ui VISUAL audit — the runtime counterpart to the static ui-audit.mjs.
 *
 * Static audit (ui-audit.mjs) reads SOURCE with regexes — zero deps, fast, runs on
 * every save. This audit drives a REAL browser (Playwright) over the running app and
 * runs axe-core + computed-style/layout heuristics, catching what source can't see:
 * colour contrast, target size, OKLCH chroma of a rendered accent, emoji that survived
 * to the DOM, and a mis-laid-out notification banner. Warnings by default (agent
 * guidance) — pass --strict to exit non-zero. Run it BEFORE an AI/human visual review.
 *
 * Playwright + @axe-core/playwright are OPTIONAL peer deps — installed only by apps that
 * run this audit, so the static audit and the library stay browser-free.
 *
 * Usage (from the consuming app, against its running dev/preview server):
 *   node node_modules/@godxjp/ui/scripts/visual-audit.mjs http://localhost:5173 /invoices /settings
 *   node node_modules/@godxjp/ui/scripts/visual-audit.mjs --format json http://localhost:5173
 *   node node_modules/@godxjp/ui/scripts/visual-audit.mjs --strict http://localhost:5173   # CI gate
 *   PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium node …/visual-audit.mjs http://…       # system browser
 */
import {
  VISUAL_RULES,
  isOversaturated,
  oklchChroma,
  isUndersizedTarget,
  hasEmoji,
  alertControlIssues,
} from "./visual-audit-rules.mjs";

const args = process.argv.slice(2);
const asJson = args.includes("--format") && args[args.indexOf("--format") + 1] === "json";
const strict = args.includes("--strict");
const listRules = args.includes("--rules");

if (listRules) {
  process.stdout.write(JSON.stringify(VISUAL_RULES, null, 2) + "\n");
  process.exit(0);
}

const C = {
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  reset: "\x1b[0m",
};

const urls = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--format");
if (urls.length === 0) {
  console.error(
    "usage: visual-audit.mjs [--format json] [--strict] <baseUrl> [route …]\n" +
      "       (baseUrl is the running app; extra args are routes appended to it)",
  );
  process.exit(2);
}
const base = urls[0].replace(/\/$/, "");
const routes = urls.length > 1 ? urls.slice(1) : ["/"];
const targets = routes.map((r) =>
  r.startsWith("http") ? r : `${base}${r.startsWith("/") ? r : `/${r}`}`,
);

/** Optional-peer loader — print a clear install hint instead of a stack trace. */
async function loadDeps() {
  try {
    const [{ chromium }, axe] = await Promise.all([
      import("playwright"),
      import("@axe-core/playwright"),
    ]);
    return { chromium, AxeBuilder: axe.default ?? axe.AxeBuilder };
  } catch {
    console.error(
      "visual-audit needs the optional peers `playwright` and `@axe-core/playwright`:\n" +
        "  pnpm add -D playwright @axe-core/playwright\n" +
        "  pnpm exec playwright install chromium\n" +
        "(or set PLAYWRIGHT_CHROMIUM_EXECUTABLE to a system Chromium).",
    );
    process.exit(2);
  }
}

/** Collect raw measurements from the rendered page; the PURE rules run back in node. */
/* c8 ignore start — runs inside the browser, exercised in the consumer/CI env. */
function collectInPage() {
  const rgb = (s) => {
    const m = s && s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = "1"] = m[1].split(",").map((x) => x.trim());
    return { r: +r, g: +g, b: +b, a: +a };
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";
  };

  // Accent surfaces — buttons / primary CTAs / banners whose background carries colour.
  const accents = [];
  for (const el of document.querySelectorAll(
    "button, [role=button], a[class*=primary], [data-slot=alert], [class*=banner], [class*=notification]",
  )) {
    if (!visible(el)) continue;
    const c = rgb(getComputedStyle(el).backgroundColor);
    if (c && c.a > 0.5)
      accents.push({ rgb: { r: c.r, g: c.g, b: c.b }, tag: el.tagName.toLowerCase() });
  }

  // Interactive targets — for the 24×24 minimum.
  const targets = [];
  for (const el of document.querySelectorAll(
    "a[href], button, [role=button], input:not([type=hidden]), select, [tabindex]:not([tabindex='-1'])",
  )) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    const name = (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40);
    targets.push({ width: Math.round(r.width), height: Math.round(r.height), name });
  }

  // Emoji that survived to the rendered DOM.
  const text = document.body ? document.body.innerText : "";

  // Notification banners — measure their anatomy.
  const alerts = [];
  for (const el of document.querySelectorAll(
    "[role=alert], [role=status], [data-slot=alert], [class*=banner], [class*=notification]",
  )) {
    if (!visible(el)) continue;
    const box = el.getBoundingClientRect();
    const icons = el.querySelectorAll("svg, img").length;
    const btns = [...el.querySelectorAll("button, [role=button], a[href]")];
    const actionWidthRatio = btns.length
      ? Math.max(...btns.map((b) => b.getBoundingClientRect().width)) / (box.width || 1)
      : 0;
    const cs = getComputedStyle(el);
    const direction =
      cs.display.includes("flex") && cs.flexDirection.startsWith("column")
        ? "column"
        : cs.display.includes("flex")
          ? "row"
          : "column";
    const dismiss = btns.find((b) =>
      /close|dismiss|閉じる|×|✕/i.test(b.getAttribute("aria-label") || b.textContent || ""),
    );
    let dismissCorner = null;
    if (dismiss) {
      const d = dismiss.getBoundingClientRect();
      const nearTop = d.top - box.top < box.height * 0.4;
      const nearRight = box.right - d.right < box.width * 0.25;
      dismissCorner = nearTop && nearRight ? "top-right" : "other";
    }
    alerts.push({
      iconCount: icons,
      actionWidthRatio,
      direction,
      hasDismiss: !!dismiss,
      dismissCorner,
    });
  }

  return { accents, targets, text, alerts };
}
/* c8 ignore stop */

async function run() {
  const { chromium, AxeBuilder } = await loadDeps();
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const findings = [];
  const add = (ruleId, url, message) => {
    const rule = VISUAL_RULES.find((r) => r.id === ruleId);
    findings.push({
      url,
      rule: ruleId,
      severity: rule?.severity ?? "warn",
      standard: rule?.standard,
      message,
    });
  };

  for (const url of targets) {
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
    } catch (e) {
      add("axe-violations", url, `could not load page: ${e.message}`);
      continue;
    }

    // 1) axe-core — real WCAG/ARIA engine.
    const { violations } = await new AxeBuilder({ page }).analyze();
    for (const v of violations) {
      add(
        "axe-violations",
        url,
        `${v.id} (${v.impact}) — ${v.help} [${v.nodes.length} node(s)] ${v.helpUrl}`,
      );
    }

    // 2) computed-style / layout heuristics via the PURE rules.
    const m = await page.evaluate(collectInPage);
    for (const a of m.accents) {
      if (isOversaturated(a.rgb))
        add(
          "oversaturated-accent",
          url,
          `<${a.tag}> background OKLCH chroma ${oklchChroma(a.rgb).toFixed(3)} > 0.18 (rgb ${a.rgb.r},${a.rgb.g},${a.rgb.b})`,
        );
    }
    for (const t of m.targets) {
      if (isUndersizedTarget(t))
        add(
          "target-size-min",
          url,
          `target "${t.name || "(unnamed)"}" is ${t.width}×${t.height}px (< 24×24)`,
        );
    }
    if (hasEmoji(m.text)) {
      const found = (m.text.match(/\p{Extended_Pictographic}/gu) || []).slice(0, 8).join(" ");
      add("emoji-rendered", url, `emoji rendered in product text: ${found}`);
    }
    m.alerts.forEach((al, i) => {
      for (const issue of alertControlIssues(al))
        add("alert-controls-misplaced", url, `banner #${i + 1}: ${issue}`);
    });
  }

  await browser.close();
  report(findings);
}

function report(findings) {
  const errors = findings.filter((f) => f.severity === "error");
  const warnings = findings.filter((f) => f.severity === "warn");
  if (asJson) {
    process.stdout.write(
      JSON.stringify(
        { summary: { errors: errors.length, warnings: warnings.length }, findings },
        null,
        2,
      ) + "\n",
    );
  } else {
    for (const f of findings) {
      const tag = f.severity === "error" ? `${C.red}error${C.reset}` : `${C.yellow}warn ${C.reset}`;
      console.log(`${tag} ${C.bold}${f.url}${C.reset}  ${C.dim}[${f.rule}]${C.reset}`);
      console.log(`      ${f.message}`);
      if (f.standard) console.log(`      ${C.dim}standard: ${f.standard}${C.reset}`);
    }
    console.log(
      `\ngodxjp-ui visual-audit: ${C.red}${errors.length} error(s)${C.reset}, ${C.yellow}${warnings.length} warning(s)${C.reset} across ${targets.length} page(s).`,
    );
    if (findings.length === 0) console.log("✓ No visual/runtime a11y violations found.");
  }
  // Warnings never block; --strict turns any finding into a non-zero exit (CI gate).
  process.exit(strict && findings.length > 0 ? 1 : errors.length > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error(`visual-audit failed: ${e.message}`);
  process.exit(2);
});
