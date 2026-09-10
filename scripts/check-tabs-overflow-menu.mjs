#!/usr/bin/env node
/**
 * check:tabs-overflow-menu — the RENDERED half of `Tabs overflow="menu"` (Ant Design `more`).
 *
 * WHY IT IS HERE AND NOT IN A vitest FILE. jsdom lays nothing out: every `getBoundingClientRect()`
 * is a zero rect and nothing scrolls, so a zero-sized scrollport reads as "everything fits" and the
 * overflow menu can never appear on its own. The jsdom suite
 * (`src/components/navigation/__tests__/tabs-overflow-menu.test.tsx`) therefore proves the
 * MEASUREMENT on hand-written rects and the WIRING through a hand-fired ResizeObserver, and says so
 * in its own header. What it cannot prove is the thing the prop exists for: that a strip of real
 * Japanese labels overflows a real viewport, that the button then appears where a user can press it,
 * that the menu names the tabs that are genuinely off-screen, and that pressing one both selects the
 * tab and scrolls it back into the scrollport.
 *
 * THE FIXTURE IS PART OF THE GATE. `docs/navigation/tabs.tsx` carries a 20-item saved-view strip
 * wider than 1920px, so it overflows at EVERY width swept here. The first assertion at each width is
 * that it still does — a gate over a bar that fits proves nothing, and a fixture that quietly stops
 * overflowing (a shorter label, a wider container, a smaller font) would otherwise turn this whole
 * file into a no-op that stays green.
 *
 * THE CONTROL. The same 20 items are rendered a second time on that frame under the DEFAULT
 * `overflow="scroll"`. It must grow no button at all. Without that leg the gate would pass just as
 * happily if `overflow` were ignored and the menu were unconditional.
 *
 * `.ui-tabs-overflow`, not a `data-slot`: `DropdownMenuTrigger` stamps its own
 * `data-slot="dropdown-menu-trigger"` after the caller's props, so a `data-slot` passed in never
 * reaches the DOM. A `ui-*` class is the design system's own name.
 *
 * Runs in ci-browser-full.yml → rendered-runtime → the `interaction-semantics` shard, beside
 * check:data-table-pagination-wrap.
 */
import { chromium } from "playwright";
import { createServer } from "vite";
import { execFileSync } from "node:child_process";

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
const widths = [390, 768, 1024, 1440, 1920];
const MENU = "#antd-overflow-menu";
const SCROLL = "#antd-overflow-scroll";
const results = [];

/**
 * Everything this gate needs about one Tabs root, read in ONE page evaluation so the strip cannot
 * scroll between two of the reads.
 */
