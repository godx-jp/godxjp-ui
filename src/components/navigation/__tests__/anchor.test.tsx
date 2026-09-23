import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithUi } from "@/test/render";

import { Anchor } from "../anchor";
import type { AnchorItemProp } from "../anchor";

/**
 * The scroll positions these assertions are written against.
 *
 * jsdom lays nothing out, so every `getBoundingClientRect` is zeros and no scroll rule could be
 * exercised at all. `tops` is therefore the page: an id mapped to the viewport-relative position
 * of that section's block-start edge, which is precisely the number Ant Design's
 * `getInternalCurrentAnchor` reads. Moving the page is assigning to it.
 */
let tops: Record<string, number> = {};

const ITEMS: AnchorItemProp[] = [
  { key: "a", href: "#alpha", title: "Alpha" },
  { key: "b", href: "#beta", title: "Beta" },
  { key: "c", href: "#gamma", title: "Gamma" },
];

function mountSections(ids: string[]) {
  for (const id of ids) {
    const section = document.createElement("section");
    section.id = id;
    vi.spyOn(section, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
    vi.spyOn(section, "getBoundingClientRect").mockImplementation(
      () => ({ top: tops[id] ?? 0, height: 100, width: 100, bottom: 0 }) as DOMRect,
    );
    document.body.append(section);
  }
}

/** The library only re-resolves when the container says it scrolled. */
function scrollTo(next: Record<string, number>) {
  tops = next;
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}

const activeHref = () =>
  document.querySelector('[data-slot="anchor-link"][data-active]')?.getAttribute("href") ?? null;

beforeEach(() => {
  tops = { alpha: 0, beta: 500, gamma: 1000 };
  window.history.replaceState(null, "", window.location.pathname);
  // jsdom implements neither, and both are load-bearing here.
  vi.stubGlobal("scrollTo", vi.fn());
  Element.prototype.scrollTo = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  for (const section of Array.from(document.querySelectorAll("section"))) section.remove();
});

describe("Anchor — landmark and semantics", () => {
  it("is a NAMED <nav> landmark, because a page carries several navigations", () => {
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(<Anchor items={ITEMS} affix={false} />);
    // The name is the LOCALIZED default (`navigation.anchor.ariaLabel`), which is why the string
    // asserted here is the test harness's locale and not the English one: an `aria-label` that
    // only reads correctly in English is the defect `t()` exists to prevent.
    expect(screen.getByRole("navigation", { name: "Trong trang này" })).toBeInTheDocument();
  });

  it("takes an explicit `label` over the localized default", () => {
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(<Anchor items={ITEMS} affix={false} label="Sections" />);
    expect(screen.getByRole("navigation", { name: "Sections" })).toBeInTheDocument();
  });

  it('marks the current entry `aria-current="location"` — a fragment, never `page`', () => {
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(<Anchor items={ITEMS} affix={false} />);
    const current = screen.getByRole("link", { name: "Alpha" });
    expect(current).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("link", { name: "Beta" })).not.toHaveAttribute("aria-current");
  });

  it("renders REAL links, so they are middle-clickable and work before JavaScript boots", () => {
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(<Anchor items={ITEMS} affix={false} />);
    expect(screen.getByRole("link", { name: "Beta" })).toHaveAttribute("href", "#beta");
  });

  it("puts the ink rail BESIDE the list, never inside the <ul>", () => {
    mountSections(["alpha", "beta", "gamma"]);
    const { container } = renderWithUi(<Anchor items={ITEMS} affix={false} />);
    const list = container.querySelector('ul[data-slot="anchor-list"]')!;
    expect(list.querySelector('[data-slot="anchor-ink"]')).toBeNull();
    expect(container.querySelector('[data-slot="anchor-ink"]')).not.toBeNull();
  });
});

