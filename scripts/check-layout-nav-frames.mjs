import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { createServer } from "vite";
import { execFileSync } from "node:child_process";

/**
 * Roving-focus assertions must be AWAITED, never read synchronously after the key press. Radix
 * `RovingFocusGroup` defers the focus move out of the `keydown` handler (`setTimeout(() =>
 * focusFirst(candidateNodes))` — @radix-ui/react-roving-focus), so the next trigger becomes
 * `document.activeElement` ~10-25ms AFTER `keyboard.press()` resolves.
 */

/**
 * Waits until the tablist is genuinely interactive, not merely painted.
 *
 * This used to wait for `[role="tablist"][tabindex="0"]` — Radix made the GROUP CONTAINER
 * focusable once its items had registered with the roving-focus collection. React Aria does not:
 * it leaves the container with no tabindex at all and puts the roving index on the TABS
 * (measured on the frame: tablist tabindex `null`, tabs `0` / `-1` / `-1`). So the condition had
 * become unsatisfiable, and this gate timed out on every run after the migration — a whole gate
 * failing on `main` in the nightly lane, saying nothing about tabs at all.
 *
 * The condition is now the roving state that actually exists: more than one tab, and exactly one
 * of them holding the tab stop.
 */
async function waitForRovingTablist(page) {
  await page.waitForFunction(
    () => {
      const tabs = [...document.querySelectorAll('[role="tab"]')];
      return tabs.length > 1 && tabs.some((tab) => tab.getAttribute("tabindex") === "0");
    },
    undefined,
    { timeout: 5000 },
  );
}

/**
 * Waits for the roving focus to land on the tab at `index` (document order) and returns the index
 * actually read back from the page. Throws `message` — with the index actually focused — when the
 * focus never gets there.
 */
async function waitForFocusedTabIndex(page, index, message) {
  try {
    await page.waitForFunction(
      (expected) =>
        [...document.querySelectorAll('[role="tab"]')].indexOf(document.activeElement) === expected,
      index,
      { timeout: 5000, polling: 16 },
    );
  } catch {
    const observed = await page.evaluate(() =>
      [...document.querySelectorAll('[role="tab"]')].indexOf(document.activeElement),
    );
    throw new Error(`${message} (expected tab index ${index}, focus stayed on index ${observed})`);
  }
  return page.evaluate(() =>
    [...document.querySelectorAll('[role="tab"]')].indexOf(document.activeElement),
  );
}

// This gate runs beside other browser gates on a shared host, so it must own a port nobody else
// is using.
// other gates use — which killed their servers out from under them.
const port = Number(process.env.PREVIEW_PORT) || 6041;
execFileSync(process.execPath, ["preview/scripts/kill-port.mjs", String(port)], {
  stdio: "ignore",
});
const server = await createServer({
  configFile: "preview/vite.config.ts",
  server: { port, strictPort: true },
});
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const widths = [320, 375, 390, 768, 1024, 1280, 1440, 1920];
const frames = [
  "layout-flex",
  "layout-responsive-grid",
  "navigation-tabs",
  "navigation-pagination",
];

