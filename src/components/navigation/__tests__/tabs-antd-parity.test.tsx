import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tabs } from "../tabs";
import { readTabsScrollOffset, resolveTabsScrollDirection } from "../tabs-scroll";

const ITEMS = [
  { value: "a", label: "概要", content: "パネルA" },
  { value: "b", label: "詳細", content: "パネルB" },
];

/**
 * Ant Design 6.6.2 parity for the tab bar. Every case below is read off the INSTALLED antd types
 * (`antd/es/tabs/index.d.ts` + `@rc-component/tabs/es/interface.d.ts`), never off memory.
 */
const removeShortcuts = (container: HTMLElement) =>
  container.querySelectorAll('[data-slot="tabs-tab-remove"]');

describe('Tabs — antd `type="editable-card"` (shipped as variant)', () => {
  it("gives every closable item a remove shortcut that reports the item's own key", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const { container } = render(<Tabs items={ITEMS} variant="editable-card" onEdit={onEdit} />);

    const removes = removeShortcuts(container);
    expect(removes).toHaveLength(2);

    await user.click(removes[1] as HTMLElement);
    expect(onEdit).toHaveBeenCalledWith("b", "remove");
  });

  it("removing a tab never switches to it on the way out", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const { container } = render(<Tabs items={ITEMS} variant="editable-card" onEdit={onEdit} />);

    await user.click(removeShortcuts(container)[1] as HTMLElement);
    // Radix selects on MOUSEDOWN, so a stop that only ran on click would leave the doomed tab
    // selected for the frame in between — and, uncontrolled, permanently.
    expect(screen.getByRole("tab", { name: "概要" })).toHaveAttribute("aria-selected", "true");
  });

  it("honours `closable: false` on one item without disarming the others (antd getRemovable)", () => {
    const { container } = render(
      <Tabs
        items={[{ ...ITEMS[0], closable: false }, ITEMS[1]]}
        variant="editable-card"
        onEdit={vi.fn()}
      />,
    );
    expect(removeShortcuts(container)).toHaveLength(1);
  });

  it("keeps the tablist owning nothing but tabs (axe aria-required-children)", () => {
    render(<Tabs items={ITEMS} variant="editable-card" onEdit={vi.fn()} />);
    const tab = screen.getByRole("tab", { name: "概要" });
    // The × lives inside the tab and is NOT focusable, so neither aria-required-children (a button
    // owned by the tablist) nor nested-interactive (a focusable node inside role=tab) can fire.
    expect(tab.querySelector("button")).toBeNull();
    expect(tab.querySelector('[data-slot="tabs-tab-remove"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("announces the keyboard route on the tab itself", () => {
    render(<Tabs items={ITEMS} variant="editable-card" onEdit={vi.fn()} />);
    expect(screen.getByRole("tab", { name: "概要" })).toHaveAttribute(
      "aria-keyshortcuts",
      "Delete",
    );
  });

  it("removes the focused tab on Delete (WAI-ARIA APG tabs-with-deletion)", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<Tabs items={ITEMS} variant="editable-card" onEdit={onEdit} />);

    screen.getByRole("tab", { name: "概要" }).focus();
    await user.keyboard("{Delete}");
    expect(onEdit).toHaveBeenCalledWith("a", "remove");
  });

  it("renders the add button — a REAL, named button, because it sits outside the tablist", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const { container } = render(<Tabs items={ITEMS} variant="editable-card" onEdit={onEdit} />);

    const add = container.querySelector<HTMLButtonElement>('[data-slot="tabs-add"]');
    expect(add?.tagName).toBe("BUTTON");
    // Localized, so the exact string is not asserted — only that it HAS a name (WCAG 4.1.2).
    expect(add?.getAttribute("aria-label")).toBeTruthy();

    await user.click(add as HTMLButtonElement);
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit.mock.calls[0][1]).toBe("add");
  });

  it("antd `hideAdd` keeps the remove shortcuts but drops the add button", () => {
    const { container } = render(
      <Tabs items={ITEMS} variant="editable-card" hideAdd onEdit={vi.fn()} />,
    );
    expect(container.querySelector('[data-slot="tabs-add"]')).toBeNull();
    expect(removeShortcuts(container)).toHaveLength(2);
  });

  it("a non-editable card bar grows neither affordance", () => {
    const { container } = render(<Tabs items={ITEMS} variant="card" onEdit={vi.fn()} />);
    expect(removeShortcuts(container)).toHaveLength(0);
    expect(container.querySelector('[data-slot="tabs-add"]')).toBeNull();
  });
});

