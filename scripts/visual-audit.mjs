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
 * TESTED peer range (see TESTED_VERSIONS + README "Runtime visual audit"):
 *   playwright               >=1.55 <2   (tested 1.61.1)
 *   @axe-core/playwright     >=4.10 <5   (tested 4.12.1)
 *   axe-core                 >=4.10 <5   (tested 4.12.1)
 *
 * Usage (from the consuming app, against its running dev/preview server):
 *   node node_modules/@godxjp/ui/scripts/visual-audit.mjs http://localhost:5173 /invoices /settings
 *   node node_modules/@godxjp/ui/scripts/visual-audit.mjs http://localhost:5173 --format json
 *   node node_modules/@godxjp/ui/scripts/visual-audit.mjs --strict http://localhost:5173   # CI gate
 *   PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium node …/visual-audit.mjs http://…       # system browser
 *
 * JSON contract (--format json ALWAYS emits valid JSON, even on bootstrap failure):
 *   { status: "ok" | "partial" | "error",
 *     tool: <TESTED_VERSIONS>,
 *     summary: { errors, warnings, pages, infrastructureErrors } | null,
 *     findings: [ … product findings … ],
 *     errors:   [ … infrastructure errors (bootstrap / navigate / analyze) … ] }
 *   `status: "ok"` ONLY when every page was audited with zero infrastructure errors —
 *   so a tool/bootstrap failure can NEVER be misread as "zero violations".
 */
import { pathToFileURL } from "node:url";
import {
  VISUAL_RULES,
  isOversaturated,
  oklchChroma,
  isUndersizedTarget,
  hasEmoji,
  alertControlIssues,
} from "./visual-audit-rules.mjs";

/**
 * Peer versions this audit is tested against. Surfaced in the JSON `tool` field, the
 * README, and the MCP `list_visual_checks` command so agents pin a compatible range.
 * Playwright 1.55+ is required for the `browser.newContext()` / `context.newPage()`
 * flow that @axe-core/playwright 4.10+ expects (older `browser.newPage()` throws
 * "Please use browser.newContext()").
 */
export const TESTED_VERSIONS = {
  playwright: { range: ">=1.55 <2", tested: "1.61.1" },
  "@axe-core/playwright": { range: ">=4.10 <5", tested: "4.12.1" },
  "axe-core": { range: ">=4.10 <5", tested: "4.12.1" },
};

/** Shape one product finding from a rule id (pure — unit-tested without a browser). */
export function buildFinding(ruleId, url, message) {
  const rule = VISUAL_RULES.find((r) => r.id === ruleId);
  return {
    url,
    rule: ruleId,
    severity: rule?.severity ?? "warn",
    standard: rule?.standard,
    message,
  };
}

/**
 * Assemble the machine-readable result (pure). `findings` are PRODUCT results; `errors`
 * are INFRASTRUCTURE failures (a page that would not load, axe that would not inject).
 * `status` is "ok" only when no infra error occurred, "error" when nothing could be
 * audited, "partial" when some pages ran and some failed.
 */
export function buildResult({ findings = [], errors = [], pages = 0 } = {}) {
  const productErrors = findings.filter((f) => f.severity === "error");
  const warnings = findings.filter((f) => f.severity === "warn");
  const failedToLoad = errors.filter((e) => e.stage === "navigate").length;
  const audited = pages - failedToLoad;
  const status = errors.length === 0 ? "ok" : audited > 0 ? "partial" : "error";
  return {
    status,
    tool: TESTED_VERSIONS,
    summary: {
      errors: productErrors.length,
      warnings: warnings.length,
      pages,
      infrastructureErrors: errors.length,
    },
    findings,
    errors,
  };
}

/**
 * Assemble a BOOTSTRAP failure result (pure) — missing peers, no browser, bad args.
 * `summary` is null (never `{ warnings: 0 }`) so a consumer cannot read a bootstrap
 * failure as a clean pass.
 */
export function buildBootstrapError(message, hint) {
  return {
    status: "error",
    tool: TESTED_VERSIONS,
    summary: null,
    findings: [],
    errors: [{ stage: "bootstrap", message, ...(hint ? { hint } : {}) }],
  };
}

