import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SidebarHeader, SidebarItem, SidebarSection } from "../sidebar";

const Icon = () => <svg data-testid="icon" />;
const item = (over: Record<string, unknown> = {}) => ({
  id: "dash",
  label: "ダッシュボード",
  icon: Icon,
  ...over,
});

describe("SidebarItem", () => {
  it("renders icon + label, marks active and fires onActivate", async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<SidebarItem item={item()} active onActivate={onActivate} />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-active", "true");
    expect(btn).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("ダッシュボード")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    await user.click(btn);
    expect(onActivate).toHaveBeenCalledWith("dash");
  });

  it("shows a badge when present and omits it otherwise", () => {
    const { rerender, container } = render(<SidebarItem item={item({ badge: "9" })} />);
    expect(container.querySelector(".sb-badge")).toHaveTextContent("9");
    rerender(<SidebarItem item={item()} />);
    expect(container.querySelector(".sb-badge")).toBeNull();
  });

  /*
   * `badgeTone` — what a nav row's COUNT MEANS: a plain unread tally, or something addressed to
   * this user (an @mention, a DM). Before it, the only way to emphasise a row was to nest a
   * `<Badge>` inside `badge`, which renders a pill inside the pill the row already draws: measured
   * at a 37.11x19.14 `.sb-badge` wrapping a 25.11x19.14 `<Badge>` with its own border.
   *
   * jsdom runs no layout and applies no stylesheet, so the two halves are asserted where each one
   * is real: the DOM contract here (which is where "byte-identical by default" is decided), and the
   * CSS SOURCE for everything a cascade would decide — the same split the PageContainer axes use.
   */
  describe("badgeTone", () => {
    const shellLayoutCss = readFileSync(
      resolve(process.cwd(), "src/styles/shell-layout.css"),
      "utf8",
    );
    const shellTokens = readFileSync(
      resolve(process.cwd(), "src/tokens/components/shell.css"),
      "utf8",
    );
    /** The `.sb-badge` base rule — brace-matched so a following rule cannot leak in. */
    const baseBadgeRule = shellLayoutCss.match(/\n {2}\.sb-badge \{[^}]*\}/)?.[0] ?? "";
    const toneBadgeRule =
      shellLayoutCss.match(/\.sb-badge\[data-tone="destructive"\] \{[^}]*\}/)?.[0] ?? "";

    it("emits NO attribute by default — the pill is byte-identical to the pre-knob DOM", () => {
      const { container, rerender } = render(<SidebarItem item={item({ badge: "9" })} />);
      const badge = container.querySelector(".sb-badge")!;
      // Not "has no data-tone" but "is exactly the node it always was": one class, one text child,
      // no attribute a consumer selector would have to out-specify (rule #44).
      expect(badge.outerHTML).toBe('<span class="sb-badge">9</span>');
      // Passing the default EXPLICITLY must be the same node, not a marker meaning "unchanged".
      rerender(<SidebarItem item={item({ badge: "9", badgeTone: "neutral" })} />);
      expect(container.querySelector(".sb-badge")!.outerHTML).toBe(
        '<span class="sb-badge">9</span>',
      );
    });

    it("publishes the emphasis tone as ONE attribute on the SAME pill", () => {
      const { container } = render(
        <SidebarItem item={item({ badge: "3", badgeTone: "destructive" })} />,
      );
      const badge = container.querySelector(".sb-badge")!;
      expect(badge).toHaveAttribute("data-tone", "destructive");
      // No second pill: the row still renders exactly one .sb-badge, and it has no ELEMENT child —
      // the two-nested-pills shape this axis replaces would put a <Badge> span inside it.
      expect(container.querySelectorAll(".sb-badge")).toHaveLength(1);
      expect(badge.children).toHaveLength(0);
      expect(badge.className).toBe("sb-badge");
      expect(badge).toHaveTextContent("3");
    });

    it("rides the LIBRARY-composed row, so asChild links get the tone too", () => {
      // gh#213: the library owns row content precisely so a consumer link cannot drop parts of it.
      // A new row axis is only real if it reaches every row shape, not just the default button.
      const { container } = render(
        <SidebarItem item={item({ badge: "3", badgeTone: "destructive", href: "/x" })} asChild>
          <a href="/x" />
        </SidebarItem>,
      );
      expect(container.querySelector("a .sb-badge")).toHaveAttribute("data-tone", "destructive");
    });

    it("is inert without a badge — a tone alone renders no pill", () => {
      const { container } = render(<SidebarItem item={item({ badgeTone: "destructive" })} />);
      expect(container.querySelector(".sb-badge")).toBeNull();
    });

    it("moves COLOUR only — geometry stays on the shared base rule", () => {
      // The whole point of a tone axis over a nested <Badge>: a mention row and an unread row must
      // still line up in the same column. If the tone rule ever grows a size/pad/radius, they stop.
      expect(toneBadgeRule).not.toBe("");
      expect(toneBadgeRule).toMatch(
        /background: var\(--sidebar-badge-destructive-background, hsl\(var\(--destructive\)\)\);/,
      );
      expect(toneBadgeRule).toMatch(
        /color: var\(--sidebar-badge-destructive-foreground, hsl\(var\(--destructive-foreground\)\)\);/,
      );
      expect(toneBadgeRule).not.toMatch(
        /min-width|padding|border-radius|font-size|font-weight|line-height|display/,
      );
      // …and the geometry really does live on the base rule, which both tones share.
      expect(baseBadgeRule).toMatch(/min-width: 1\.125rem;/);
      expect(baseBadgeRule).toMatch(/border-radius: var\(--radius-pill\);/);
      expect(baseBadgeRule).toMatch(/padding-inline: 0\.375rem;/);
    });

    it("owns both colour pairs as tokens, the resting pair unchanged (rule #44/#45)", () => {
      // The resting defaults are the literals the pill always carried, now reachable from a theme.
      expect(baseBadgeRule).toMatch(
        /background: var\(--sidebar-badge-background, hsl\(var\(--secondary\)\)\);/,
      );
      expect(baseBadgeRule).toMatch(
        /color: var\(--sidebar-badge-foreground, hsl\(var\(--muted-foreground\)\)\);/,
      );
      // `initial` at the token tier so a scoped [data-tenant]/.dark override of the ROLE still
      // reaches the pill; a :root binding to a role var would freeze it (docs/TOKENS.md).
      for (const token of [
        "--sidebar-badge-background",
        "--sidebar-badge-foreground",
        "--sidebar-badge-destructive-background",
        "--sidebar-badge-destructive-foreground",
      ]) {
        expect(shellTokens).toMatch(new RegExp(`${token}: initial;`));
      }
    });
  });

  it("a sub item drops the icon and takes the sub modifier class", () => {
    const { container } = render(<SidebarItem item={item()} sub />);
    expect(container.querySelector(".sb-nav-item--sub")).not.toBeNull();
    expect(screen.queryByTestId("icon")).toBeNull(); // no icon for sub rows
  });

  it("a disabled item ignores clicks and is aria-disabled", async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<SidebarItem item={item({ disabled: true })} onActivate={onActivate} />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-disabled", "true");
    await user.click(btn);
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("renders custom content via renderItem instead of the default row", () => {
    render(<SidebarItem item={item()} renderItem={(i) => <span>custom-{i.id}</span>} />);
    expect(screen.getByText("custom-dash")).toBeInTheDocument();
    expect(screen.queryByTestId("icon")).toBeNull();
  });
});

describe("SidebarHeader + SidebarSection", () => {
  it("SidebarHeader renders its children", () => {
    render(<SidebarHeader>BRAND</SidebarHeader>);
    expect(screen.getByText("BRAND")).toBeInTheDocument();
  });

  it("SidebarSection shows its label only when not collapsed", () => {
    const { rerender, container } = render(
      <SidebarSection label="メイン">
        <div>item</div>
      </SidebarSection>,
    );
    expect(container.querySelector(".sb-section-label")).toHaveTextContent("メイン");
    rerender(
      <SidebarSection label="メイン" collapsed>
        <div>item</div>
      </SidebarSection>,
    );
    expect(container.querySelector(".sb-section-label")).toBeNull();
  });
});