try {
  await server.listen();
  const page = await context.newPage();
  const rechartsWarnings = [];
  let activeFrame = "";
  page.on("console", (message) => {
    const value = message.text();
    if (/width\(-1\)|height\(-1\)|recharts/i.test(value)) {
      rechartsWarnings.push({ frame: activeFrame, message: value });
    }
  });
  for (const frame of frames) {
    activeFrame = frame;
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`http://localhost:${port}/frame/${frame}`, { waitUntil: "networkidle" });
      const result = await page.evaluate(() => ({
        viewport: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        error: document.querySelector(".preview-runtime-error")?.textContent,
      }));
      if (result.error) throw new Error(`${frame}@${width}: ${result.error}`);
      if (result.scrollWidth > result.viewport + 1)
        throw new Error(
          `${frame}@${width}: viewport overflow ${result.scrollWidth}>${result.viewport}`,
        );
    }
  }

  /*
   * VERTICAL TABS — a MEASURED share, not a node count.
   *
   * `tabPlacement="start"` made the strip claim the row and collapse the panel: measured at a
   * 1232px root, strip 1133.72px (92%) / panel 90.28px (7%), with every trigger stretched to
   * 105.52px tall. Two utilities on the wrong axis — `w-full` on the line/card list and `flex-1`
   * on the trigger, both growing on the BLOCK axis once the root is a row — and the structural
   * test stayed green throughout, because every node was present and correct. Only geometry
   * could see it.
   *
   * The assertion is therefore the split itself. Elements are found by ROLE; only their
   * rectangles are read.
   */
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.goto(`http://localhost:${port}/frame/navigation-tabs`, { waitUntil: "networkidle" });
  const verticalSplit = await page.evaluate(() => {
    // EVERY vertical Tabs on the frame, not the first one. The first is the compound example, and
    // its docs source hard-codes a width on the list — so it never had the bug, and an assertion
    // that stopped there passed with the defect fully present. The broken path is the `items` API
    // with `variant="line"`, further down the same page.
    const roots = [...document.querySelectorAll('[data-slot="tabs"][data-orientation="vertical"]')];
    if (!roots.length) return { error: "no vertical Tabs on the frame — coverage lost" };
    const width = (el) => el.getBoundingClientRect().width;
    return {
      measured: roots.map((root) => {
        root.style.width = "1232px";
        const strip = root.querySelector('[role="tablist"]');
        const panel = [...root.children].find((c) => c !== strip && c.querySelector);
        return {
          id: root.id || root.getAttribute("data-variant") || "(unnamed)",
          root: width(root),
          strip: strip ? width(strip) : null,
          panel: panel ? width(panel) : null,
          triggerHeights: [...root.querySelectorAll('[role="tab"]')].map(
            (t) => +t.getBoundingClientRect().height.toFixed(2),
          ),
        };
      }),
    };
  });
  if (verticalSplit.error) throw new Error(`vertical Tabs: ${verticalSplit.error}`);
  for (const entry of verticalSplit.measured) {
    const { id, root, strip, panel, triggerHeights } = entry;
    if (strip == null || panel == null) {
      throw new Error(`vertical Tabs ${id}: no tablist/panel pair`);
    }
    // The panel takes everything the strip and the gap leave. `--tabs-root-gap` is 8px; 12px of
    // slack keeps this about the SHARE rather than about the exact gap token.
    if (panel < root - strip - 12) {
      throw new Error(
        `vertical Tabs ${id} panel collapsed: root ${root}px, strip ${strip}px, panel ${panel}px ` +
          `(expected panel >= ${root - strip - 12}px)`,
      );
    }
    // A vertical strip is a column of labels beside the content, never the majority of the row.
    if (strip > root / 3) {
      throw new Error(
        `vertical Tabs ${id} strip claimed the row: ${strip}px of ${root}px ` +
          `(${((strip / root) * 100).toFixed(1)}%, expected under 33%)`,
      );
    }
    // And the triggers keep their own height instead of dividing the panel's.
    const tallest = Math.max(...triggerHeights);
    if (tallest > 72) {
      throw new Error(
        `vertical Tabs ${id} triggers stretched on the block axis: tallest ${tallest}px ` +
          `(heights ${triggerHeights.join(", ")})`,
      );
    }
  }

  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto(`http://localhost:${port}/frame/navigation-tabs`, { waitUntil: "networkidle" });
  /*
   * The HORIZONTAL counterpart, so the fix above cannot be "solved" by moving the bug: a
   * horizontal line strip still spans its container.
   */
  const horizontalSpan = await page.evaluate(() => {
    const root = document.querySelector(
      '[data-slot="tabs"][data-orientation="horizontal"][data-variant="line"]',
    );
    if (!root) return null;
    const strip = root.querySelector('[role="tablist"]');
    if (!strip) return null;
    return {
      root: root.getBoundingClientRect().width,
      strip: strip.getBoundingClientRect().width,
    };
  });
  if (horizontalSpan && horizontalSpan.strip < horizontalSpan.root - 2) {
    throw new Error(
      `horizontal line Tabs strip stopped spanning its row: ${horizontalSpan.strip}px of ` +
        `${horizontalSpan.root}px`,
    );
  }

  let tabs = page.getByRole("tab");
  await waitForRovingTablist(page);
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await waitForFocusedTabIndex(page, 1, "LTR Tabs ArrowRight focus failed");
  let axe = await new AxeBuilder({ page }).analyze();
  const tabsViolations = axe.violations.map((v) => v.id);

  /*
   * RTL — what this leg can honestly assert, and what it cannot.
   *
   * It used to force `document.documentElement.dir = "rtl"` from an init script, then assert that
   * ArrowLeft moved focus FORWARD. Both halves were wrong:
   *
   *   - `AppProvider` writes `documentElement.dir` from the LOCALE on every render
   *     (app-provider.tsx:382), so the init script's value was overwritten before the keys were
   *     pressed. Measured: `documentElement.dir === "ltr"` throughout. The `[dir="rtl"]` guard
   *     passed anyway, because the frame's own wrapper carries that attribute.
   *   - So the assertion was reading LTR behaviour under an RTL name. ArrowLeft from the first
   *     tab wraps to the LAST one in LTR, which is index 2 — exactly what it measured once the
   *     roving-focus wait above stopped timing out and let it run at all.
   *
   * The VISUAL flip is real and is asserted below: the tablist computes `direction: rtl` and the
   * tabs run right-to-left across the row.
   *
   * The KEYBOARD direction is NOT assertable here, and that is a real gap rather than an
   * oversight: React Aria navigates by the ambient locale (`I18nProvider`), not by the `dir`
   * attribute — the same rule spelled out on ToggleGroup's `dir` prop — and this package bundles
   * messages for `en`, `ja` and `vi` only, all LTR. `?locale=ar` renders an empty frame. Until an
   * RTL locale can be loaded, no gate in this repo covers arrow direction for an RTL consumer.
   */
  await page.goto(`http://localhost:${port}/frame/navigation-tabs-rtl?dir=rtl`, {
    waitUntil: "networkidle",
  });
  tabs = page.getByRole("tab");
  if ((await page.locator('[dir="rtl"]').count()) === 0) throw new Error("RTL was not initialized");
  await waitForRovingTablist(page);
  const rtlVisualOrder = await page.evaluate(() => {
    const list = document.querySelector('[role="tablist"]');
    const items = [...list.querySelectorAll('[role="tab"]')];
    return {
      direction: getComputedStyle(list).direction,
      lefts: items.map((t) => Math.round(t.getBoundingClientRect().left)),
    };
  });
  if (rtlVisualOrder.direction !== "rtl") {
    throw new Error(`RTL Tabs: tablist computed direction is ${rtlVisualOrder.direction}`);
  }
  {
    const { lefts } = rtlVisualOrder;
    const descending = lefts.every((x, i) => i === 0 || x < lefts[i - 1]);
    if (!descending) {
      throw new Error(`RTL Tabs did not lay out right-to-left: lefts ${lefts.join(", ")}`);
    }
  }

  await page.goto(`http://localhost:${port}/frame/navigation-pagination`, {
    waitUntil: "networkidle",
  });
  const nextButtons = page.getByRole("button", { name: /次|next/i });
  for (let index = 0; index < (await nextButtons.count()); index++) {
    const button = nextButtons.nth(index);
    if ((await button.isVisible()) && !(await button.isDisabled())) {
      await button.click();
      break;
    }
  }
  if ((await page.locator('[aria-current="page"]').first().textContent())?.trim() !== "2")
    throw new Error("Pagination next-page journey failed");
  axe = await new AxeBuilder({ page }).analyze();
  const paginationViolations = axe.violations.map((v) => v.id);
  if (tabsViolations.length || paginationViolations.length) {
    throw new Error(
      `Axe violations: tabs=${tabsViolations.join(",") || "none"}; pagination=${paginationViolations.join(",") || "none"}`,
    );
  }
  console.log(
    JSON.stringify({
      frames,
      widths,
      reflow: "pass",
      verticalSplit,
      horizontalSpan,
      keyboard: "pass",
      rtl: {
        visualOrder: rtlVisualOrder,
        keyboardDirection: "NOT COVERED — React Aria reads it from the locale, and no RTL locale ships",
        verdict: "pass",
      },
      axe: { tabsViolations, paginationViolations },
      rechartsWarnings,
    }),
  );
} finally {
  await browser.close();
  await server.close();
}