describe("Anchor — Ant Design's resolution rule", () => {
  it("picks the LAST section whose edge has crossed the line", () => {
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(<Anchor items={ITEMS} affix={false} />);
    expect(activeHref()).toBe("#alpha");

    // Two boundaries crossed in one go — the deepest one wins, not the first.
    scrollTo({ alpha: -900, beta: -400, gamma: 100 });
    expect(activeHref()).toBe("#beta");

    scrollTo({ alpha: -1400, beta: -900, gamma: -400 });
    expect(activeHref()).toBe("#gamma");
  });

  it("keeps a section current all the way down it, however much taller than the viewport it is", () => {
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(<Anchor items={ITEMS} affix={false} />);
    scrollTo({ alpha: -9000, beta: -8500, gamma: 4000 });
    expect(activeHref()).toBe("#beta");
    // An IntersectionObserver band would have reported nothing at all here.
    scrollTo({ alpha: -12000, beta: -11500, gamma: 1000 });
    expect(activeHref()).toBe("#beta");
  });

  it("selects nothing while the first section is still below the line", () => {
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(<Anchor items={ITEMS} affix={false} />);
    scrollTo({ alpha: 300, beta: 800, gamma: 1300 });
    expect(activeHref()).toBeNull();
  });

  it("`bounds` is the tolerance on that line — Ant Design's default is 5", () => {
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(<Anchor items={ITEMS} affix={false} />);
    // 4px below the line is still inside the default tolerance; 6px is not.
    scrollTo({ alpha: 4, beta: 800, gamma: 1300 });
    expect(activeHref()).toBe("#alpha");
    scrollTo({ alpha: 6, beta: 800, gamma: 1300 });
    expect(activeHref()).toBeNull();
  });

  it("`offsetBlockStart` moves the line down the scrollport", () => {
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(<Anchor items={ITEMS} affix={false} offsetBlockStart={120} />);
    scrollTo({ alpha: 100, beta: 800, gamma: 1300 });
    expect(activeHref()).toBe("#alpha");
  });

  it("an item's own `targetOffsetBlockStart` outranks the component's", () => {
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(
      <Anchor
        affix={false}
        items={[ITEMS[0], { ...ITEMS[1], targetOffsetBlockStart: 400 }, ITEMS[2]]}
      />,
    );
    // Beta is 300px below the shared line but inside its own.
    scrollTo({ alpha: -100, beta: 300, gamma: 1300 });
    expect(activeHref()).toBe("#beta");
  });

  it("`getCurrentAnchor` has the last word over what the scroll position resolved", () => {
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(<Anchor items={ITEMS} affix={false} getCurrentAnchor={() => "#gamma"} />);
    expect(activeHref()).toBe("#gamma");
  });
});