/** Exit code for a result: 2 = could not audit, 1 = findings/partial gate, 0 = clean. */
export function exitCodeFor(result, { strict = false } = {}) {
  if (result.status === "error") return 2;
  if (result.status === "partial") return 1;
  if (strict && result.findings.length > 0) return 1;
  if (result.summary && result.summary.errors > 0) return 1;
  return 0;
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

/** Optional-peer loader — throws a tagged bootstrap error instead of a raw stack. */
async function loadDeps() {
  try {
    const [{ chromium }, axe] = await Promise.all([
      import("playwright"),
      import("@axe-core/playwright"),
    ]);
    return { chromium, AxeBuilder: axe.default ?? axe.AxeBuilder };
  } catch (cause) {
    const err = new Error(
      "visual-audit needs the optional peers `playwright` and `@axe-core/playwright`",
    );
    err.bootstrap = true;
    err.hint =
      "pnpm add -D playwright @axe-core/playwright && pnpm exec playwright install chromium " +
      "(or set PLAYWRIGHT_CHROMIUM_EXECUTABLE to a system Chromium).";
    err.cause = cause;
    throw err;
  }
}

/**
 * Drive the browser over every target and gather findings + infra errors. Cleanup
 * (page/context/browser) is guaranteed via finally on BOTH success and failure.
 * A launch failure is re-tagged as a bootstrap error so it surfaces as `status:error`.
 */
/* c8 ignore start — the browser-driving glue; exercised by scripts/visual-audit-smoke.mjs in CI. */
async function audit(targets, { chromium, AxeBuilder }) {
  const findings = [];
  const errors = [];
  let browser;
  let context;
  try {
    try {
      browser = await chromium.launch({
        executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
      });
    } catch (cause) {
      const err = new Error(`could not launch Chromium: ${cause.message}`);
      err.bootstrap = true;
      err.hint =
        "install a browser: pnpm exec playwright install chromium " +
        "(or set PLAYWRIGHT_CHROMIUM_EXECUTABLE to a system Chromium).";
      throw err;
    }
    context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    for (const url of targets) {
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
      } catch (e) {
        errors.push({ url, stage: "navigate", message: `could not load page: ${e.message}` });
        continue;
      }

      try {
        // 1) axe-core — real WCAG/ARIA engine.
        const { violations } = await new AxeBuilder({ page }).analyze();
        for (const v of violations) {
          findings.push(
            buildFinding(
              "axe-violations",
              url,
              `${v.id} (${v.impact}) — ${v.help} [${v.nodes.length} node(s)] ${v.helpUrl}`,
            ),
          );
        }

        // 2) computed-style / layout heuristics via the PURE rules.
        const m = await page.evaluate(collectInPage);
        for (const a of m.accents) {
          if (isOversaturated(a.rgb))
            findings.push(
              buildFinding(
                "oversaturated-accent",
                url,
                `<${a.tag}> background OKLCH chroma ${oklchChroma(a.rgb).toFixed(3)} > 0.18 (rgb ${a.rgb.r},${a.rgb.g},${a.rgb.b})`,
              ),
            );
        }
        for (const t of m.targets) {
          if (isUndersizedTarget(t))
            findings.push(
              buildFinding(
                "target-size-min",
                url,
                `target "${t.name || "(unnamed)"}" is ${t.width}×${t.height}px (< 24×24)`,
              ),
            );
        }
        if (hasEmoji(m.text)) {
          const found = (m.text.match(/\p{Extended_Pictographic}/gu) || []).slice(0, 8).join(" ");
          findings.push(
            buildFinding("emoji-rendered", url, `emoji rendered in product text: ${found}`),
          );
        }
        m.alerts.forEach((al, i) => {
          for (const issue of alertControlIssues(al))
            findings.push(
              buildFinding("alert-controls-misplaced", url, `banner #${i + 1}: ${issue}`),
            );
        });
      } catch (e) {
        errors.push({ url, stage: "analyze", message: `audit engine failed: ${e.message}` });
      }
    }
  } finally {
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }

  return buildResult({ findings, errors, pages: targets.length });
}
/* c8 ignore stop */

