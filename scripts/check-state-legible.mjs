#!/usr/bin/env node
/**
 * check:state-legible — TWO ELEMENTS IN DIFFERENT STATES MUST NOT PAINT THE SAME.
 *
 * WHY THIS IS ITS OWN GATE (gh#615, gh#622). `check:choice-hit-target` grew this assertion first,
 * but it can only ever ask it of the four surfaces it already drives, because its other six
 * assertions need a real `<input>` inside the painted box. `Tabs`, `Tree`, `ToggleGroup`, `Steps`,
 * `Pagination` and a selected `DataTable` row have no input and were therefore never measured on
 * this axis at all. "Both states must be distinguishable" is a WCAG 1.4.1 question, independent of
 * "the painted box is the hit target", so it gets its own gate and the full surface list.
 *
 * WHAT gh#615 COST, and why a static check could not have caught it. `Radio` rendered its dot
 * unconditionally; `data-state="checked" | "unchecked"` was right there on the same `<label>` and
 * no CSS rule read it. Every option looked chosen. The user reported the control as "not
 * clickable" — it WAS clickable, the value changed on every click and the screen did not, and at
 * the keyboard those two are one experience. Measured before the fix: 4 of 4 unchecked radios
 * painted a 7.2px dot at rgb(0, 113, 189), pixel-identical to the 3 checked ones.
 *
 * NOBODY REVIEWS THIS. A screenshot of one selected radio is perfectly correct; the defect exists
 * only BETWEEN two states, which is what this gate compares and what no single-state snapshot can.
 *
 * HOW IT MEASURES, and the three ways getting this wrong produced false accusations first:
 *
 *   1. TRANSITIONS ARE KILLED before reading. `Switch` tweens its thumb, so a control read 120ms
 *      after a flip still paints the state it is LEAVING. Two earlier drafts failed `Switch` twice
 *      for exactly that. No toggling happens here at all — the page is read as it renders.
 *   2. ONE EFFECTIVE STATE PER ELEMENT, not one per attribute. `ToggleGroup` items carry
 *      `aria-checked` in one variant and `aria-pressed` in another; pairing per-attribute compared
 *      a checked item against one that simply uses the other convention and called `.ui-toggle`
 *      broken eight times over.
 *   3. THE WHOLE SUBTREE is signed, not a named indicator. A comma list in `querySelector` returns
 *      DOCUMENT order, not list order, so on a Radio it returned the `.ui-choice-indicator` WRAPPER
 *      — whose paint never changes — and reported a broken control as fine.
 *
 * A pair must also be the SAME PAINTED SIZE, so a size variant is never mistaken for a state.
 */
import { ensurePreviewServer } from "./frame-harness.mjs";
import { chromium } from "playwright";

const port = Number(process.env.PREVIEW_PORT) || 6033;
const base = `http://localhost:${port}`;

/**
 * Every catalogue frame that renders a selection state. Listed rather than crawled: a frame that
 * stops rendering both states must fail as a COVERAGE loss, and a crawl would simply stop looking.
 */
const FRAMES = [
  "data-entry-checkbox",
  "data-entry-radio-group",
  "data-entry-switch",
  "data-entry-segmented",
  "data-entry-toggle-group",
  "data-entry-rating",
  "data-entry-calendar",
  "navigation-tabs",
  "navigation-steps",
  "navigation-pagination",
  "data-display-tree",
  "data-display-data-table-index",
  "data-display-accordion",
  "layout-sidebar",
];

/** Frames that must produce at least one comparable pair, or the gate is measuring nothing. */
const MIN_PAIRS = 1;

const stopServer = await ensurePreviewServer(base);
const failures = [];
const summary = [];
let browser;

/** Injected on every frame: a tween mid-flight is the single biggest source of a false reading. */
const NO_MOTION = "*,*::before,*::after{transition:none!important;animation:none!important}";