describe("Anchor — the controlled triad", () => {
  it("`defaultValue` seeds the uncontrolled form before any scroll has an opinion", () => {
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(<Anchor items={ITEMS} affix={false} defaultValue="#beta" />);
    // The mount resolution immediately re-reads the page, which is the correct behaviour — the
    // seed exists for the frame before it, and for a page that resolves to nothing.
    expect(activeHref()).toBe("#alpha");
  });

  it("`value` pins the highlight and the scroll position cannot move it", () => {
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(<Anchor items={ITEMS} affix={false} value="#gamma" />);
    expect(activeHref()).toBe("#gamma");
    scrollTo({ alpha: -900, beta: -400, gamma: 100 });
    expect(activeHref()).toBe("#gamma");
  });

  it("`onValueChange` reports the link the SCROLL POSITION resolved", () => {
    mountSections(["alpha", "beta", "gamma"]);
    const onValueChange = vi.fn();
    renderWithUi(<Anchor items={ITEMS} affix={false} onValueChange={onValueChange} />);
    onValueChange.mockClear();
    scrollTo({ alpha: -900, beta: -400, gamma: 100 });
    expect(onValueChange).toHaveBeenCalledWith("#beta");
  });

  it("does not re-fire while the answer is unchanged", () => {
    mountSections(["alpha", "beta", "gamma"]);
    const onValueChange = vi.fn();
    renderWithUi(<Anchor items={ITEMS} affix={false} onValueChange={onValueChange} />);
    onValueChange.mockClear();
    scrollTo({ alpha: -10, beta: 800, gamma: 1300 });
    scrollTo({ alpha: -20, beta: 790, gamma: 1290 });
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("Anchor — the landing hash is state, and it needs no scroll event", () => {
  it("selects the hashed section on the FIRST render, before any effect runs", () => {
    mountSections(["alpha", "beta", "gamma"]);
    window.history.replaceState(null, "", "#gamma");
    renderWithUi(<Anchor items={ITEMS} affix={false} />);
    // Note what this proves: `tops` still says alpha is the section at the line, so a resolution
    // from scroll position would have answered `#alpha`. Nothing scrolled, and the answer is the
    // hash — which is the whole acceptance criterion of gh#828.
    expect(activeHref()).toBe("#gamma");
  });

  it("ignores a hash that names no entry", () => {
    mountSections(["alpha", "beta", "gamma"]);
    window.history.replaceState(null, "", "#nowhere");
    renderWithUi(<Anchor items={ITEMS} affix={false} />);
    expect(activeHref()).toBe("#alpha");
  });

  it("decodes a percent-encoded hash — a CJK or spaced section id round-trips", () => {
    mountSections(["alpha", "概要", "gamma"]);
    tops = { alpha: 0, 概要: 500, gamma: 1000 };
    window.history.replaceState(null, "", `#${encodeURIComponent("概要")}`);
    renderWithUi(
      <Anchor
        affix={false}
        items={[ITEMS[0], { key: "b", href: "#概要", title: "概要" }, ITEMS[2]]}
      />,
    );
    expect(activeHref()).toBe("#概要");
  });
});

describe("Anchor — a click must not fight the resolver (the flicker)", () => {
  it("selects the clicked entry and holds it while the programmatic scroll is in flight", () => {
    vi.useFakeTimers();
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(<Anchor items={ITEMS} affix={false} />);

    fireEvent.click(screen.getByRole("link", { name: "Gamma" }));
    expect(activeHref()).toBe("#gamma");

    // Every frame the smooth scroll passes through. Without suppression each of these re-picks,
    // which is exactly the flicker gh#828 describes.
    scrollTo({ alpha: -200, beta: 300, gamma: 800 });
    scrollTo({ alpha: -600, beta: -100, gamma: 400 });
    expect(activeHref()).toBe("#gamma");
  });

  it("resumes tracking once the container has stopped emitting scroll", () => {
    vi.useFakeTimers();
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(<Anchor items={ITEMS} affix={false} />);

    fireEvent.click(screen.getByRole("link", { name: "Gamma" }));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    scrollTo({ alpha: -900, beta: -400, gamma: 100 });
    expect(activeHref()).toBe("#beta");
  });

  it("a real gesture takes the scroll back, and the resolver with it", () => {
    vi.useFakeTimers();
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(<Anchor items={ITEMS} affix={false} />);

    fireEvent.click(screen.getByRole("link", { name: "Gamma" }));
    act(() => {
      window.dispatchEvent(new Event("wheel"));
    });
    scrollTo({ alpha: -900, beta: -400, gamma: 100 });
    expect(activeHref()).toBe("#beta");
  });

  it("scrolls to the section, offset by the landing clearance, and moves FOCUS there", () => {
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(<Anchor items={ITEMS} affix={false} targetOffsetBlockStart={80} />);

    fireEvent.click(screen.getByRole("link", { name: "Beta" }));
    // scrollTop (0 in jsdom) + the section's own top (500) − the clearance (80).
    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 420, behavior: "smooth" }),
    );
    const section = document.getElementById("beta")!;
    expect(section).toHaveAttribute("tabindex", "-1");
    expect(document.activeElement).toBe(section);
  });

  it("pushes the hash by default and replaces it when asked", () => {
    mountSections(["alpha", "beta", "gamma"]);
    const { unmount } = renderWithUi(<Anchor items={ITEMS} affix={false} />);
    fireEvent.click(screen.getByRole("link", { name: "Beta" }));
    expect(window.location.hash).toBe("#beta");
    unmount();

    renderWithUi(<Anchor items={ITEMS} affix={false} replace />);
    const before = window.history.length;
    fireEvent.click(screen.getByRole("link", { name: "Gamma" }));
    expect(window.location.hash).toBe("#gamma");
    expect(window.history.length).toBe(before);
  });

  it("never hijacks a modified click — open-in-new-tab keeps working", () => {
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(<Anchor items={ITEMS} affix={false} />);
    fireEvent.click(screen.getByRole("link", { name: "Beta" }), { metaKey: true });
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("`onClick` fires with the event and the item, before the scroll", () => {
    mountSections(["alpha", "beta", "gamma"]);
    const onClick = vi.fn();
    renderWithUi(<Anchor items={ITEMS} affix={false} onClick={onClick} />);
    fireEvent.click(screen.getByRole("link", { name: "Beta" }));
    expect(onClick).toHaveBeenCalledWith(expect.anything(), ITEMS[1]);
  });
});

describe("Anchor — reduced motion jumps rather than tweening (WCAG 2.3.3)", () => {
  it('uses `behavior: "auto"` under `prefers-reduced-motion: reduce`', () => {
    mountSections(["alpha", "beta", "gamma"]);
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true, addEventListener() {}, removeEventListener() {} })),
    );
    renderWithUi(<Anchor items={ITEMS} affix={false} />);
    fireEvent.click(screen.getByRole("link", { name: "Beta" }));
    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "auto", top: 500 }),
    );
  });
});

