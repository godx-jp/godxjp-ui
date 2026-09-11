import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tabs } from "../tabs";

/**
 * gh#502 — `tabPlacement="start"` on a phone.
 *
 * MEASURED IN CHROMIUM BEFORE THE FIX, at 393px, with a 676px-wide block in the panel: the tab
 * strip came out **8px** wide with **0px** of tab inside it. That is not a cramped strip, it is no
 * route at all to any tab but the open one (WCAG 2.2 SC 2.1.1), and the panel spilled past the
 * viewport on top of it (SC 1.4.10). At 768px and 1280px the same tree was fine.
 *
 * jsdom has no layout, so the viewport is expressed the way the component reads it — through
 * `matchMedia` — and the assertions are on the resolved AXIS: `aria-orientation`, which is what a
 * screen reader announces, and which pair of arrow keys actually moves the roving focus. The pixel
 * side of the claim is held by the browser sweep (`pnpm check:frame-geometry`) and by the
 * CSS-shape case at the bottom of this file.
 */
function matchMediaFor(width: number) {
  return (query: string): MediaQueryList => {
    const max = /\(max-width:\s*(\d+(?:\.\d+)?)px\)/.exec(query);
    const matches = max != null && width <= Number(max[1]);
    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;
  };
}

function setViewport(width: number) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn(matchMediaFor(width)),
  });
}

/** Pretend the document root declares a themed breakpoint, without disturbing any other element. */
function stubBreakpointToken(value: string) {
  const real = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation(
    (element: Element, pseudo?: string | null) => {
      const style = real(element, pseudo);
      if (element !== document.documentElement) return style;
      return new Proxy(style, {
        get(target, property, receiver) {
          if (property === "getPropertyValue") {
            return (name: string) =>
              name === "--tabs-placement-responsive-breakpoint-width"
                ? value
                : target.getPropertyValue(name);
          }
          const resolved: unknown = Reflect.get(target, property, receiver);
          return typeof resolved === "function" ? resolved.bind(target) : resolved;
        },
      });
    },
  );
}

const ITEMS = [
  { value: "general", label: "基本設定", content: "パネル 基本設定" },
  { value: "members", label: "メンバー", content: "パネル メンバー" },
  { value: "billing", label: "請求", content: "パネル 請求" },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Tabs — a vertical strip folds to a horizontal one on a phone (gh#502)", () => {
  it("keeps the strip vertical at 1280px", () => {
    setViewport(1280);
    render(<Tabs items={ITEMS} tabPlacement="start" />);
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("keeps the strip vertical at 769px — the fold is at 768, not below the desk", () => {
    setViewport(769);
    render(<Tabs items={ITEMS} tabPlacement="start" />);
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("folds the strip horizontal at 393px", () => {
    setViewport(393);
    render(<Tabs items={ITEMS} tabPlacement="start" />);
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("folds it at 768px too — the breakpoint is inclusive, as every other one here is", () => {
    setViewport(768);
    render(<Tabs items={ITEMS} tabPlacement="start" />);
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "horizontal");
  });

  /**
   * THE AXIS IS NOT PAINT. A CSS-only flip would leave a strip that LOOKS horizontal being driven
   * by ↑/↓, so the keys are the real assertion: on the folded strip ←/→ must move the roving
   * focus, which is exactly what they do not do on a vertical tablist.
   */
  it("moves the roving focus with ←/→ once folded", async () => {
    setViewport(393);
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} tabPlacement="start" />);

    await user.tab();
    expect(screen.getByRole("tab", { name: "基本設定" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "メンバー" })).toHaveFocus();
  });

  it("still moves it with ↑/↓ while the strip is vertical", async () => {
    setViewport(1280);
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} tabPlacement="start" />);

    await user.tab();
    expect(screen.getByRole("tab", { name: "基本設定" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("tab", { name: "メンバー" })).toHaveFocus();
  });

  it("folds `end` to `bottom`, not to `top` — the strip stays on the trailing edge", () => {
    setViewport(393);
    const { container } = render(<Tabs items={ITEMS} tabPlacement="end" />);
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute(
      "data-placement",
      "bottom",
    );
  });

  it('folds a bare `orientation="vertical"` too — same defect, whichever prop asked for it', () => {
    setViewport(393);
    render(<Tabs items={ITEMS} orientation="vertical" />);
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("leaves `top` and `bottom` alone at every width", () => {
    setViewport(393);
    const { container } = render(<Tabs items={ITEMS} tabPlacement="bottom" />);
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute(
      "data-placement",
      "bottom",
    );
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "horizontal");
  });

  /**
   * The escape hatch is the token, not a prop: a service whose vertical tabs live in a wide scroll
   * region sets the knob to `0px`, which no viewport width can match.
   */
  it("a `0px` breakpoint token keeps the strip vertical on a phone", () => {
    setViewport(393);
    stubBreakpointToken("0px");
    render(<Tabs items={ITEMS} tabPlacement="start" />);
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("a themed wider breakpoint folds a tablet too", () => {
    setViewport(1024);
    stubBreakpointToken("64rem");
    render(<Tabs items={ITEMS} tabPlacement="start" />);
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "horizontal");
  });
});

/**
 * The second half of gh#502: above the fold width the strip still shared one inline axis with the
 * panel, and a flex item shrinks by default. The rule that stops it is a CSS declaration jsdom
 * cannot compute, so it is pinned in the SOURCE — the same way `segmented-sizing.test.ts` pins
 * geometry that only a browser can measure. `pnpm check:frame-geometry` is what measures the
 * rendered result.
 */
describe("Tabs — a vertical strip cannot be shrunk out of existence (gh#502)", () => {
  it("refuses to let the strip shrink beside a panel with a wide min-content", () => {
    const css = readFileSync(join(process.cwd(), "src/styles/navigation-layout.css"), "utf8");
    const selector =
      '[data-slot="tabs"][data-orientation="vertical"] > [data-slot="tabs-list"],\n' +
      '  [data-slot="tabs"][data-orientation="vertical"] > .ui-tabs-bar {';
    const start = css.indexOf(selector);
    expect(start, "the vertical-strip shrink rule is gone").toBeGreaterThan(-1);
    const body = css.slice(start + selector.length, css.indexOf("}", start));
    expect(body).toMatch(/flex-shrink:\s*0;/);
  });
});