try {
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  for (const frame of FRAMES) {
    await page.goto(`${base}/isolate/${frame}`, { waitUntil: "domcontentloaded" });
    await page.addStyleTag({ content: NO_MOTION });
    await page.waitForTimeout(500);

    const rows = await page.evaluate(() => {
      /** The attributes this library uses to say "this one is the chosen one". */
      const ATTRS = [
        "data-state",
        "aria-selected",
        "aria-checked",
        "aria-current",
        "aria-pressed",
        "data-active",
        "data-selected",
      ];

      const paint = (el) => {
        const cs = getComputedStyle(el);
        return [
          cs.backgroundColor,
          cs.borderColor,
          cs.color,
          cs.opacity,
          cs.visibility,
          cs.fontWeight,
          cs.textDecorationLine,
          cs.boxShadow,
          cs.transform,
        ].join("|");
      };

      // The box AND everything it paints inside. A control may answer with either — Checkbox fills
      // its box, Radio shows a dot, Switch slides a thumb, a Tab underlines itself — so signing
      // only the box would miss three of those. The real <input> is skipped: hidden in both states.
      const signature = (el) =>
        [el, ...el.querySelectorAll("*")]
          .filter((e) => e.tagName !== "INPUT")
          .map(paint)
          .join("  ::  ");

      const identity = (el) => {
        const cls = [...el.classList].find((c) => c.startsWith("ui-"));
        const slot = el.getAttribute("data-slot");
        return cls ? `.${cls}` : slot ? `[data-slot="${slot}"]` : el.tagName.toLowerCase();
      };

      /**
       * ONE state per element, from whichever attribute it actually uses. Never one bucket per
       * attribute: `ToggleGroup` carries `aria-checked` in one variant and `aria-pressed` in
       * another, and pairing per-attribute compares a checked item against one that simply speaks
       * the other convention.
       */
      const stateOf = (el) => {
        for (const a of ATTRS) {
          const v = el.getAttribute(a);
          if (v) return `${a}=${v}`;
        }
        return "(none)";
      };

      // Only compare within a family that actually expresses state SOMEWHERE on this page —
      // otherwise every plain <div> pairs with itself at "(none)".
      const stateful = new Set();
      for (const el of document.querySelectorAll("*")) {
        if (stateOf(el) !== "(none)") stateful.add(identity(el));
      }

      const buckets = new Map();
      for (const el of document.querySelectorAll("*")) {
        const id = identity(el);
        if (!stateful.has(id)) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) continue;
        const key = `${id} @ ${Math.round(r.width)}x${Math.round(r.height)}`;
        const bucket = buckets.get(key) ?? new Map();
        const state = stateOf(el);
        if (!bucket.has(state)) bucket.set(state, signature(el));
        buckets.set(key, bucket);
      }

      const out = [];
      for (const [key, states] of buckets) {
        if (states.size < 2) continue;
        const entries = [...states];
        const distinct = new Set(entries.map(([, sig]) => sig)).size;
        out.push({
          key,
          states: entries.map(([s]) => s).join(" vs "),
          same: distinct === 1,
          signature: entries[0][1].slice(0, 160),
        });
      }
      return out;
    });

    const identical = rows.filter((r) => r.same);
    summary.push({ frame, pairs: rows.length, identical: identical.length });

    if (rows.length < MIN_PAIRS) {
      failures.push(
        `${frame}: no two same-sized elements in DIFFERENT states render on this frame, so ` +
          `"the states look different" could not be measured at all. That is a coverage loss, not ` +
          `a pass (gh#622).`,
      );
      continue;
    }
    for (const r of identical) {
      failures.push(
        `${frame}: ${r.key} renders IDENTICALLY across ${r.states} — ${r.signature}… ` +
          `The value changes and the screen does not, and users read that as "not clickable" (gh#615).`,
      );
    }
    console.log(
      `  ${frame.padEnd(32)} ${String(rows.length).padStart(3)} pair(s)  ${identical.length ? `✗ ${identical.length} identical` : "✓"}`,
    );
  }
} finally {
  await browser?.close();
  await stopServer?.();
}

if (failures.length) {
  console.error(`\n✗ check:state-legible — ${failures.length} failure(s):\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    `\nA state that reaches the DOM and no rule reads is a state the user cannot see. gh#615 shipped ` +
      `that way for three releases: every radio looked chosen, and the reporter called the control broken.`,
  );
  process.exit(1);
}

const pairs = summary.reduce((n, s) => n + s.pairs, 0);
console.log(
  `\n✓ check:state-legible — ${pairs} state pair(s) across ${summary.length} frames, all distinguishable.`,
);