describe("Anchor — nesting, direction, and antd's spellings", () => {
  it("renders ONE level of `items[].children` when vertical", () => {
    mountSections(["alpha", "alpha-one", "beta", "gamma"]);
    renderWithUi(
      <Anchor
        affix={false}
        items={[
          { ...ITEMS[0], children: [{ key: "a1", href: "#alpha-one", title: "Alpha one" }] },
          ITEMS[1],
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "Alpha one" })).toBeInTheDocument();
  });

  it("DROPS nested children when horizontal, and warns — as Ant Design does", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mountSections(["alpha", "alpha-one", "beta"]);
    renderWithUi(
      <Anchor
        affix={false}
        direction="horizontal"
        items={[
          { ...ITEMS[0], children: [{ key: "a1", href: "#alpha-one", title: "Alpha one" }] },
          ITEMS[1],
        ]}
      />,
    );
    expect(screen.queryByRole("link", { name: "Alpha one" })).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("horizontal"));
  });

  it("`onChange` warns and is ignored — the triad's name is `onValueChange`", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mountSections(["alpha", "beta", "gamma"]);
    const onChange = vi.fn();
    renderWithUi(
      // @ts-expect-error — typed `never`: antd's spelling is a compile error naming the replacement.
      <Anchor items={ITEMS} affix={false} onChange={onChange} />,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("onValueChange"));
    scrollTo({ alpha: -900, beta: -400, gamma: 100 });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("`offsetTop` and `targetOffset` warn and are ignored", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(
      // @ts-expect-error — both are typed `never`.
      <Anchor items={ITEMS} affix={false} offsetTop={100} targetOffset={100} />,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("offsetBlockStart"));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("targetOffsetBlockStart"));
    // The line did NOT move: alpha 100px below the viewport top is outside the default tolerance.
    scrollTo({ alpha: 100, beta: 800, gamma: 1300 });
    expect(activeHref()).toBeNull();
  });

  it("withholds the travelling ink with `affix={false}` unless `showInkInFixed` asks for it", () => {
    mountSections(["alpha", "beta", "gamma"]);
    const { container, unmount } = renderWithUi(<Anchor items={ITEMS} affix={false} />);
    expect(container.querySelector('[data-slot="anchor"]')).toHaveAttribute("data-ink", "hidden");
    unmount();

    const second = renderWithUi(<Anchor items={ITEMS} affix={false} showInkInFixed />);
    expect(second.container.querySelector('[data-slot="anchor"]')).not.toHaveAttribute("data-ink");
  });
});

describe("Anchor — `target` (gh#890)", () => {
  /**
   * `Affix` has always taken `target`; `Anchor` had no way to be told what it scrolls within, so
   * an affixed `Anchor` could only ever pin to the viewport — and, because `resolveFromScroll`
   * and the scroll listeners run off the SAME `container()` this pin does, a `target` that missed
   * either half would be worse than none (a bar pinned to a pane whose highlight still tracked
   * the document). This asserts both halves move together.
   */
  it("scopes BOTH the scroll-spy and the pin to `target`, not the viewport", () => {
    const pane = document.createElement("div");
    document.body.append(pane);
    vi.spyOn(pane, "getBoundingClientRect").mockReturnValue({ top: 0 } as DOMRect);
    const paneAddEventListener = vi.spyOn(pane, "addEventListener");
    const windowAddEventListener = vi.spyOn(window, "addEventListener");

    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(<Anchor items={ITEMS} affix={false} target={() => pane} />);

    // The scroll-spy listens on the TARGET, never on the viewport.
    expect(paneAddEventListener).toHaveBeenCalledWith("scroll", expect.any(Function), {
      passive: true,
    });
    expect(windowAddEventListener).not.toHaveBeenCalledWith("scroll", expect.any(Function), {
      passive: true,
    });
    expect(activeHref()).toBe("#alpha");

    // Scrolling the PANE re-resolves the current section...
    tops = { alpha: -600, beta: -100, gamma: 400 };
    act(() => {
      pane.dispatchEvent(new Event("scroll"));
    });
    expect(activeHref()).toBe("#beta");

    // ...scrolling the VIEWPORT, which this Anchor no longer watches, must not.
    tops = { alpha: -1200, beta: -700, gamma: -200 };
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(activeHref()).toBe("#beta");

    pane.remove();
  });

  it("`target` wins over the legacy `getContainer` when both are given", () => {
    const pane = document.createElement("div");
    document.body.append(pane);
    vi.spyOn(pane, "getBoundingClientRect").mockReturnValue({ top: 0 } as DOMRect);
    const paneAddEventListener = vi.spyOn(pane, "addEventListener");

    mountSections(["alpha", "beta", "gamma"]);
    renderWithUi(
      <Anchor items={ITEMS} affix={false} target={() => pane} getContainer={() => window} />,
    );

    expect(paneAddEventListener).toHaveBeenCalledWith("scroll", expect.any(Function), {
      passive: true,
    });

    pane.remove();
  });
});
