#!/usr/bin/env node
/**
 * check:frame-token-wins — a component token the BROWSER throws away.
 *
 * WHY THIS GATE EXISTS. Four times the same defect has shipped: a token declared in
 * `@layer components` that a declaration outside that layer — nearly always a Tailwind utility on
 * the same element — silently outranks. gh#366 (`.ui-app-setting-picker-icon` vs `w-full`),
 * gh#375 (the reason `width="bounded"` emits no utility at all), gh#819 (all eight per-kind
 * `.ui-app-setting-picker-trigger` widths vs `w-auto`) and the fourth that gh#819's own new gate
 * found on its first run (`.ui-pagination-size-trigger` vs `w-max`). The token RESOLVES, so
 * `check:dist-tokens-resolve` is green; it is CATALOGUED, so the MCP hands it to a consumer as a
 * knob; it simply never wins. An inert token is worse than a missing one — a missing one fails
 * loudly at the call site, an inert one reports success and changes nothing.
 *
 * `check:token-width-wins` is the static half and says so in its own header: it is a PAIRING rule
 * over two text files and cannot see layer order, specificity, `@media` state, tailwind-merge, or
 * a class that arrives through a shared constant. This is the other half. It loads every
 * `/isolate/**` frame and asks CDP `CSS.getMatchedStylesForNode` which declarations lost, which
 * reports an inert token DIRECTLY instead of inferring it from source shape.
 *
 * ── THE SUBSET, AND THE MEASUREMENTS THAT CHOSE IT ────────────────────────────────────────────
 * Sweeping every overridden declaration is useless. Measured on 24 of the 192 frames (every 8th,
 * 6,784 elements), a wide sweep returns **276,448 overridden declarations** — overriding is how
 * CSS works, and ~2.2M findings extrapolated over the full set is not a gate, it is a landfill.
 * `check:frame-overflow` learned this at 422 findings of which 420 were `sr-only`. So the filter
 * is not a nicety; it IS the gate. Each step below is one measurement on that same sample:
 *
 *   276,448  every overridden author declaration
 *    16,892  …whose loser reads a `var(--…)`          (a literal that loses is usually intended)
 *    14,203  …declared inside `@layer components`     (where this repo's component tokens live)
 *       734  …lost to something OUTSIDE that layer    (13,469 of the 14,203 were a components-layer
 *                                                      rule beating another — `.ui-x` then
 *                                                      `.ui-x[data-size="sm"]` — which is a variant
 *                                                      doing its job, not a defect)
 *       691  …to a winner that does not read the same token (`.h-[length:var(--table-row-height)]`
 *                                                      beating `height: var(--table-row-height)`
 *                                                      still delivers the knob to the element)
 *
 * The last filter is the catalogue: the losing token must be a PUBLISHED component token
 * (`mcp/src/data/component-tokens.generated.ts`, generated from `src/tokens/components/*.css`).
 * That is the whole point — a knob a consumer was promised and does not have. A private
 * `--radius-md` losing to `rounded-[var(--radius-pill)]` inside one component is an internal
 * arrangement; `--calendar-day-radius` losing is a broken promise.
 *
 * THE ISSUE'S GUESS WAS "INLINE-AXIS SIZE DECLARATIONS THAT LOSE". The data says no. On that
 * sample, inline-axis (`width`/`inline-size` and the min/max pair) was 149 of the 691, and once
 * the presentation-attribute artefact below is removed it is a handful — while the same defect in
 * its most consequential form showed up on `border-radius` (a Calendar day button whose
 * `--calendar-day-radius` is beaten by Button's own `rounded-[var(--button-radius)]`) and on
 * `font-size`. Restricting by property would have hidden more real defects than noise. The
 * discriminator is not WHICH property lost, it is WHOSE knob lost.
 *
 * PRESENTATION ATTRIBUTES ARE THE BOTTOM OF THE CASCADE, NOT THE TOP. The first version of this
 * sweep put CDP's `attributesStyle` at the top, beside `inlineStyle`, and 133 of the 149
 * inline-axis findings were then one thing: every Lucide `<svg width="24" height="24">` reported
 * as beating `.ui-button svg { inline-size: var(--control-icon-size) }`. It does not — a
 * presentational hint loses to every author declaration. The order below is
 * `attributesStyle → matched rules (ascending) → inlineStyle`.
 *
 * COST, AND WHY THERE IS A PREFILTER. `CSS.getMatchedStylesForNode` costs ~60 ms and ~930 KB per
 * element (measured: `inherited` alone is 697 KB — every ancestor's matched rules, repeated), and
 * it does not pipeline. Asking it about all ~54,000 elements would take over an hour. So the page
 * first nominates candidates in ONE `page.evaluate`: an element is asked about only when a
 * components-layer rule with a catalogued-token declaration matches it AND some rule outside that
 * layer declares the same property on it. The browser still returns the verdict — the prefilter
 * only decides who gets asked, and it is deliberately generous (it ignores specificity, order and
 * `!important`, so it nominates far more than it reports).
 *
 * WHAT THIS STILL CANNOT SEE — read before trusting a green run:
 *   1. ONE VIEWPORT, ONE STATE. 1280px, no hover, no focus, no open overlay. A token that only
 *      loses inside a `@media` block this width does not enter, or on a popover that is closed,
 *      is invisible here. `check:frame-geometry` is the gate that walks viewports.
 *   2. ONLY WHAT THE EXAMPLES RENDER. A component whose frame never exercises a variant is not
 *      covered for that variant. `check:frame-coverage` is the gate that tracks that.
 *   3. PSEUDO-ELEMENTS ARE NOT SWEPT. `::before`/`::after` carry their own declarations and CDP
 *      returns them separately; a token inert on a pseudo-element is not reported.
 *   4. A CONSUMER'S OWN `className` IS STILL OUTSIDE THIS REPO — but only half of it is. When a
 *      docs example passes a utility that kills a token, that IS reported here (it is the same
 *      arrangement a consumer would write), which is more than the static gate can do.
 *   5. SHORTHANDS ARE JUDGED PER LONGHAND. A shorthand is reported only when every longhand it
 *      sets was overridden.
 *
 * A BASELINE, NOT A CLEAN SWEEP, and its key carries NO measurement. `check:frame-overflow`'s
 * first baseline keyed on a pixel amount and every known entry read as NEW on the first CI run,
 * because rasterisation differs per machine. Identity here is
 * `property · token · losing selector ← winning selector` — the ARRANGEMENT, and nothing about the
 * renderer, the frame or the element. One broken promise is one entry however many screens render
 * it: keyed per frame, `.ui-button { border-radius: var(--control-radius) }` losing to Button's own
 * `rounded-[var(--button-radius)]` is 100 lines and eight variants of one thing to fix in one
 * place. `seenOn` carries a frame and an element per entry so it is still locatable. A utility's
 * SCALE is a measurement too, so `.size-7` keys as `.size-*` — an example moving to `size-9` is
 * not a new defect; an arbitrary value (`.rounded-[var(--radius-pill)]`) names a token, not a
 * magnitude, and is kept whole.
 *
 * A CHAIN IS NOT A LOSS (gh#824). The first version compared the winner's declaration TEXT to the
 * loser's token, so `--form-label-font-size: var(--control-label-font-size, …)` — the whole point
 * of the "chain it" verdict — still read as inert, and the one repair the gate's own failure
 * message recommends could never clear an entry. `ROOT_CHAINS` reads the `:root` tier from the
 * CSSOM (a custom property's COMPUTED value has already substituted its `var()`s, so the chain is
 * only visible in the declaration text) and `reaches()` follows it transitively. `:root` only: a
 * scoped re-pointing is one component borrowing another's variable on its own elements, not a
 * statement about the token's documented default.
 *
 * AND `entries` IS DEBT, `intentional` IS NOT — see the comment on `intentional` below.
 *
 * Usage: node scripts/check-frame-token-wins.mjs [--update-baseline] [--report]
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";

import { DEFAULT_BASE, REPO_ROOT, resolveChromiumExecutable } from "./frame-harness.mjs";

const base = process.argv.find((a) => a.startsWith("http")) ?? DEFAULT_BASE;
const UPDATE = process.argv.includes("--update-baseline");
const REPORT = process.argv.includes("--report");
const BASELINE = path.join(REPO_ROOT, "preview/frame-token-wins.baseline.json");

/** Every docs frame, derived the way the preview derives its route id — never a hand-kept list. */
function frameRoutes() {
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return walk(full);
      return e.name.endsWith(".tsx") && !e.name.startsWith("_") ? [full] : [];
    });
  return walk(path.join(REPO_ROOT, "docs"))
    .map((f) => path.relative(path.join(REPO_ROOT, "docs"), f).replace(/\.tsx$/, ""))
    .filter((rel) => !rel.startsWith("showcase/"))
    .map((rel) => rel.replace(/\//g, "-").toLowerCase())
    .sort();
}

/**
 * The PUBLISHED component knobs, read from the generated MCP catalogue rather than re-parsed from
 * CSS, so this gate and what the MCP tells a consumer can never disagree about what a knob is.
 */
function cataloguedTokens() {
  const src = readFileSync(
    path.join(REPO_ROOT, "mcp/src/data/component-tokens.generated.ts"),
    "utf8",
  );
  return [...src.matchAll(/"name":\s*"(--[\w-]+)"/g)].map((m) => m[1]);
}

const TOKEN_RE = /var\(\s*(--[\w-]+)/g;
const tokensIn = (value) => new Set([...String(value ?? "").matchAll(TOKEN_RE)].map((m) => m[1]));

/**
 * Runs INSIDE the page. Nominates elements worth a CDP round trip and tags them, returning how
 * many. Deliberately GENEROUS: it knows nothing about specificity, order or `!important`, so
 * everything it nominates still has to be judged by the browser.
 */
const NOMINATE = (catalogued) => {
  const known = new Set(catalogued);
  const ATTR = "data-token-wins-probe";
  for (const el of document.querySelectorAll(`[${ATTR}]`)) el.removeAttribute(ATTR);

  /** The `@layer` a rule sits in, by walking its parent chain. "" when it sits in none. */
  const layerOf = (rule) => {
    const names = [];
    for (let r = rule.parentRule; r; r = r.parentRule) {
      if (r.constructor?.name === "CSSLayerBlockRule" && r.name) names.unshift(r.name);
    }
    return names.join(".");
  };

  /** Rules in `@layer components` that hand a catalogued token to a property, and everyone else. */
  const componentRules = [];
  const otherByProp = new Map();
  const flatten = (list, out) => {
    for (const r of list) {
      if (r.cssRules) flatten(r.cssRules, out);
      if (r.selectorText && r.style) out.push(r);
    }
    return out;
  };
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin sheet — nothing of ours lives there
    }
    for (const rule of flatten(rules, [])) {
      const layer = layerOf(rule);
      const props = [];
      for (let i = 0; i < rule.style.length; i += 1) props.push(rule.style[i]);
      if (layer === "components") {
        const tokened = props.filter((p) => {
          const v = rule.style.getPropertyValue(p);
          if (!v.includes("var(--")) return false;
          return [...v.matchAll(/var\(\s*(--[\w-]+)/g)].some((m) => known.has(m[1]));
        });
        if (tokened.length) componentRules.push({ sel: rule.selectorText, props: tokened });
        continue;
      }
      for (const p of props) {
        if (!otherByProp.has(p)) otherByProp.set(p, []);
        otherByProp.get(p).push(rule.selectorText);
      }
    }
  }

  let nominated = 0;
  for (const { sel, props } of componentRules) {
    let matches;
    try {
      matches = document.querySelectorAll(sel);
    } catch {
      continue; // a selector this engine will not parse standalone
    }
    for (const el of matches) {
      if (el.hasAttribute(ATTR)) continue;
      const competes = props.some((p) => {
        if (el.style.getPropertyValue(p)) return true;
        return (otherByProp.get(p) ?? []).some((s) => {
          try {
            return el.matches(s);
          } catch {
            return false;
          }
        });
      });
      if (!competes) continue;
      el.setAttribute(ATTR, "");
      nominated += 1;
    }
  }
  return nominated;
};

/**
 * The cascade, as the browser reports it. `matchedCSSRules` arrives in ASCENDING priority, so the
 * last declaration of a longhand wins — except that `!important` beats everything that is not, and
 * that a presentational hint (`attributesStyle`: `<svg width="24">`) sits BELOW every author rule.
 */
function losers(matched) {
  const streams = [];
  if (matched.attributesStyle) streams.push({ style: matched.attributesStyle, rule: null });
  for (const m of matched.matchedCSSRules ?? []) {
    if (m.rule.origin === "user-agent") continue;
    streams.push({ style: m.rule.style, rule: m.rule });
  }
  if (matched.inlineStyle) streams.push({ style: matched.inlineStyle, rule: null });

  const active = new Map();
  const losses = [];
  for (const s of streams) {
    for (const p of s.style?.cssProperties ?? []) {
      if (p.disabled) continue;
      const longhands = (p.longhandProperties ?? []).map((l) => l.name);
      const names = longhands.length ? longhands : [p.name];
      const ref = {
        value: p.value,
        important: !!p.important,
        selector: s.rule?.selectorList?.text ?? "(element style)",
        layer: (s.rule?.layers ?? []).map((l) => l.text).join(".") || "",
      };
      for (const n of names) {
        const prev = active.get(n);
        if (prev && prev.important && !ref.important) {
          losses.push({ prop: n, loser: ref, winner: prev });
          continue;
        }
        if (prev) losses.push({ prop: n, loser: prev, winner: ref });
        active.set(n, ref);
      }
    }
  }
  return losses;
}

/**
 * Runs INSIDE the page. The `:root` token tier as DECLARED, `--token` -> its declaration text.
 *
 * Not `getComputedStyle`: a custom property's computed value has already had its `var()`s
 * substituted, so `--form-label-font-size` computes to `.875rem` and the fact that it READS
 * `--control-label-font-size` is gone. The CSSOM still has the text.
 *
 * `:root` only, deliberately. A chain is a statement about a token's documented DEFAULT, which is
 * what the tier files declare and what the MCP hands a consumer. A scoped re-pointing
 * (`.ui-conversations-row { --button-radius: var(--conversations-item-radius) }`) is one
 * component borrowing another's variable on its own elements, and must not forgive that pair
 * everywhere else in the library.
 */
const ROOT_CHAINS = () => {
  const out = {};
  const flatten = (list, acc) => {
    for (const r of list) {
      if (r.cssRules) flatten(r.cssRules, acc);
      if (r.selectorText && r.style) acc.push(r);
    }
    return acc;
  };
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of flatten(rules, [])) {
      if (!/(^|[\s,])(:root|html)\b/.test(rule.selectorText)) continue;
      for (let i = 0; i < rule.style.length; i += 1) {
        const p = rule.style[i];
        if (!p.startsWith("--")) continue;
        const v = rule.style.getPropertyValue(p);
        if (v.includes("var(--")) out[p] = v; // later declaration wins, same as the cascade
      }
    }
  }
  return out;
};

