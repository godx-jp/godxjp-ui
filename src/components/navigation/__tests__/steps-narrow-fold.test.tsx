import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { Steps } from "../steps";

/**
 * GDX-1363 — a horizontal Steps at 320px gave each of four titles a 48px column and Japanese
 * titles broke inside the word (「プロジ｜ェクト」). Below `--steps-responsive-breakpoint-width`
 * the rail folds to vertical (Ant Design `responsive`). jsdom has no layout, so the viewport is
 * expressed through `matchMedia`, the way the component reads it; the pixel side is held by
 * steps-narrow-fold-browser.test.ts.
 */
function setViewport(width: number) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn((query: string) => {
      const max = /\(max-width:\s*(\d+(?:\.\d+)?)px\)/.exec(query);
      return {
        matches: max != null && width <= Number(max[1]),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList;
    }),
  });
}

const ITEMS = [
  { title: "接続" },
  { title: "プロジェクト" },
  { title: "同期モード" },
  { title: "ステータスの対応" },
];

const direction = (container: HTMLElement) =>
  container.querySelector("ol")?.getAttribute("data-direction");

afterEach(() => {
  setViewport(1280);
});

describe("Steps narrow fold (responsive)", () => {
  it("folds a horizontal rail to vertical at a phone width", () => {
    setViewport(320);
    const { container } = render(<Steps items={ITEMS} value={1} />);
    expect(direction(container)).toBe("vertical");
    for (const item of container.querySelectorAll("li")) {
      expect(item.getAttribute("data-direction")).toBe("vertical");
      expect(item.hasAttribute("data-connector")).toBe(false);
    }
  });

  it("stays horizontal above the breakpoint", () => {
    setViewport(768);
    const { container } = render(<Steps items={ITEMS} value={1} />);
    expect(direction(container)).toBe("horizontal");
  });

  it("responsive={false} keeps the rail horizontal at a phone width", () => {
    setViewport(320);
    const { container } = render(<Steps items={ITEMS} value={1} responsive={false} />);
    expect(direction(container)).toBe("horizontal");
    expect(container.querySelector("ol")?.hasAttribute("responsive")).toBe(false);
  });

  it('type="inline" never folds — it has no columns', () => {
    setViewport(320);
    const { container } = render(<Steps items={ITEMS} value={1} type="inline" />);
    expect(direction(container)).toBeNull();
    expect(container.querySelector(".ui-steps-inline")).not.toBeNull();
  });
});