describe("Tabs — antd `destroyOnHidden`", () => {
  it("unmounts the inactive panel by default (the library's, and Radix's, behaviour)", () => {
    render(<Tabs items={ITEMS} />);
    expect(screen.queryByText("パネルB")).toBeNull();
  });

  it("`false` keeps every panel MOUNTED and hides the inactive ones", () => {
    render(<Tabs items={ITEMS} destroyOnHidden={false} />);
    const inactive = screen.getByText("パネルB");
    expect(inactive).toBeInTheDocument();
    // Mounted is not enough — Radix computes `hidden: !(forceMount || isSelected)`, which is
    // always false under forceMount, so without the explicit attribute BOTH panels would paint.
    expect(inactive.closest('[data-slot="tabs-panel"]')).toHaveAttribute("hidden");
    expect(screen.getByText("パネルA").closest('[data-slot="tabs-panel"]')).not.toHaveAttribute(
      "hidden",
    );
  });

  it("moves the `hidden` attribute with the selection", async () => {
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} destroyOnHidden={false} />);
    await user.click(screen.getByRole("tab", { name: "詳細" }));
    expect(screen.getByText("パネルB").closest('[data-slot="tabs-panel"]')).not.toHaveAttribute(
      "hidden",
    );
    expect(screen.getByText("パネルA").closest('[data-slot="tabs-panel"]')).toHaveAttribute(
      "hidden",
    );
  });
});

describe("Tabs — antd `tabBarExtraContent` (shipped as `extra`)", () => {
  it("parks a bare node in the END slot, which is where antd puts a bare node", () => {
    const { container } = render(<Tabs items={ITEMS} extra={<span>右</span>} />);
    const slot = container.querySelector('[data-slot="tabs-extra"]');
    expect(slot).toHaveAttribute("data-side", "end");
    expect(slot).toHaveTextContent("右");
  });

  it("splits a { start, end } map across both slots on the LOGICAL axis", () => {
    const { container } = render(
      <Tabs items={ITEMS} extra={{ start: <span>先頭</span>, end: <span>末尾</span> }} />,
    );
    const slots = container.querySelectorAll('[data-slot="tabs-extra"]');
    expect(slots).toHaveLength(2);
    expect(slots[0]).toHaveAttribute("data-side", "start");
    expect(slots[1]).toHaveAttribute("data-side", "end");
  });

  it("does not add the bar row when nothing needs it", () => {
    const { container } = render(<Tabs items={ITEMS} />);
    expect(container.querySelector('[data-slot="tabs-bar"]')).toBeNull();
  });
});

describe("Tabs — antd `tabPlacement` / `size` / `centered` / item `icon`", () => {
  it("an inline placement makes it a real VERTICAL tablist, not just a repaint", () => {
    const { container } = render(<Tabs items={ITEMS} tabPlacement="start" />);
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute(
      "data-placement",
      "start",
    );
    // Roving focus follows `orientation`, so the axis has to reach Radix too (APG: a vertical
    // tablist is Up/Down, a horizontal one Left/Right).
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("keeps a block placement horizontal", () => {
    const { container } = render(<Tabs items={ITEMS} tabPlacement="bottom" />);
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute(
      "data-placement",
      "bottom",
    );
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "horizontal");
  });

  it('a legacy `orientation="vertical"` still resolves to the `start` placement', () => {
    const { container } = render(<Tabs items={ITEMS} orientation="vertical" />);
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute(
      "data-placement",
      "start",
    );
  });

  it.each([
    ["top", "horizontal"],
    ["bottom", "horizontal"],
    ["start", "vertical"],
    ["end", "vertical"],
  ] as const)("placement %s drives the %s axis", (tabPlacement, axis) => {
    const { container } = render(<Tabs items={ITEMS} tabPlacement={tabPlacement} />);
    const root = container.querySelector('[data-slot="tabs"]');
    expect(root).toHaveAttribute("data-placement", tabPlacement);
    expect(root).toHaveAttribute("data-orientation", axis);
  });

  it.each(["sm", "md", "lg"] as const)("records the %s control tier", (size) => {
    const { container } = render(<Tabs items={ITEMS} size={size} />);
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute("data-size", size);
  });

  it("records the size tier and the centered flag on the root", () => {
    const { container } = render(<Tabs items={ITEMS} size="lg" centered />);
    const root = container.querySelector('[data-slot="tabs"]');
    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).toHaveAttribute("data-centered", "true");
  });

  it("defaults the size tier to md and leaves `centered` unset", () => {
    const { container } = render(<Tabs items={ITEMS} />);
    const root = container.querySelector('[data-slot="tabs"]');
    expect(root).toHaveAttribute("data-size", "md");
    expect(root).not.toHaveAttribute("data-centered");
  });

  it("renders an item `icon` inside its own trigger, hidden from assistive tech", () => {
    render(<Tabs items={[{ ...ITEMS[0], icon: <span data-testid="ic">★</span> }, ITEMS[1]]} />);
    const icon = screen.getByTestId("ic");
    expect(icon.closest('[data-slot="tabs-trigger-icon"]')).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("tab", { name: "概要" })).toContainElement(icon);
  });
});