const C = {
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  reset: "\x1b[0m",
};

/** Render a result to stdout in the requested format, then exit with the right code. */
/* c8 ignore start — thin process-exit glue, driven by the smoke/CLI paths. */
function finish(result, { asJson, strict, pages }) {
  const code = exitCodeFor(result, { strict });
  if (asJson) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    process.exit(code);
  }

  // Bootstrap failure — no page was audited.
  if (result.summary === null) {
    for (const e of result.errors) {
      process.stderr.write(`visual-audit failed: ${e.message}\n`);
      if (e.hint) process.stderr.write(`  ${e.hint}\n`);
    }
    process.exit(code);
  }

  for (const f of result.findings) {
    const tag = f.severity === "error" ? `${C.red}error${C.reset}` : `${C.yellow}warn ${C.reset}`;
    console.log(`${tag} ${C.bold}${f.url}${C.reset}  ${C.dim}[${f.rule}]${C.reset}`);
    console.log(`      ${f.message}`);
    if (f.standard) console.log(`      ${C.dim}standard: ${f.standard}${C.reset}`);
  }
  for (const e of result.errors) {
    console.log(
      `${C.red}infra${C.reset} ${C.bold}${e.url ?? "(bootstrap)"}${C.reset}  ${C.dim}[${e.stage}]${C.reset}`,
    );
    console.log(`      ${e.message}`);
  }
  const { errors, warnings } = result.summary;
  console.log(
    `\ngodxjp-ui visual-audit [${result.status}]: ${C.red}${errors} error(s)${C.reset}, ` +
      `${C.yellow}${warnings} warning(s)${C.reset}` +
      (result.errors.length ? `, ${C.red}${result.errors.length} infra error(s)${C.reset}` : "") +
      ` across ${pages} page(s).`,
  );
  if (result.status === "ok" && result.findings.length === 0)
    console.log("✓ No visual/runtime a11y violations found.");
  process.exit(code);
}
/* c8 ignore stop */

/** CLI entry — parse args, run the audit, print, exit. */
/* c8 ignore start — CLI driver, exercised via subprocess by the smoke test. */
async function main() {
  const args = process.argv.slice(2);
  const fmtIdx = args.indexOf("--format");
  const asJson = fmtIdx !== -1 && args[fmtIdx + 1] === "json";
  const strict = args.includes("--strict");

  if (args.includes("--rules")) {
    process.stdout.write(JSON.stringify(VISUAL_RULES, null, 2) + "\n");
    process.exit(0);
  }

  const urls = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--format");
  if (urls.length === 0) {
    const msg =
      "no baseUrl given — usage: visual-audit.mjs [--format json] [--strict] <baseUrl> [route …] " +
      "(baseUrl is the running app; extra args are routes appended to it)";
    finish(buildBootstrapError(msg), { asJson, strict, pages: 0 });
    return;
  }

  const base = urls[0].replace(/\/$/, "");
  const routes = urls.length > 1 ? urls.slice(1) : ["/"];
  const targets = routes.map((r) =>
    r.startsWith("http") ? r : `${base}${r.startsWith("/") ? r : `/${r}`}`,
  );

  let deps;
  try {
    deps = await loadDeps();
  } catch (e) {
    finish(buildBootstrapError(e.message, e.hint), { asJson, strict, pages: targets.length });
    return;
  }

  try {
    const result = await audit(targets, deps);
    finish(result, { asJson, strict, pages: targets.length });
  } catch (e) {
    // A launch/setup failure = infrastructure error (never "zero violations").
    finish(buildBootstrapError(e.message, e.hint), { asJson, strict, pages: targets.length });
  }
}
/* c8 ignore stop */

// Run only as a CLI — importing this module (for unit tests) must NOT execute.
/* c8 ignore start */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    const asJson =
      process.argv.indexOf("--format") !== -1 &&
      process.argv[process.argv.indexOf("--format") + 1] === "json";
    if (asJson) {
      process.stdout.write(JSON.stringify(buildBootstrapError(e.message, e.hint)) + "\n");
    } else console.error(`visual-audit failed: ${e.message}`);
    process.exit(2);
  });
}
/* c8 ignore stop */
