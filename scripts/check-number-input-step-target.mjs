#!/usr/bin/env node
/**
 * NumberInput: coarse pointers use two side-by-side 44px targets (#1371).
 * Fine pointers retain stacked 24×15 paint in the 36px band (33.10), with outward
 * 24px hit areas. Check rectangle intersection on BOTH axes, hit testing, and adjacent
 * label/helper/input ownership. Date range affixes retain the 24px hit floor.
 */
import { ensurePreviewServer } from "./frame-harness.mjs";
import { chromium } from "playwright";

const port = Number(process.env.PREVIEW_PORT) || 6018;
const base = `http://localhost:${port}`;
const stopServer = await ensurePreviewServer(base);

/** SC 2.5.8's minimum, in CSS px. */
const MIN = 24;
/** The desktop geometry this fix must not disturb. */
const FINE_PAINT = { width: 24, height: 15 };

const failures = [];
let browser;

try {
  browser = await chromium.launch();

  for (const coarse of [true, false])
    for (const dir of ["ltr", "rtl"]) {
      const context = await browser.newContext({
        viewport: { width: 393, height: 850 },
        hasTouch: coarse,
        isMobile: coarse,
      });
      const page = await context.newPage();
      await page.goto(`${base}/isolate/data-entry-number-input`, { waitUntil: "domcontentloaded" });
      await page.locator(".ui-number-input-step").first().waitFor({ timeout: 30000 });
      await page.evaluate((dir) => {
        document.documentElement.dir = dir;
      }, dir);
      await page.waitForTimeout(300);

      const measured = await page.evaluate(() => {
        const seen = new Map();
        for (const root of document.querySelectorAll(".ui-number-input")) {
          const size = root.getAttribute("data-size") ?? "(default)";
          if (seen.has(size)) continue;
          const up = root.querySelector(".ui-number-input-step-up");
          const down = root.querySelector(".ui-number-input-step-down");
          if (!up || !down) continue;
          root.scrollIntoView({ block: "center", behavior: "instant" });
          const u = up.getBoundingClientRect();
          const d = down.getBoundingClientRect();
          seen.set(size, {
            size,
            ownsPaint: [up, down].every((button) => {
              const r = button.getBoundingClientRect();
              return [
                [r.left + 2, r.top + 2],
                [r.right - 2, r.bottom - 2],
                [(r.left + r.right) / 2, (r.top + r.bottom) / 2],
              ].every(([x, y]) => {
                const hit = document.elementFromPoint(x, y);
                return hit === button || button.contains(hit);
              });
            }),
            width: +Math.min(u.width, d.width).toFixed(2),
            height: +Math.min(u.height, d.height).toFixed(2),
            overlap: +Math.min(
              Math.min(u.right, d.right) - Math.max(u.left, d.left),
              Math.min(u.bottom, d.bottom) - Math.max(u.top, d.top),
            ).toFixed(2),
            centres: +Math.hypot(
              (d.left + d.right - u.left - u.right) / 2,
              (d.top + d.bottom - u.top - u.bottom) / 2,
            ).toFixed(2),
            field: +(
              root.querySelector("[data-slot=number-input-field]")?.getBoundingClientRect()
                .height ?? 0
            ).toFixed(2),
          });
        }
        return { coarse: matchMedia("(pointer: coarse)").matches, sizes: [...seen.values()] };
      });

      if (measured.coarse !== coarse) {
        failures.push(
          `✗ asked for pointer:coarse=${coarse} and the page reports ${measured.coarse} — the ` +
            `measurements below would be about the other build entirely.`,
        );
        await context.close();
        continue;
      }
      if (measured.sizes.length < 4) {
        failures.push(
          `✗ only ${measured.sizes.length} size tiers found on the frame; expected 4+.`,
        );
      }

      console.log(`\n  pointer:coarse = ${coarse}, dir=${dir}`);
      for (const m of measured.sizes) {
        const line = `size=${m.size.padEnd(10)} stepper ${m.width}×${m.height}  centres ${m.centres}px  field ${m.field}px`;

        if (!m.ownsPaint) {
          failures.push(`✗ ${line} — stepper paint is not reachable by pointer hit testing.`);
        }
        if (m.overlap > 0.5) {
          failures.push(`✗ ${line} — the two steppers OVERLAP by ${m.overlap}px.`);
          continue;
        }
        if (coarse && (m.width < 44 - 0.01 || m.height < 44 - 0.01)) {
          failures.push(
            `✗ ${line} — under the coarse-pointer design floor of 44×44. Side-by-side targets must ` +
              `occupy separate layout boxes.`,
          );
          continue;
        }
        if (!coarse && m.size === "md") {
          const off =
            Math.abs(m.width - FINE_PAINT.width) > 0.5 ||
            Math.abs(m.height - FINE_PAINT.height) > 0.5;
          if (off) {
            failures.push(
              `✗ ${line} — the DESKTOP PAINT moved (was ${FINE_PAINT.width}×${FINE_PAINT.height}). ` +
                `Hit-area fixes must not grow the painted stepper.`,
            );
            continue;
          }
        }
        console.log(`    ✓ ${line}`);
      }

      if (!coarse) {
        const hitDetail = await page.evaluate(() => {
          const root =
            document.querySelector('.ui-number-input[data-size="md"]') ??
            document.querySelector(".ui-number-input");
          root.scrollIntoView({ block: "center", behavior: "instant" });
          const up = root.querySelector(".ui-number-input-step-up");
          const down = root.querySelector(".ui-number-input-step-down");

          const measure = (button) => {
            const box = button.getBoundingClientRect();
            const cx = box.left + box.width / 2;
            const cy = box.top + box.height / 2;
            const belongs = (x, y) => {
              const el = document.elementFromPoint(x, y);
              return el === button || button.contains(el);
            };
            let left = cx;
            let right = cx;
            let top = cy;
            let bottom = cy;
            for (let i = 0; i < 80; i++) {
              if (belongs(left - 1, cy)) left -= 1;
              else break;
            }
            for (let i = 0; i < 80; i++) {
              if (belongs(right + 1, cy)) right += 1;
              else break;
            }
            for (let i = 0; i < 80; i++) {
              if (belongs(cx, top - 1)) top -= 1;
              else break;
            }
            for (let i = 0; i < 80; i++) {
              if (belongs(cx, bottom + 1)) bottom += 1;
              else break;
            }
            const after = getComputedStyle(button, "::after");
            return {
              box: { w: +box.width.toFixed(2), h: +box.height.toFixed(2) },
              hit: { w: +(right - left + 1).toFixed(2), h: +(bottom - top + 1).toFixed(2) },
              afterContent: after.content,
              rect: { left, right, top, bottom },
            };
          };

          const upM = measure(up);
          const downM = measure(down);
          const overlap =
            upM.rect.left < downM.rect.right &&
            downM.rect.left < upM.rect.right &&
            upM.rect.top < downM.rect.bottom &&
            downM.rect.top < upM.rect.bottom;

          const field = root.closest("[data-slot=form-field]") ?? root.parentElement;
          const label = field?.querySelector("label");
          const helper = field?.querySelector("[data-slot=form-field-note]");
          const neighbour = document.querySelectorAll(".ui-number-input")[1];
          const neighbourField = neighbour?.querySelector("[data-slot=number-input-field]");

          const clickTarget = (el) => {
            if (!el) return { ok: true, skipped: true };
            el.scrollIntoView({ block: "center", behavior: "instant" });
            const r = el.getBoundingClientRect();
            const x = r.left + r.width / 2;
            const y = r.top + r.height / 2;
            const hit = document.elementFromPoint(x, y);
            return {
              ok: hit === el || el.contains(hit),
              tag: hit?.tagName ?? null,
            };
          };

          return {
            up: upM,
            down: downM,
            overlap,
            label: clickTarget(label),
            neighbourField: clickTarget(neighbourField),
            helper: clickTarget(helper),
          };
        });

        console.log(
          `    ✓ fine md up   paint ${hitDetail.up.box.w}×${hitDetail.up.box.h}  hit ${hitDetail.up.hit.w}×${hitDetail.up.hit.h}  after=${hitDetail.up.afterContent}`,
        );
        console.log(
          `    ✓ fine md down paint ${hitDetail.down.box.w}×${hitDetail.down.box.h}  hit ${hitDetail.down.hit.w}×${hitDetail.down.hit.h}  after=${hitDetail.down.afterContent}`,
        );

        if (hitDetail.up.hit.w < MIN - 0.5 || hitDetail.up.hit.h < MIN - 0.5) {
          failures.push(
            `✗ fine pointer up stepper hit ${hitDetail.up.hit.w}×${hitDetail.up.hit.h} < ${MIN}×${MIN}`,
          );
        }
        if (hitDetail.down.hit.w < MIN - 0.5 || hitDetail.down.hit.h < MIN - 0.5) {
          failures.push(
            `✗ fine pointer down stepper hit ${hitDetail.down.hit.w}×${hitDetail.down.hit.h} < ${MIN}×${MIN}`,
          );
        }
        if (hitDetail.overlap) {
          failures.push(
            "✗ fine pointer up/down hit areas overlap — the later stepper swallows the neighbour.",
          );
        }
        if (hitDetail.label.ok === false) {
          failures.push(`✗ stepper ::after stole the field label (hit ${hitDetail.label.tag})`);
        }
        if (hitDetail.neighbourField.ok === false) {
          failures.push(
            `✗ stepper ::after stole the neighbouring input (hit ${hitDetail.neighbourField.tag})`,
          );
        }
        if (hitDetail.helper.skipped !== true && hitDetail.helper.ok === false) {
          failures.push(`✗ stepper ::after stole the helper note (hit ${hitDetail.helper.tag})`);
        }
      }

      await context.close();
    }

  // DatePicker range affix — fine pointer only (gh#609)
  const dateCtx = await browser.newContext({
    viewport: { width: 1024, height: 900 },
    hasTouch: false,
  });
  const datePage = await dateCtx.newPage();
  await datePage.goto(`${base}/isolate/data-entry-date-picker`, { waitUntil: "domcontentloaded" });
  await datePage.locator("#period").waitFor({ timeout: 30000 });

  const affixSelectors = [
    ["#period", "DateRangePicker clear"],
    ["#term", "MonthRangePicker calendar"],
  ];

  console.log("\n  DatePicker range affix (fine pointer)");
  const affixHits = [];
  for (const [anchor, note] of affixSelectors) {
    const btn = datePage.locator(`${anchor} button.ui-control-inline-affix-action`).first();
    const count = await btn.count();
    if (!count) {
      failures.push(`✗ ${note}: no ui-control-inline-affix-action near ${anchor}`);
      continue;
    }
    await btn.scrollIntoViewIfNeeded();
    await datePage.waitForTimeout(150);
    const a = await btn.evaluate((button) => {
      const box = button.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const belongs = (x, y) => {
        const el = document.elementFromPoint(x, y);
        return el === button || button.contains(el);
      };
      let left = cx;
      let right = cx;
      let top = cy;
      let bottom = cy;
      for (let i = 0; i < 80; i++) {
        if (belongs(left - 1, cy)) left -= 1;
        else break;
      }
      for (let i = 0; i < 80; i++) {
        if (belongs(right + 1, cy)) right += 1;
        else break;
      }
      for (let i = 0; i < 80; i++) {
        if (belongs(cx, top - 1)) top -= 1;
        else break;
      }
      for (let i = 0; i < 80; i++) {
        if (belongs(cx, bottom + 1)) bottom += 1;
        else break;
      }
      const after = getComputedStyle(button, "::after");
      return {
        label: button.getAttribute("aria-label") ?? "?",
        hasAffixClass: button.classList.contains("ui-control-inline-affix-action"),
        box: { w: +box.width.toFixed(2), h: +box.height.toFixed(2) },
        hit: { w: +(right - left + 1).toFixed(2), h: +(bottom - top + 1).toFixed(2) },
        afterContent: after.content,
      };
    });
    affixHits.push(a);
    const line = `${a.label} (${note}): paint ${a.box.w}×${a.box.h}  hit ${a.hit.w}×${a.hit.h}  affix=${a.hasAffixClass}  after=${a.afterContent}`;
    if (!a.hasAffixClass) failures.push(`✗ ${line} — missing ui-control-inline-affix-action`);
    else if (a.hit.w < MIN - 0.5 || a.hit.h < MIN - 0.5)
      failures.push(`✗ ${line} — under ${MIN}×${MIN}`);
    else console.log(`    ✓ ${line}`);
  }
  if (!affixHits.length)
    failures.push("✗ no DatePicker range affix buttons measured on data-entry-date-picker");

  await dateCtx.close();
} finally {
  await browser?.close();
  stopServer();
}

if (failures.length) {
  console.error(`\n✗ check:number-input-step-target — ${failures.length} failure(s):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(
  `\n✓ check:number-input-step-target — steppers ${MIN}×${MIN} (coarse paint + fine hit) and range affix hit areas.`,
);