describe("Tabs — antd `onTabClick`", () => {
  it("fires with the item's own value and the pointer event", async () => {
    const user = userEvent.setup();
    const onTabClick = vi.fn();
    render(<Tabs items={ITEMS} onTabClick={onTabClick} />);

    await user.click(screen.getByRole("tab", { name: "詳細" }));
    expect(onTabClick).toHaveBeenCalledTimes(1);
    expect(onTabClick.mock.calls[0][0]).toBe("b");
    expect(onTabClick.mock.calls[0][1]).toMatchObject({ type: "click" });
  });

  it("fires on the ALREADY SELECTED tab", async () => {
    const user = userEvent.setup();
    const onTabClick = vi.fn();
    render(<Tabs items={ITEMS} onTabClick={onTabClick} />);

    await user.click(screen.getByRole("tab", { name: "概要" }));
    expect(onTabClick).toHaveBeenCalledWith("a", expect.anything());
  });

  /**
   * RECORDED, NOT FIXED — and recorded here because it is the claim `onTabClick` would otherwise
   * be justified by. `onValueChange` fires on a re-click of the ALREADY SELECTED tab, i.e. when
   * no value changed: React Aria's selection manager runs `replaceSelection` on every activation
   * and reports it, and the component mirrors that straight through. It predates this prop — the
   * assertion below deliberately renders NO `onTabClick` at all, so nothing in this change can be
   * what produces it.
   *
   * So `onTabClick` is not "the one that fires on a re-click". What makes it a separate prop is
   * the two things `onValueChange` structurally cannot carry: the DOM MouseEvent, and the promise
   * that it is POINTER activation (the next test).
   */
  it("does not own the re-click: onValueChange already fires there, with no onTabClick present", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Tabs items={ITEMS} onValueChange={onValueChange} />);

    await user.click(screen.getByRole("tab", { name: "概要" }));
    expect(onValueChange).toHaveBeenCalledWith("a");
  });

  it("does not swallow the selection it sits in front of", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Tabs items={ITEMS} onTabClick={vi.fn()} onValueChange={onValueChange} />);

    await user.click(screen.getByRole("tab", { name: "詳細" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(screen.getByRole("tab", { name: "詳細" })).toHaveAttribute("aria-selected", "true");
  });

  it("is NOT fired by keyboard activation (manual activation has no click to report)", async () => {
    const user = userEvent.setup();
    const onTabClick = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Tabs
        items={ITEMS}
        activationMode="automatic"
        onTabClick={onTabClick}
        onValueChange={onValueChange}
      />,
    );

    screen.getByRole("tab", { name: "概要" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(onTabClick).not.toHaveBeenCalled();
  });
});

describe("Tabs — antd `removeIcon` (shipped as the strip-wide `closeIcon`)", () => {
  it("replaces the default × on EVERY removable tab", () => {
    const { container } = render(
      <Tabs
        items={ITEMS}
        variant="editable-card"
        onEdit={vi.fn()}
        closeIcon={<span data-testid="strip-x">✕</span>}
      />,
    );
    expect(container.querySelectorAll('[data-testid="strip-x"]')).toHaveLength(2);
  });

  it("loses to an item's own `closeIcon` (antd's precedence)", () => {
    const { container } = render(
      <Tabs
        items={[{ ...ITEMS[0], closeIcon: <span data-testid="item-x">×</span> }, ITEMS[1]]}
        variant="editable-card"
        onEdit={vi.fn()}
        closeIcon={<span data-testid="strip-x">✕</span>}
      />,
    );
    const removes = removeShortcuts(container);
    expect(removes[0].querySelector('[data-testid="item-x"]')).not.toBeNull();
    expect(removes[1].querySelector('[data-testid="strip-x"]')).not.toBeNull();
  });

  it("stays inside the aria-hidden pointer shortcut — a custom glyph is not a new control", () => {
    const { container } = render(
      <Tabs
        items={ITEMS}
        variant="editable-card"
        onEdit={vi.fn()}
        closeIcon={<span data-testid="strip-x">✕</span>}
      />,
    );
    expect(
      container.querySelector('[data-testid="strip-x"]')?.closest("[aria-hidden]"),
    ).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("tab", { name: "概要" }).querySelector("button")).toBeNull();
  });
});