/**
 * Every token the winner's value reaches, following `:root` chains. A winner that reads
 * `--form-label-font-size`, declared `var(--control-label-font-size, …)`, still delivers
 * `--control-label-font-size` to the element — the knob arrives, one hop later.
 */
function reaches(value, chains) {
  const seen = new Set();
  const queue = [...tokensIn(value)];
  while (queue.length) {
    const t = queue.pop();
    if (seen.has(t)) continue;
    seen.add(t);
    for (const next of tokensIn(chains[t])) queue.push(next);
  }
  return seen;
}

/** The subset that is a broken promise — see the header for the measurement behind each clause. */
function findings(losses, known, chains) {
  const out = [];
  for (const { prop, loser, winner } of losses) {
    if (loser.layer !== "components") continue;
    if (winner.layer === "components") continue;
    const lost = [...tokensIn(loser.value)].filter((t) => known.has(t));
    if (!lost.length) continue;
    const kept = reaches(winner.value, chains);
    const dead = lost.filter((t) => !kept.has(t));
    if (!dead.length) continue;
    out.push({ prop, token: dead[0], loser: loser.selector, winner: winner.selector });
  }
  return out;
}

async function main() {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch (e) {
    if (process.env.CI) throw e;
    console.warn(
      "⚠ check:frame-token-wins skipped — playwright not installed (browser-only gate).",
    );
    return;
  }
  const { ensurePreviewServer } = await import("./frame-harness.mjs");
  let stopServer;
  try {
    stopServer = await ensurePreviewServer(base);
  } catch (e) {
    if (process.env.CI) throw e;
    console.warn(`⚠ check:frame-token-wins skipped — ${e.message}.`);
    return;
  }

  const catalogue = cataloguedTokens();
  const known = new Set(catalogue);
  const exec = resolveChromiumExecutable();
  const browser = await chromium.launch(exec && existsSync(exec) ? { executablePath: exec } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");

  const routes = frameRoutes();
  const found = {};
  let missing = 0;
  let nominated = 0;
  /* Read once: the token tier is the same stylesheet on every frame. */
  let chains = {};

  for (const id of routes) {
    try {
      await page.goto(`${base}/isolate/${id}`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(250);
      /* A route that does not resolve renders a four-word "not found" card, which has no tokens to
       * lose and would be reported as clean — the way check:contrast once swept two showcases that
       * were never there. */
      if (await page.evaluate(() => /Preview not found/.test(document.body.innerText))) {
        missing += 1;
        continue;
      }
      if (!Object.keys(chains).length) chains = await page.evaluate(ROOT_CHAINS);
      const count = await page.evaluate(NOMINATE, catalogue);
      nominated += count;
      if (!count) continue;

      const { root } = await cdp.send("DOM.getDocument", { depth: 1 });
      const { nodeIds } = await cdp.send("DOM.querySelectorAll", {
        nodeId: root.nodeId,
        selector: "[data-token-wins-probe]",
      });
      const hits = [];
      for (const nodeId of nodeIds) {
        let matched;
        try {
          matched = await cdp.send("CSS.getMatchedStylesForNode", { nodeId });
        } catch {
          continue;
        }
        const dead = findings(losers(matched), known, chains);
        if (!dead.length) continue;
        let el = "?";
        try {
          const { node } = await cdp.send("DOM.describeNode", { nodeId });
          const attrs = node.attributes ?? [];
          const ci = attrs.indexOf("class");
          const classes = ci >= 0 ? attrs[ci + 1].split(/\s+/) : [];
          /* The element's OWN identity — its `ui-*`/`sb-*` classes, never the utility classes.
           * Those belong to the winning selector, which the key already carries, and a docs
           * example re-ordering its `className` must not read as a new finding. */
          const owned = classes.filter((c) => /^(ui|sb)-/.test(c)).sort();
          el = node.localName + (owned.length ? `.${owned.join(".")}` : "");
        } catch {
          /* node went away between the query and the describe — keep the finding, lose the name */
        }
        for (const d of dead) hits.push({ el, ...d });
      }
      if (hits.length) found[id] = hits;
    } catch (e) {
      console.warn(`  ! ${id}: ${e.message.slice(0, 80)}`);
    }
  }
  await browser.close();
  await stopServer?.();

  /* THE FRAME IS NOT PART OF THE IDENTITY, AND NEITHER IS THE ELEMENT.
   *
   * `.ui-button { border-radius: var(--control-radius) }` losing to Button's own
   * `rounded-[var(--button-radius)]` is ONE broken promise. Keyed per frame it is 100 of them, and
   * per element-and-variant it is eight more on top of that (`--ghost`, `--outline`, `--sm`, …) —
   * 366 lines for what a person has to fix in one place. The ARRANGEMENT is the fact:
   * which property, whose knob, which rule declared it, which declaration took it away. The frame
   * and the element are carried beside the key as `seenOn`, so a finding is still locatable.
   *
   * It also keeps the baseline stable against the docs: adding an example that renders an already
   * known arrangement must not read as a NEW defect, and deleting the last example that rendered
   * one must not silently retire the entry as "fixed" — `seenOn` moving is visible in the diff. */
  /* …AND NEITHER IS THE UTILITY'S MAGNITUDE. `.size-7` is a measurement wearing a class name: an
   * Avatar example that changes to `size-9`, or a CardTitle that goes from `text-sm` to
   * `text-base`, is the SAME fact — that utility family takes this token off this element — and
   * keying on the number turned one arrangement into seven. A plain `.<family>-<scale>` utility is
   * therefore keyed as `.<family>-*`. An ARBITRARY value is left alone, because a bracket names a
   * token rather than a magnitude, and `rounded-[var(--button-radius)]` vs
   * `rounded-[var(--radius-pill)]` really are two different things taking the knob away. */
  const family = (sel) =>
    sel
      .split(",")
      .map((s) => s.trim().replace(/^\.([a-z][a-z0-9-]*)-([^\\\s.-]+)$/, ".$1-*"))
      .join(", ");
  const keyOf = (h) =>
    `${h.prop} · ${h.token} · ${h.loser} ← ${family(h.winner)}`.replace(/\s+/g, " ");
  const seenOn = {};
  for (const [id, hits] of Object.entries(found)) {
    for (const h of hits) {
      const k = keyOf(h);
      const where = `${id} · ${h.el}`;
      if (!seenOn[k] || where < seenOn[k]) seenOn[k] = where;
    }
  }
  /* INTENTIONAL — the third verdict, and the only permanent one.
   *
   * `entries` is DEBT: every line is a defect someone still owes, and it may only shrink. But
   * some of what this gate sees is a component overriding another's knob ON PURPOSE through a
   * second documented token, and that arrangement will never be "fixed" — left in `entries` it
   * would be a debt nobody can ever pay, and stripped out silently it could come back as a real
   * defect unnoticed. `intentional` is keyed exactly like `entries` and carries the REASON, so
   * the gate keeps watching the arrangement while the list of owed work stays honest. Adding a
   * line here is a judgement a human writes down; the script never invents one. */
  const intentional = existsSync(BASELINE)
    ? (JSON.parse(readFileSync(BASELINE, "utf8")).intentional ?? {})
    : {};
  const flat = Object.keys(seenOn)
    .filter((k) => !(k in intentional))
    .sort();

  if (REPORT) {
    for (const f of flat) console.log(`${f}\n    first seen: ${seenOn[f]}`);
    for (const [k, why] of Object.entries(intentional))
      console.log(`${k}\n    INTENTIONAL: ${why}`);
    console.log(
      `\n${routes.length} frame(s), ${nominated} element(s) asked, ${flat.length} inert token(s).`,
    );
    return;
  }

  if (UPDATE) {
    /* PRESERVE WHAT A HUMAN WROTE — `note` and `tracked` survive regeneration, so whoever fixes an
     * entry does not have to restore the issue link by hand (check:frame-overflow, same shape). */
    const existing = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : {};
    writeFileSync(
      BASELINE,
      JSON.stringify(
        {
          note:
            existing.note ??
            "Catalogued component tokens that the browser throws away — declared in @layer " +
              "components, overridden on a real element by something outside it. Every entry is a " +
              "TRACKED defect, not accepted debt. The list may only SHRINK: the gate fails on " +
              "anything new. Keyed on the ARRANGEMENT (property/token/losing rule/winning rule) " +
              "and never on a frame, an element or a measured value — one broken promise is one " +
              "entry however many screens render it. `seenOn` is where to go and look.",
          ...(existing.tracked ? { tracked: existing.tracked } : {}),
          count: flat.length,
          entries: flat,
          ...(Object.keys(intentional).length ? { intentional } : {}),
          seenOn,
        },
        null,
        2,
      ) + "\n",
    );
    console.log(
      `✓ baseline written — ${flat.length} inert token(s) across ${routes.length} frames.`,
    );
    return;
  }

  const prior = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : { entries: [] };
  const knownEntries = new Set(prior.entries);
  const added = flat.filter((f) => !knownEntries.has(f));
  const fixed = prior.entries.filter((f) => !flat.includes(f));

  if (added.length) {
    console.error(`✗ check:frame-token-wins — ${added.length} NEW inert component token(s):\n`);
    for (const a of added) console.error(`  ${a}\n      seen on: ${seenOn[a]}`);
    console.error(
      `\nThree ways out, and one of them has to be chosen (gh#824): DROP the losing declaration ` +
        `(and the token from the catalogue, if that was its only use); CHAIN it, by making the ` +
        `winning token's own ':root' default read the losing one — only free when both resolve ` +
        `alike today, so measure both before you do; or DECLARE IT INTENTIONAL, writing the ` +
        `reason beside the declaration and the same reason into the baseline's 'intentional' ` +
        `map. ${routes.length} frames swept, ${nominated} element(s) asked, ${missing} route(s) did not resolve.`,
    );
    process.exit(1);
  }
  console.log(
    `✓ check:frame-token-wins — ${routes.length} frame(s) swept, ${nominated} element(s) asked, ` +
      `${flat.length} known inert token(s)` +
      `${fixed.length ? `, ${fixed.length} FIXED since the baseline (run --update-baseline to bank it)` : ""}.`,
  );
}

await main();
