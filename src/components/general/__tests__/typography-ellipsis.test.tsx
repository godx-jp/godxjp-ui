import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Paragraph, Text } from "../typography";

/**
 * antd `ellipsis` — `EllipsisConfig` in antd 6.6.3.
 *
 * jsdom reports 0 for every layout box, so "does this run overflow?" has to be STUBBED to be
 * measured at all — and the re-measure has to be driven through the same `ResizeObserver` a browser
 * would use, because the global stub in `vitest.setup.ts` never invokes its callback.
 *
 * That is exactly the claim this port's CSS path makes and antd's JS path does not: antd
 * binary-searches a character index across three off-screen probe spans, which no assertion in this
 * repo's test environment could ever reach. Stubbing two numbers and firing one observer is the
 * difference between a verified contract and a screenshot.
 */
const resizeCallbacks: (() => void)[] = [];

beforeEach(() => {
  resizeCallbacks.length = 0;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resizeCallbacks.push(callback);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Make one element report that it is clipping its own content, then let the observer notice. */
function clip(el: Element) {
  for (const [prop, value] of [
    ["scrollHeight", 120],
    ["clientHeight", 40],
    ["scrollWidth", 320],
    ["clientWidth", 120],
  ] as const) {
    Object.defineProperty(el, prop, { value, configurable: true });
  }
  act(() => {
    for (const fire of resizeCallbacks) fire();
  });
}

function run(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('[data-slot="text"]');
  if (!el) throw new Error('no [data-slot="text"] in the tree');
  return el;
}

describe("Text — ellipsis", () => {
  it("is the single-line contract when set to true", () => {
    render(<Text ellipsis>とても長い件名</Text>);
    const el = screen.getByText("とても長い件名");
    expect(el).toHaveAttribute("data-ellipsis", "");
    expect(el).toHaveAttribute("data-truncate", "");
  });

  it("outranks truncate and clamp, and says so in dev", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Text ellipsis clamp={3}>
        件名
      </Text>,
    );
    const el = screen.getByText("件名");
    // `ellipsis` won: one line, not three.
    expect(el).toHaveAttribute("data-truncate", "");
    expect(el).not.toHaveAttribute("data-clamp");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("`ellipsis` takes precedence"));
  });

  it("leaves truncate and clamp exactly as they were when `ellipsis` is absent", () => {
    // The backward-compatibility contract for the two props that already shipped.
    const { rerender } = render(<Text truncate>件名</Text>);
    expect(screen.getByText("件名")).toHaveAttribute("data-truncate", "");
    rerender(<Text clamp={2}>件名</Text>);
    const el = screen.getByText("件名");
    expect(el).toHaveAttribute("data-clamp", "");
    expect(el.style.getPropertyValue("--text-clamp")).toBe("2");
    expect(el).not.toHaveAttribute("data-ellipsis");
  });

  it("pins a suffix after the ellipsis", () => {
    render(<Text ellipsis={{ suffix: "--EOF" }}>ログ</Text>);
    expect(screen.getByText("--EOF")).toBeInTheDocument();
  });

  it("never writes its own ellipsis characters — CSS already draws one", () => {
    // antd emits a literal `<span aria-hidden>...</span>` because antd CUTS the string in JS and
    // nothing else would mark the cut. Here the browser draws the ellipsis (`text-overflow` /
    // `line-clamp`), so emitting antd's three periods as well would render TWO — the visible
    // symptom of porting the markup instead of the behaviour.
    const { container } = render(<Text ellipsis={{ suffix: "件" }}>とても長い件名</Text>);
    clip(run(container));
    expect(container.textContent).not.toContain("...");
    expect(container.textContent).toContain("件");
  });
});