describe("Tabs — antd `Tab.forceRender`", () => {
  const ITEMS_3 = [...ITEMS, { value: "c", label: "履歴", content: "パネルC" }];

  it("mounts JUST that panel while the other inactive ones stay destroyed", () => {
    render(<Tabs items={[ITEMS_3[0], { ...ITEMS_3[1], forceRender: true }, ITEMS_3[2]]} />);
    expect(screen.getByText("パネルB")).toBeInTheDocument();
    expect(screen.queryByText("パネルC")).toBeNull();
  });

  it("hides the force-rendered panel while its tab is not selected", () => {
    render(<Tabs items={[ITEMS_3[0], { ...ITEMS_3[1], forceRender: true }, ITEMS_3[2]]} />);
    // Mounted is not enough: `present` is `forceMount || isSelected`, so without the explicit
    // attribute the eager panel would paint on top of the active one.
    expect(screen.getByText("パネルB").closest('[data-slot="tabs-panel"]')).toHaveAttribute(
      "hidden",
    );
    expect(screen.getByText("パネルA").closest('[data-slot="tabs-panel"]')).not.toHaveAttribute(
      "hidden",
    );
  });

  it("survives a round trip through another tab (the state it exists to keep)", async () => {
    const user = userEvent.setup();
    render(<Tabs items={[ITEMS_3[0], { ...ITEMS_3[1], forceRender: true }, ITEMS_3[2]]} />);
    await user.click(screen.getByRole("tab", { name: "履歴" }));
    expect(screen.getByText("パネルB")).toBeInTheDocument();
    expect(screen.queryByText("パネルA")).toBeNull();
  });

  it("leaves the default alone — no item asks for it, nothing extra is mounted", () => {
    render(<Tabs items={ITEMS_3} />);
    expect(screen.queryByText("パネルB")).toBeNull();
    expect(screen.queryByText("パネルC")).toBeNull();
  });
});

describe("Tabs — antd `animated`", () => {
  const motionOf = (container: HTMLElement) => {
    const root = container.querySelector('[data-slot="tabs"]');
    return {
      inkBar: root?.getAttribute("data-animated-ink-bar"),
      tabPane: root?.getAttribute("data-animated-tab-pane"),
    };
  };

  it("defaults to antd's own `{ inkBar: true, tabPane: false }`", () => {
    const { container } = render(<Tabs items={ITEMS} />);
    expect(motionOf(container)).toEqual({ inkBar: "true", tabPane: "false" });
  });

  it("`false` turns BOTH switches off", () => {
    const { container } = render(<Tabs items={ITEMS} animated={false} />);
    expect(motionOf(container)).toEqual({ inkBar: "false", tabPane: "false" });
  });

  /**
   * antd's wrapper and rc-tabs DISAGREE here, and the published behaviour is antd's:
   * `components/tabs/hooks/useAnimateConfig.ts` maps `true` to `{ inkBar: true, tabPane: true }`,
   * while `@rc-component/tabs`'s own hook leaves `tabPane` off. This asserts the antd one.
   */
  it("`true` turns both ON — antd's wrapper, not rc-tabs' bare default", () => {
    const { container } = render(<Tabs items={ITEMS} animated />);
    expect(motionOf(container)).toEqual({ inkBar: "true", tabPane: "true" });
  });

  it("an object MERGES over `{ inkBar: true }` rather than replacing it", () => {
    const { container } = render(<Tabs items={ITEMS} animated={{ tabPane: true }} />);
    expect(motionOf(container)).toEqual({ inkBar: "true", tabPane: "true" });
  });

  it("lets one switch be turned off without turning the other on", () => {
    const { container } = render(<Tabs items={ITEMS} animated={{ inkBar: false }} />);
    expect(motionOf(container)).toEqual({ inkBar: "false", tabPane: "false" });
  });
});

describe("Tabs — antd `indicator`", () => {
  const indicatorOf = (container: HTMLElement) => {
    const root = container.querySelector('[data-slot="tabs"]');
    return {
      size: root?.getAttribute("data-indicator-size"),
      align: root?.getAttribute("data-indicator-align"),
    };
  };

  it("defaults to the whole trigger, centred — upstream `useIndicator`'s own defaults", () => {
    const { container } = render(<Tabs items={ITEMS} variant="line" />);
    expect(indicatorOf(container)).toEqual({ size: "full", align: "center" });
  });

  it("carries both fields to the root", () => {
    const { container } = render(
      <Tabs items={ITEMS} variant="line" indicator={{ size: "label", align: "start" }} />,
    );
    expect(indicatorOf(container)).toEqual({ size: "label", align: "start" });
  });

  it("takes `align` on its own and leaves the length at its default", () => {
    const { container } = render(
      <Tabs items={ITEMS} variant="line" indicator={{ align: "end" }} />,
    );
    expect(indicatorOf(container)).toEqual({ size: "full", align: "end" });
  });

  it("takes `size` on its own and leaves the alignment at antd's `center`", () => {
    const { container } = render(
      <Tabs items={ITEMS} variant="line" indicator={{ size: "label" }} />,
    );
    expect(indicatorOf(container)).toEqual({ size: "label", align: "center" });
  });
});

