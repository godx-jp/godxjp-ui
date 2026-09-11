#!/usr/bin/env node
/**
 * check:focus-ring-paint — does the keyboard-focus mark reach a PIXEL, on the controls that ship
 * the mark, with the switch on; and does it vanish completely with the switch off.
 *
 * WHY A BROWSER GATE AND NOT A UNIT TEST. Every static check this repo has on the focus ring
 * checks what focus-ring.css SAYS. The defect this gate was written for was a rule that said the
 * right thing and painted nothing: `.ui-input` was in the mark's selector list, and `Input` also
 * shipped Tailwind's `outline-none`. `@layer utilities` beats `@layer components` whatever the
 * specificity, so the mark lost silently — no build error, no red test, no audit finding. Measured
 * on `/isolate/data-entry-input` with `<html data-focus-outline="on">`: a focused Button reported
 * `outline: 2px solid rgb(0,113,189)` while a focused Input on the same page reported
 * `outline-style: none`. Only a browser can see that.
 *
 * THREE MEASUREMENT TRAPS THIS SCRIPT IS BUILT AROUND, each of which has produced a false report
 * in this repo's history:
 *
 *  1. A KEY THAT NEVER LANDED READS AS "NO RING". The probe element is tagged with
 *     `data-focus-ring-probe` and Tab is pressed until `document.activeElement` resolves to THAT
 *     element (a control drawn as a `<label>` around a visually hidden `<input>` counts when the
 *     focused input is inside the probe). If it is never reached the gate FAILS with "never
 *     focused" — it never reports a measurement it did not take.
 *  2. THE MARK HAS TWO FORMS. An older build of this package painted the ring as a `box-shadow`
 *     and set `outline: none` ON PURPOSE; reading `outlineWidth` there and concluding "no ring"
 *     is a bug report about a bug that does not exist. So this gate measures BOTH properties,
 *     names the form it found, and requires the control under test to use the SAME form as the
 *     reference control on the same page — not a hard-coded property.
 *  3. A TRANSPARENT OUTLINE IS NOT A MARK. `focus:outline-hidden` paints
 *     `outline: 2px solid transparent`; a gate that samples only the width reports 2px and passes.
 *     Contrast is therefore measured, not width alone.
 *
 * WHAT IS ASSERTED, per control × theme (light, dark) × switch (on, off):
 *   ON   · the mark paints (outline width > 0 with a visible colour, or a visible focus shadow)
 *        · its form matches the reference control's form on the same build
 *        · the mark clears WCAG 2.2 SC 1.4.11 (3:1) against THE SURFACE IT IS DRAWN ON — the page
 *          or panel outside the control, which is where an `outline` is painted
 *
 * BOTH neighbours are measured and both are printed, but only the outer one is a failure, and the
 * reason is a real control rather than a shortcut: a CHECKED Checkbox is filled with the brand,
 * and the focus hue is a sibling of the brand, so the mark measures 1.00:1 where it touches the
 * box it surrounds and 5.04:1 against the page around it — visible, and deliberately so. Asserting
 * on the inner neighbour would fail that shipped design while proving nothing about perceivability.
 * The bar used here is the one this package already states in focus-ring.css and holds in
 * src/tokens/__tests__/focus-ring-contrast.test.ts: the mark against the surfaces it sits on.
 *   OFF  · `outline-width` resolves to `0px`, and the focused box-shadow is byte-identical to the
 *          RESTING box-shadow of the same element — the switch removes the mark without taking the
 *          control's own elevation with it (the defect recorded in focus-ring.css's HALO note)
 *
 * Usage: node scripts/check-focus-ring-paint.mjs [http://localhost:6008]
 */
const base = process.argv[2]?.startsWith("http") ? process.argv[2] : undefined;

/**
 * The controls under test. `reference` is the one control that has never carried an
 * outline-suppressing utility, so it defines "the mark this build paints"; everything else is held
 * to it.
 *
 * @type {{route: string, selector: string, label: string, reference?: boolean}[]}
 */
const TARGETS = [
  {
    route: "/isolate/general-button-index",
    selector: ".ui-button",
    label: "Button (reference control)",
    reference: true,
  },
  // gh — the consumer-blocking one: every field in the package composes this class.
  { route: "/isolate/data-entry-input", selector: ".ui-input", label: "Input" },
  { route: "/isolate/data-entry-textarea", selector: ".ui-control-multiline", label: "Textarea" },
  { route: "/isolate/data-entry-select", selector: ".ui-control-trigger", label: "Select trigger" },
  // The Select's 「選択をクリア」 — a separate tab stop that fell back to Chrome's `outline: auto`.
  {
    route: "/isolate/data-entry-select",
    selector: ".ui-control-affix-action",
    label: "Select clear affix",
  },
  // Drawn as a <label> around a hidden <input>: the mark belongs on the label, and `:focus-visible`
  // never matches it. Both react-aria controls are here because the hook that saves them
  // (`[data-focus-visible]`) is a separate selector from the one that saves everything else.
  { route: "/isolate/data-entry-checkbox", selector: ".ui-checkbox", label: "Checkbox" },
  { route: "/isolate/data-entry-radio-group", selector: ".ui-radio", label: "Radio" },
];