describe("Paragraph — ellipsis rows and expansion", () => {
  it("maps antd's `rows` onto the clamp this library already owns", () => {
    const { container } = render(<Paragraph ellipsis={{ rows: 3 }}>長い説明</Paragraph>);
    const el = run(container);
    expect(el).toHaveAttribute("data-clamp", "");
    expect(el.style.getPropertyValue("--text-clamp")).toBe("3");
  });

  it("reports the measured overflow through onEllipsis, and only when it flips", () => {
    const onEllipsis = vi.fn();
    const { container } = render(<Paragraph ellipsis={{ rows: 2, onEllipsis }}>説明</Paragraph>);
    // Fits: no call, because nothing changed from the initial `false`.
    expect(onEllipsis).not.toHaveBeenCalled();

    clip(run(container));
    expect(onEllipsis).toHaveBeenCalledWith(true);

    // A second observer tick with the same geometry must NOT re-fire — antd guards the same way.
    act(() => {
      for (const fire of resizeCallbacks) fire();
    });
    expect(onEllipsis).toHaveBeenCalledTimes(1);
  });

  it("shows the expand control only once the text is actually clipped", () => {
    const { container } = render(
      <Paragraph ellipsis={{ rows: 2, expandable: true }}>説明</Paragraph>,
    );
    // antd hides it for text that fits, and so does this: an "Expand" on a three-word paragraph is
    // a control that does nothing.
    expect(screen.queryByRole("button", { name: "Mở rộng" })).toBeNull();

    clip(run(container));
    expect(screen.getByRole("button", { name: "Mở rộng" })).toBeInTheDocument();
  });

  it("expands on click, releases the clamp, and reports through onExpand", async () => {
    const user = userEvent.setup();
    const onExpand = vi.fn();
    const { container } = render(
      <Paragraph ellipsis={{ rows: 2, expandable: true, onExpand }}>長い説明</Paragraph>,
    );
    clip(run(container));

    const button = screen.getByRole("button", { name: "Mở rộng" });
    // A disclosure control states its own state. WAI-ARIA APG owns this layer (DESIGN-AUTHORITY)
    // and outranks antd, which ships only an aria-label.
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);

    expect(onExpand).toHaveBeenCalledWith(expect.anything(), { expanded: true });
    // antd releases the clamp entirely once expanded, unless `expandable: "collapsible"`.
    expect(run(container)).toHaveAttribute("data-expanded", "");
    expect(screen.queryByRole("button", { name: "Mở rộng" })).toBeNull();
  });

  it("keeps a collapse control when expandable is 'collapsible'", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Paragraph ellipsis={{ rows: 2, expandable: "collapsible" }}>長い説明</Paragraph>,
    );
    clip(run(container));

    await user.click(screen.getByRole("button", { name: "Mở rộng" }));
    const collapse = screen.getByRole("button", { name: "Thu gọn" });
    expect(collapse).toHaveAttribute("aria-expanded", "true");
  });

  it("takes a caller's `symbol`, including the function form", async () => {
    const user = userEvent.setup();
    const symbol = (expanded: boolean) => (expanded ? "閉じる" : "もっと見る");
    const { container } = render(
      <Paragraph ellipsis={{ rows: 2, expandable: "collapsible", symbol }}>長い説明</Paragraph>,
    );
    clip(run(container));

    expect(screen.getByText("もっと見る")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mở rộng" }));
    expect(screen.getByText("閉じる")).toBeInTheDocument();
  });

  it("honours defaultExpanded and a controlled expanded", () => {
    const { container, rerender } = render(
      <Paragraph ellipsis={{ rows: 2, expandable: true, defaultExpanded: true }}>説明</Paragraph>,
    );
    expect(run(container)).toHaveAttribute("data-expanded", "");

    rerender(<Paragraph ellipsis={{ rows: 2, expandable: true, expanded: false }}>説明</Paragraph>);
    expect(run(container)).not.toHaveAttribute("data-expanded");
  });

  it("moves the clamp onto an inner wrapper when an action cluster shares the run", () => {
    // THE DOCUMENTED DEVIATION, measured. `-webkit-line-clamp` clips everything inside its box, so
    // an expand button placed inline would be invisible at exactly the moment it is needed. The
    // clamp therefore moves to a wrapper and the cluster becomes its sibling. antd solves the same
    // problem by re-slicing the text in JS; the prop surface is identical, the pixels differ.
    const { container } = render(
      <Paragraph ellipsis={{ rows: 2, expandable: true }}>長い説明</Paragraph>,
    );
    clip(run(container));

    const outer = run(container);
    const wrapper = container.querySelector<HTMLElement>('[data-slot="typography-content"]');
    expect(outer).not.toHaveAttribute("data-clamp");
    expect(wrapper).toHaveAttribute("data-clamp", "");
    expect(wrapper?.style.getPropertyValue("--text-clamp")).toBe("2");
    // The cluster is a SIBLING of the clamped box, never inside it.
    expect(wrapper?.querySelector('[data-slot="typography-actions"]')).toBeNull();
    expect(outer.querySelector('[data-slot="typography-actions"]')).not.toBeNull();
  });

  it("keeps the clamp on the element itself when nothing shares the run", () => {
    // The plain case must stay byte-for-byte what `clamp` always rendered — no extra wrapper.
    const { container } = render(<Paragraph ellipsis={{ rows: 2 }}>長い説明</Paragraph>);
    expect(run(container)).toHaveAttribute("data-clamp", "");
    expect(container.querySelector('[data-slot="typography-content"]')).toBeNull();
  });
});
