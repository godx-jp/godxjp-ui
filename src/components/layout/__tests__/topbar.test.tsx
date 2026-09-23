import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Topbar } from "../topbar";
import { TopbarItem } from "../topbar-item";

const shellStyles = readFileSync(resolve(process.cwd(), "src/styles/shell-layout.css"), "utf8");

/** Every declaration block for `selector`, comments stripped (topbar-item.test.tsx's own helper). */
function declarationsFor(css: string, selector: string): string {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: string[] = [];
  const rule = /([^{}]*)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = rule.exec(stripped)) !== null) {
    const selectors = match[1].split(",").map((part) => part.trim());
    if (selectors.includes(selector)) blocks.push(match[2]);
  }
  return blocks.join("\n");
}

describe("Topbar — slot bar", () => {
  it("renders the start / center / end clusters the consumer passes", () => {
    const { container } = render(
      <Topbar
        start={<span data-testid="brand">godx</span>}
        center={<span data-testid="search">検索</span>}
        end={<span data-testid="user">田中</span>}
      />,
    );
    expect(container.querySelector('[data-slot="topbar"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="topbar-start"]')).toContainElement(
      screen.getByTestId("brand"),
    );
    expect(container.querySelector('[data-slot="topbar-center"]')).toContainElement(
      screen.getByTestId("search"),
    );
    expect(container.querySelector('[data-slot="topbar-end"]')).toContainElement(
      screen.getByTestId("user"),
    );
  });

  it("omits a slot wrapper when that slot is empty (no baked chrome)", () => {
    const { container } = render(<Topbar start={<span>godx</span>} />);
    expect(container.querySelector('[data-slot="topbar-start"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="topbar-center"]')).toBeNull();
    expect(container.querySelector('[data-slot="topbar-end"]')).toBeNull();
  });

  it("renders fully custom children instead of the slots when provided", () => {
    const { container } = render(
      <Topbar start={<span>ignored</span>}>
        <div data-testid="custom">custom bar</div>
      </Topbar>,
    );
    expect(screen.getByTestId("custom")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="topbar-start"]')).toBeNull();
  });

  it("keeps intrinsic-width content inside its own clipping slot (gh#226)", () => {
    // The shrink contract lives in CSS (`.ui-topbar-start/center/end` clip their own overflow, and
    // `end` never shrinks) — see src/styles/__tests__/shell-responsive-geometry.test.ts. What the
    // component owes it is a real wrapper per cluster: rendering `start` bare, or merging two
    // clusters into one node, would remove the boundary the clip is applied to and let a long
    // tenant name push the user menu out of the viewport again.
    const { container } = render(
      <Topbar
        start={<span data-testid="tenant">株式会社ゴッドエックス 東京本社 管理コンソール</span>}
        center={<span data-testid="search">検索</span>}
        end={<span data-testid="user">田中</span>}
      />,
    );

    const slots = {
      start: container.querySelector('[data-slot="topbar-start"]'),
      center: container.querySelector('[data-slot="topbar-center"]'),
      end: container.querySelector('[data-slot="topbar-end"]'),
    };
    expect(slots.start).toHaveClass("ui-topbar-start");
    expect(slots.center).toHaveClass("ui-topbar-center");
    expect(slots.end).toHaveClass("ui-topbar-end");

    // Each cluster is a direct child of the bar — the flex line the shrink contract is written
    // against — and no cluster wraps another.
    const bar = container.querySelector('[data-slot="topbar"]');
    for (const slot of Object.values(slots)) {
      expect(slot?.parentElement).toBe(bar);
    }
    expect(slots.start).not.toContainElement(screen.getByTestId("user"));
    expect(slots.end).toContainElement(screen.getByTestId("user"));
  });

  it("forwards className and arbitrary props onto the bar", () => {
    const { container } = render(<Topbar className="custom-bar" aria-label="メイン" />);
    const bar = container.querySelector('[data-slot="topbar"]');
    expect(bar).toHaveClass("ui-topbar", "custom-bar");
    expect(bar).toHaveAttribute("aria-label", "メイン");
  });

  /*
   * gh#883 — `.ui-topbar-item` promises full bar height through its own `align-self: stretch`
   * (shell-layout.css), which only reaches the bar when the item is a DIRECT CHILD of the slot: two
   * TopbarItems wrapped in a `<Flex>` (the intuitive way to place a pair — notifications + account
   * is every real topbar's `end`) put a SECOND flex container between the item and the slot, and
   * that wrapper takes the default `align-self: auto` and collapses to its own content (measured:
   * 47px bar height down to 16px). `end`/`center`/`start` are already typed `ReactNode`, which in
   * React already includes an ARRAY of elements — passing one instead of a `<Flex>` wrapper renders
   * each item as its own direct child of the slot with no wrapper element at all, so the existing
   * per-item `align-self: stretch` reaches the slot's real height the same way a single item's
   * always has. No component or CSS change was needed; this is what closes the issue and what the
   * MCP catalog's Topbar/TopbarItem examples now show instead of the `<Flex>` shape that breaks it.
   */
  it("renders an array of TopbarItems as direct slot children — no wrapper to collapse (gh#883)", () => {
    const { container } = render(
      <Topbar
        end={[
          <TopbarItem key="notifications" aria-label="通知" />,
          <TopbarItem key="account" aria-label="アカウント" />,
        ]}
      />,
    );
    const slot = container.querySelector('[data-slot="topbar-end"]');
    const notifications = screen.getByLabelText("通知");
    const account = screen.getByLabelText("アカウント");

    // Each item is a DIRECT child of the slot — nothing (no Flex, no div) sits between them.
    expect(notifications.parentElement).toBe(slot);
    expect(account.parentElement).toBe(slot);
    expect(slot?.children).toHaveLength(2);
  });

  it("still renders a single item as a direct slot child (unchanged, non-array usage)", () => {
    const { container } = render(<Topbar end={<TopbarItem aria-label="アカウント" />} />);
    const slot = container.querySelector('[data-slot="topbar-end"]');
    expect(screen.getByLabelText("アカウント").parentElement).toBe(slot);
  });

  it("the CSS chain an array relies on: the item stretches itself, the slot is a flex line (gh#883)", () => {
    const itemRule = declarationsFor(shellStyles, ".ui-topbar-item");
    expect(itemRule).toMatch(/align-self:\s*stretch/);
    // `.ui-topbar-end` is one of the comma-grouped selectors on the shared cluster rule, so this
    // finds that block — `display: flex` is what makes a direct child's own `align-self` meaningful.
    const slotRule = declarationsFor(shellStyles, ".ui-topbar-end");
    expect(slotRule).toMatch(/display:\s*flex/);
  });
});