/** SC 1.4.11 — a non-text indicator needs 3:1 against what is next to it. */
const MIN_CONTRAST = 3;

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

const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/** Composite a possibly translucent mark over the surface it is drawn on. */
const over = (fg, bg) => (fg.a >= 1 ? fg.rgb : fg.rgb.map((c, i) => c * fg.a + bg[i] * (1 - fg.a)));

/**
 * Runs IN THE PAGE. Reads the probe's resting paint, presses nothing — the Tab loop lives
 * outside — and is called twice per case (before and after focus) so the OFF assertion can compare
 * the two.
 */
function readProbe() {
  const el = document.querySelector("[data-focus-ring-probe]");
  if (!el) return null;
  const cs = getComputedStyle(el);
  const parse = (c) => {
    const m = String(c).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1]
      .split(/[,\s/]+/)
      .filter(Boolean)
      .map(parseFloat);
    return { rgb: [p[0], p[1], p[2]], a: p[3] === undefined ? 1 : p[3] };
  };
  const surface = (node) => {
    for (let n = node; n; n = n.parentElement) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0.5) return bg.rgb;
    }
    return [255, 255, 255];
  };
  return {
    outlineWidth: parseFloat(cs.outlineWidth) || 0,
    outlineStyle: cs.outlineStyle,
    outlineOffset: cs.outlineOffset,
    outlineColor: parse(cs.outlineColor),
    boxShadow: cs.boxShadow,
    inner: surface(el),
    outer: surface(el.parentElement),
    focused: el.contains(document.activeElement) || el === document.activeElement,
  };
}

/** A `box-shadow` string with at least one non-transparent layer. */
function shadowPaints(value) {
  if (!value || value === "none") return false;
  return [...value.matchAll(/rgba?\(([^)]+)\)/g)].some((m) => {
    const p = m[1]
      .split(/[,\s/]+/)
      .filter(Boolean)
      .map(parseFloat);
    return (p[3] === undefined ? 1 : p[3]) > 0.02;
  });
}

async function measure(page, { route, selector }, { dark, on }) {
  const url = `${route}${dark ? (route.includes("?") ? "&" : "?") + "theme=dark" : ""}`;
  // `domcontentloaded` + the selector, never `networkidle`: the preview is a Vite dev server and
  // its HMR socket can keep the idle window from ever opening.
  await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded" });
  try {
    await page.waitForSelector(selector, { timeout: 15000, state: "attached" });
  } catch {
    return { error: `no element matches ${selector} after 15s — did the route render?` };
  }

  const resolved = await page.evaluate(
    ([sel, wantDark, wantOn]) => {
      const root = document.documentElement;
      if (wantOn) root.setAttribute("data-focus-outline", "on");
      else root.removeAttribute("data-focus-outline");
      // The consumer scenario this was reported from: the switch on AND the weight raised.
      root.style.setProperty("--focus-ring-weight", "2px");
      if (wantDark && root.dataset.theme !== "dark") return { error: "theme=dark was ignored" };
      const el = document.querySelector(sel);
      if (!el) return { error: `no element matches ${sel}` };
      el.setAttribute("data-focus-ring-probe", "");
      return { ok: true };
    },
    [selector, dark, on],
  );
  if (resolved.error) return { error: resolved.error };

  const resting = await page.evaluate(readProbe);

  // A REAL Tab press, repeated until the probe itself holds focus. `activeElement` is read back
  // every time, so "the key never reached the page" can never be mistaken for "no ring".
  let reached = false;
  for (let i = 0; i < 60 && !reached; i++) {
    await page.keyboard.press("Tab");
    reached = await page.evaluate(() => {
      const el = document.querySelector("[data-focus-ring-probe]");
      return !!el && (el === document.activeElement || el.contains(document.activeElement));
    });
  }
  if (!reached) return { error: `never focused by Tab (60 presses) — ${selector}` };

  // SETTLE BEFORE READING. A control transitions `box-shadow` over 150ms, so a read taken on the
  // frame after the key press returns an interpolated halo — measured here as
  // `rgba(0,15,19,0.043) 0 0.968px 0.968px 0.063px`, a frame of an animation and not a state of
  // the UI. Sampling inside that ramp made this gate's shadow-form branch flip between runs on
  // one unchanged build. The outline itself is declared with `transition: outline 0s`, so only
  // the halo needs the wait.
  await page.waitForTimeout(300);
  const focused = await page.evaluate(readProbe);
  return { resting, focused };
}