/**
 * Ant Design `onTabScroll`. Upstream reads the sign of an inner transform
 * (`@rc-component/tabs` src/TabNavList/index.tsx: `onTabScroll({ direction: next > prev ? 'left'
 * : 'right' })`); here the strip IS its own scrollport, so the same fact is read off its scroll
 * offset. jsdom lays nothing out and pins `scrollLeft` at 0, so the offset is defined onto the
 * element and the event delivered by hand — the two halves are split the way the overflow suite
 * splits them.
 */
describe("Tabs — antd `onTabScroll`", () => {
  const setOffset = (element: HTMLElement, offset: number) => {
    Object.defineProperty(element, "scrollLeft", { value: offset, configurable: true });
    element.dispatchEvent(new Event("scroll"));
  };

  it("reports a move towards the trailing edge as `end`", () => {
    const onTabScroll = vi.fn();
    render(<Tabs items={ITEMS} onTabScroll={onTabScroll} />);
    setOffset(screen.getByRole("tablist"), 120);
    expect(onTabScroll).toHaveBeenCalledWith({ direction: "end" });
  });

  it("reports a move back towards the leading edge as `start`", () => {
    const onTabScroll = vi.fn();
    render(<Tabs items={ITEMS} onTabScroll={onTabScroll} />);
    const list = screen.getByRole("tablist");
    setOffset(list, 120);
    setOffset(list, 40);
    expect(onTabScroll).toHaveBeenLastCalledWith({ direction: "start" });
    expect(onTabScroll).toHaveBeenCalledTimes(2);
  });

  it("says nothing when a scroll event reports the position it already had", () => {
    const onTabScroll = vi.fn();
    render(<Tabs items={ITEMS} onTabScroll={onTabScroll} />);
    const list = screen.getByRole("tablist");
    setOffset(list, 120);
    setOffset(list, 120);
    expect(onTabScroll).toHaveBeenCalledTimes(1);
  });

  it("arms nothing when no handler is passed", () => {
    render(<Tabs items={ITEMS} />);
    // The absence of a listener cannot be asserted directly; that the strip survives a scroll
    // event with no handler is what a consumer actually depends on.
    expect(() => setOffset(screen.getByRole("tablist"), 80)).not.toThrow();
  });
});

describe("tabs-scroll — the pure halves of `onTabScroll`", () => {
  it("names the edge a movement went towards, and nothing when it did not move", () => {
    expect(resolveTabsScrollDirection(0, 40)).toBe("end");
    expect(resolveTabsScrollDirection(40, 0)).toBe("start");
    expect(resolveTabsScrollDirection(40, 40)).toBeNull();
  });

  it("reads a horizontal strip's offset straight through in LTR", () => {
    const list = document.createElement("div");
    Object.defineProperty(list, "scrollLeft", { value: 90, configurable: true });
    expect(readTabsScrollOffset(list, false)).toBe(90);
  });

  /**
   * The bug this exists to stop. Per CSSOM-View an RTL scroller reports 0 at its START edge and
   * goes NEGATIVE towards the end, so a raw `scrollLeft` would have called the same gesture `end`
   * in Arabic and `start` in Japanese — invisible to an LTR-only suite, and the exact class of
   * error antd's own `left`/`right` values still carry (its direction is the sign of a transform
   * whose bounds are flipped for RTL).
   */
  it("flips an RTL strip's offset so `end` still means the trailing edge", () => {
    const list = document.createElement("div");
    list.setAttribute("dir", "rtl");
    Object.defineProperty(list, "scrollLeft", { value: -90, configurable: true });
    expect(readTabsScrollOffset(list, false)).toBe(90);
  });

  it("reads the block axis for a vertical strip, where direction does not apply", () => {
    const list = document.createElement("div");
    list.setAttribute("dir", "rtl");
    Object.defineProperty(list, "scrollTop", { value: 55, configurable: true });
    expect(readTabsScrollOffset(list, true)).toBe(55);
  });
});