function readStrip(page, rootSelector) {
  return page.evaluate((selector) => {
    const root = document.querySelector(selector);
    if (!root) return { error: `no ${selector} on the frame — coverage lost` };
    const list = root.querySelector('[role="tablist"]');
    if (!list) return { error: `${selector} has no tablist` };
    const port = list.getBoundingClientRect();
    const tabs = [...list.querySelectorAll('[role="tab"]')].map((tab) => {
      const box = tab.getBoundingClientRect();
      return {
        label: (tab.textContent ?? "").trim(),
        visible: box.left >= port.left - 1 && box.right <= port.right + 1,
        selected: tab.getAttribute("aria-selected") === "true",
      };
    });
    const button = root.querySelector(".ui-tabs-overflow");
    const buttonBox = button ? button.getBoundingClientRect() : null;
    return {
      overflows: list.scrollWidth > list.clientWidth + 1,
      scrollWidth: list.scrollWidth,
      clientWidth: list.clientWidth,
      tabCount: tabs.length,
      hidden: tabs.filter((tab) => !tab.visible).map((tab) => tab.label),
      selected: tabs.find((tab) => tab.selected)?.label ?? null,
      hasButton: button != null,
      buttonName: button?.getAttribute("aria-label") ?? null,
      buttonInsideTablist: button ? list.contains(button) : false,
      buttonPaints: buttonBox ? buttonBox.width > 0 && buttonBox.height > 0 : false,
      rootOverflowsViewport:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  }, rootSelector);
}

try {
  await server.listen();
  const page = await context.newPage();

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`http://localhost:${port}/frame/navigation-tabs`, { waitUntil: "networkidle" });
    await page.locator(MENU).waitFor();
    // The overflow state is published by a ResizeObserver, so the first measurement lands one
    // frame after paint. Settle before reading — but do NOT wait on the button here: whether it
    // exists is what assertions 1 and 3 are for, and waiting on it would turn a real regression
    // into an unexplained timeout.
    await page.waitForTimeout(300);

    const menu = await readStrip(page, MENU);
    if (menu.error) throw new Error(`${width}: ${menu.error}`);
    const scroll = await readStrip(page, SCROLL);
    if (scroll.error) throw new Error(`${width}: ${scroll.error}`);

    // 1. THE FIXTURE. If this strip ever stops overflowing, every assertion below is vacuous.
    if (!menu.overflows) {
      throw new Error(
        `${width}: the overflow fixture no longer overflows — tablist scrollWidth ` +
          `${menu.scrollWidth} <= clientWidth ${menu.clientWidth}. Widen the fixture in ` +
          `docs/navigation/tabs.tsx; do not weaken this gate.`,
      );
    }
    if (menu.hidden.length === 0) {
      throw new Error(`${width}: strip overflows but no tab is outside the scrollport`);
    }

    // 2. THE CONTROL. The default `scroll` grows nothing, so `overflow` is what switches this on.
    if (!scroll.overflows) {
      throw new Error(`${width}: the control strip stopped overflowing — it proves nothing now`);
    }
    if (scroll.hasButton) {
      throw new Error(`${width}: overflow="scroll" grew an overflow button`);
    }

    // 3. THE BUTTON. Present, painted, named, and OUTSIDE the tablist — a tablist may own nothing
    //    but tabs (axe `aria-required-children`), which is why it lives in the bar row.
    if (!menu.hasButton) throw new Error(`${width}: no overflow button on the overflowing strip`);
    if (!menu.buttonPaints) throw new Error(`${width}: the overflow button has a zero-sized box`);
    if (!menu.buttonName) throw new Error(`${width}: the overflow button has no accessible name`);
    if (menu.buttonInsideTablist) {
      throw new Error(`${width}: the overflow button is inside the tablist`);
    }

    // 4. EVERY TAB STAYS IN THE STRIP. antd re-homes the overflowing ones; here they never leave,
    //    so the keyboard route to them survives.
    if (menu.tabCount !== scroll.tabCount) {
      throw new Error(
        `${width}: overflow="menu" dropped tabs from the tablist — ${menu.tabCount} vs the ` +
          `control's ${scroll.tabCount}`,
      );
    }

    // 5. THE MENU NAMES EXACTLY THE TABS THAT ARE OUT OF VIEW.
    await page.locator(`${MENU} .ui-tabs-overflow`).click();
    const menuItems = await page.locator('[role="menuitem"]').allTextContents();
    const listed = menuItems.map((text) => text.trim());
    if (listed.length !== menu.hidden.length || listed.some((v, i) => v !== menu.hidden[i])) {
      throw new Error(
        `${width}: the menu does not match the measurement — listed [${listed.join(", ")}], ` +
          `measured out-of-view [${menu.hidden.join(", ")}]`,
      );
    }

    // 6. CHOOSING ONE SELECTS IT, AND THE STRIP BRINGS IT BACK INTO VIEW. That second half is the
    //    reachability promise: a tab the user picked and still cannot see would be a worse bug
    //    than the one this prop exists to fix.
    const target = menu.hidden[menu.hidden.length - 1];
    await page.locator('[role="menuitem"]', { hasText: target }).last().click();
    await page.waitForFunction(
      ([selector, label]) => {
        const tab = [...document.querySelectorAll(`${selector} [role="tab"]`)].find(
          (node) => (node.textContent ?? "").trim() === label,
        );
        return tab?.getAttribute("aria-selected") === "true";
      },
      [MENU, target],
      { timeout: 5000 },
    );
    // The strip re-pins the newly selected trigger with `scrollIntoView({behavior:"smooth"})`, so
    // this is POLLED rather than read on the next tick — an animation in flight is not a failure.
    // It is still the reachability assertion: if the tab never arrives, this throws.
    try {
      await page.waitForFunction(
        ([selector, label]) => {
          const list = document.querySelector(`${selector} [role="tablist"]`);
          const tab = [...list.querySelectorAll('[role="tab"]')].find(
            (node) => (node.textContent ?? "").trim() === label,
          );
          if (!tab) return false;
          const port = list.getBoundingClientRect();
          const box = tab.getBoundingClientRect();
          return box.left >= port.left - 1 && box.right <= port.right + 1;
        },
        [MENU, target],
        { timeout: 5000 },
      );
    } catch {
      throw new Error(
        `${width}: "${target}" was selected from the menu but never came into the scrollport`,
      );
    }

    const after = await readStrip(page, MENU);
    if (after.selected !== target) {
      throw new Error(
        `${width}: chose "${target}" from the menu, selection is "${after.selected}"`,
      );
    }
    if (after.hidden.includes(target)) {
      throw new Error(
        `${width}: "${target}" was selected from the menu but is still outside the scrollport`,
      );
    }
    if (menu.rootOverflowsViewport || after.rootOverflowsViewport) {
      throw new Error(`${width}: the overflowing strip pushed the document past the viewport`);
    }

    results.push({
      width,
      fixtureOverflows: { scrollWidth: menu.scrollWidth, clientWidth: menu.clientWidth },
      outOfView: menu.hidden,
      listedInMenu: listed,
      control: { overflows: scroll.overflows, hasButton: scroll.hasButton },
      chose: target,
      selectedAfter: after.selected,
      broughtIntoView: !after.hidden.includes(target),
      verdict: "pass",
    });
  }

  /*
   * THE GUTTER TOKEN (antd `tabBarGutter`, declined as a prop and shipped as
   * `--tabs-list-line-space-gap`). The claim "it is a token, so a service can retune it" is only
   * true if the token is the thing the browser actually reads — so it is retuned here and the
   * painted gap is measured before and after. Without this the token could be a dead name that
   * nothing consults and the argument for declining the prop would be false.
   */
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`http://localhost:${port}/frame/navigation-tabs`, { waitUntil: "networkidle" });
  const gutter = await page.evaluate((selector) => {
    const list = document.querySelector(`${selector} [role="tablist"]`);
    const before = getComputedStyle(list).columnGap;
    list.style.setProperty("--tabs-list-line-space-gap", "17px");
    const after = getComputedStyle(list).columnGap;
    list.style.removeProperty("--tabs-list-line-space-gap");
    return { before, after };
  }, MENU);
  if (gutter.before !== "4px") {
    throw new Error(
      `line-strip gutter is ${gutter.before}, expected the 4px the gap-1 it replaced painted`,
    );
  }
  if (gutter.after !== "17px") {
    throw new Error(
      `--tabs-list-line-space-gap is a dead name: retuned to 17px, the strip still paints ` +
        `${gutter.after}`,
    );
  }
  results.push({ gutterToken: gutter, verdict: "pass" });

  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
  await server.close();
}