async function main() {
  const { chromium } = await import("playwright");
  const { ensurePreviewServer, DEFAULT_BASE } = await import("./frame-harness.mjs");
  globalThis.BASE = base ?? DEFAULT_BASE;
  const cleanup = await ensurePreviewServer(BASE);
  const execPath = (await import("node:fs")).existsSync(EXEC) ? EXEC : undefined;
  const browser = await chromium.launch(execPath ? { executablePath: execPath } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });

  const failures = [];
  /** @type {Record<string, "outline" | "shadow">} */
  const referenceForm = {};

  for (const target of TARGETS) {
    for (const dark of [false, true]) {
      const theme = dark ? "dark " : "light";

      // ── SWITCH ON ────────────────────────────────────────────────────────────────────────
      const on = await measure(page, target, { dark, on: true });
      if (on.error) {
        failures.push(`✗ ${target.label} · ${theme} · on — ${on.error}`);
        continue;
      }
      const mark = on.focused;
      const outlinePaints =
        mark.outlineWidth > 0 &&
        mark.outlineStyle !== "none" &&
        !!mark.outlineColor &&
        mark.outlineColor.a > 0.02;
      const haloPaints = shadowPaints(mark.boxShadow) && mark.boxShadow !== on.resting.boxShadow;
      const form = outlinePaints ? "outline" : haloPaints ? "shadow" : null;

      if (!form) {
        failures.push(
          `✗ ${target.label} · ${theme} · switch ON — NO MARK. ` +
            `outline: ${mark.outlineWidth}px ${mark.outlineStyle}, box-shadow unchanged from rest. ` +
            `A utility in @layer utilities (outline-none / outline-hidden) beats the ring rule.`,
        );
        continue;
      }

      if (target.reference) referenceForm[theme] = form;
      else if (referenceForm[theme] && form !== referenceForm[theme]) {
        failures.push(
          `✗ ${target.label} · ${theme} · switch ON — paints the ${form} form while the reference ` +
            `control paints the ${referenceForm[theme]} form. One build, one mark.`,
        );
      }

      if (outlinePaints) {
        const fill = ratio(over(mark.outlineColor, mark.inner), mark.inner);
        const surface = ratio(over(mark.outlineColor, mark.outer), mark.outer);
        const line =
          `${target.label} · ${theme} · ON — outline ${mark.outlineWidth}px ${mark.outlineStyle} ` +
          `offset ${mark.outlineOffset}, ${surface.toFixed(2)}:1 vs surface ` +
          `(${fill.toFixed(2)}:1 vs the control's own fill)`;
        if (surface < MIN_CONTRAST - 0.01) {
          failures.push(`✗ ${line} — below WCAG 2.2 SC 1.4.11's ${MIN_CONTRAST}:1`);
        } else {
          console.log(`  ✓ ${line}`);
        }
      } else {
        console.log(`  ✓ ${target.label} · ${theme} · ON — shadow form: ${mark.boxShadow}`);
      }

      // ── SWITCH OFF ───────────────────────────────────────────────────────────────────────
      const off = await measure(page, target, { dark, on: false });
      if (off.error) {
        failures.push(`✗ ${target.label} · ${theme} · off — ${off.error}`);
        continue;
      }
      if (off.focused.outlineWidth > 0) {
        failures.push(
          `✗ ${target.label} · ${theme} · switch OFF — still ${off.focused.outlineWidth}px of ` +
            `outline on focus. The switch ships OFF; nothing may paint.`,
        );
      } else if (off.focused.boxShadow !== off.resting.boxShadow) {
        failures.push(
          `✗ ${target.label} · ${theme} · switch OFF — focus CHANGED the box-shadow ` +
            `(rest "${off.resting.boxShadow}" → focus "${off.focused.boxShadow}"). With the switch ` +
            `off a control must keep its own elevation through focus, unchanged.`,
        );
      } else {
        console.log(`  ✓ ${target.label} · ${theme} · OFF — outline 0px, resting shadow unchanged`);
      }
    }
  }

  await browser.close();
  cleanup();

  if (failures.length) {
    console.error(`\n✗ check:focus-ring-paint — ${failures.length} failure(s):`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(
    `\n✓ check:focus-ring-paint — ${TARGETS.length} controls × light/dark × on/off: the mark ` +
      `paints and clears ${MIN_CONTRAST}:1 with the switch on, and nothing paints with it off.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
