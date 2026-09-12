import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { FloatButton } from "../float-button";

const layout = () =>
  readFileSync(join(process.cwd(), "src/styles/float-button-layout.css"), "utf8");
const tokens = () =>
  readFileSync(join(process.cwd(), "src/tokens/components/float-button.css"), "utf8");
const rule = (selector: string) =>
  layout().match(
    new RegExp(`${selector.replace(/[.[\]"^$*+?()|{}\\]/g, "\\$&")}\\s*\\{[^}]*\\}`),
  )?.[0] ?? "";

describe("FloatButton — the antd 6.6.3 surface", () => {
  it("is a real button, and a string tooltip becomes its accessible name", async () => {
    renderWithUi(<FloatButton tooltip="Ask the assistant" />);

    const button = screen.getByRole("button", { name: "Ask the assistant" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-shape", "circle");
    expect(button).toHaveAttribute("data-type", "default");
  });

  it("an explicit aria-label still wins over the tooltip", () => {
    renderWithUi(<FloatButton tooltip="Hover text" aria-label="Open composer" />);

    expect(screen.getByRole("button", { name: "Open composer" })).toBeInTheDocument();
  });

  it("renders an anchor when `href` is given, carrying `target`", () => {
    renderWithUi(<FloatButton href="/docs" target="_blank" aria-label="Docs" />);

    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("`htmlType` carries the native button type, because `type` is antd's word for the fill", () => {
    const { rerender } = renderWithUi(
      <FloatButton htmlType="submit" type="primary" aria-label="Send" />,
    );

    const button = screen.getByRole("button", { name: "Send" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("data-type", "primary");

    rerender(<FloatButton htmlType="reset" type="default" aria-label="Send" />);
    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute("type", "reset");
    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute("data-type", "default");
  });

  it("`disabled` is the native disabled, both ways round", () => {
    const { rerender } = renderWithUi(<FloatButton disabled={false} aria-label="A" />);
    expect(screen.getByRole("button", { name: "A" })).toBeEnabled();

    rerender(<FloatButton disabled aria-label="A" />);
    expect(screen.getByRole("button", { name: "A" })).toBeDisabled();
  });

  it("a disabled anchor loses its href rather than pretending to be a link you can follow", () => {
    renderWithUi(<FloatButton href="/docs" disabled aria-label="Docs" />);

    const anchor = screen.getByLabelText("Docs");
    expect(anchor).not.toHaveAttribute("href");
    expect(anchor).toHaveAttribute("aria-disabled", "true");
  });

  /**
   * antd 6 renamed `description` to `content` and kept the old name working, resolving
   * `content ?? description`. Both spellings must land on the same rendered line or an antd call
   * site copied across breaks silently — no type error, just a button with no caption.
   */
  it("accepts antd's deprecated `description` as an alias for `content`, and `content` wins", () => {
    const { rerender } = renderWithUi(
      <FloatButton shape="square" description="Legacy" aria-label="A" />,
    );
    expect(screen.getByText("Legacy")).toBeInTheDocument();

    rerender(<FloatButton shape="square" description="Legacy" content="Current" aria-label="A" />);
    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.queryByText("Legacy")).not.toBeInTheDocument();
  });

  it("warns when a circle is asked to carry text — antd's own dev warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderWithUi(<FloatButton content="too long for a circle" aria-label="A" />);

    expect(warn.mock.calls.flat().join(" ")).toContain("`shape` is `square`");
    warn.mockRestore();
  });

  it("a square keeps its inline size and records the shape for the stylesheet", () => {
    renderWithUi(<FloatButton shape="square" content="Ghi chú" aria-label="A" />);
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("data-shape", "square");
  });

  it("falls back to a glyph only when there is neither an icon nor content", () => {
    const { container } = renderWithUi(<FloatButton aria-label="A" />);
    expect(container.querySelectorAll(".ui-float-button-icon > svg")).toHaveLength(1);
  });
});

describe("FloatButton badge — antd's count / dot / overflowCount / showZero", () => {
  it("renders the count, and caps it at `overflowCount`", () => {
    const { rerender } = renderWithUi(<FloatButton badge={{ count: 5 }} aria-label="A" />);
    expect(screen.getByText("5")).toBeInTheDocument();

    rerender(<FloatButton badge={{ count: 120 }} aria-label="A" />);
    expect(screen.getByText("99+")).toBeInTheDocument();

    rerender(<FloatButton badge={{ count: 120, overflowCount: 9 }} aria-label="A" />);
    expect(screen.getByText("9+")).toBeInTheDocument();
  });

  it("hides a zero count unless `showZero`, which is antd's default", () => {
    const { container, rerender } = renderWithUi(
      <FloatButton badge={{ count: 0 }} aria-label="A" />,
    );
    expect(container.querySelector('[data-slot="float-button-badge"]')).toBeNull();

    rerender(<FloatButton badge={{ count: 0, showZero: true }} aria-label="A" />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("`dot` is a mark with no figure", () => {
    const { container } = renderWithUi(<FloatButton badge={{ dot: true }} aria-label="A" />);

    const mark = container.querySelector('[data-slot="float-button-badge"]');
    expect(mark).not.toBeNull();
    expect(mark).toHaveAttribute("data-dot");
    expect(mark).toHaveTextContent("");
  });
});

/** A real `attachShadow` tree with a mount point inside it — jsdom retargets for it exactly as a
 * browser does, which is what makes the two shadow-root tests below worth anything. */
function mountShadowHost() {
  const host = document.createElement("div");
  document.body.append(host);
  const shadow = host.attachShadow({ mode: "open" });
  shadow.append(document.createElement("div"));
  return { host, shadow };
}

describe("FloatButton.Group", () => {
  it("without `trigger` it is a plain stack: every child visible, no trigger drawn", () => {
    renderWithUi(
      <FloatButton.Group>
        <FloatButton aria-label="One" />
        <FloatButton aria-label="Two" />
      </FloatButton.Group>,
    );

    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it('with `trigger="click"` the children stay closed until the trigger is pressed', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(
      <FloatButton.Group trigger="click" onOpenChange={onOpenChange} aria-label="Actions">
        <FloatButton aria-label="One" />
      </FloatButton.Group>,
    );

    expect(screen.queryByRole("button", { name: "One" })).not.toBeInTheDocument();

    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(screen.getByRole("button", { name: "One" })).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await user.click(trigger);
    expect(screen.queryByRole("button", { name: "One" })).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('opens and closes on hover when `trigger="hover"`', async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(
      <FloatButton.Group trigger="hover" aria-label="Actions">
        <FloatButton aria-label="One" />
      </FloatButton.Group>,
    );

    const root = container.querySelector('[data-slot="float-button-group"]') as HTMLElement;
    await user.hover(root);
    expect(screen.getByRole("button", { name: "One" })).toBeInTheDocument();

    await user.unhover(root);
    expect(screen.queryByRole("button", { name: "One" })).not.toBeInTheDocument();
  });

  it("a controlled `open` is not moved by the trigger — only `onOpenChange` fires", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(
      <FloatButton.Group trigger="click" open={false} onOpenChange={onOpenChange} aria-label="A">
        <FloatButton aria-label="One" />
      </FloatButton.Group>,
    );

    await user.click(screen.getByRole("button", { name: "A" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("button", { name: "One" })).not.toBeInTheDocument();
  });

  it("swaps the trigger glyph for `closeIcon` while open", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <FloatButton.Group trigger="click" aria-label="A" closeIcon={<span>close-mark</span>}>
        <FloatButton aria-label="One" />
      </FloatButton.Group>,
    );

    expect(screen.queryByText("close-mark")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "A" }));
    expect(screen.getByText("close-mark")).toBeInTheDocument();
  });

  it("children inherit the group's `shape`, so a stack cannot mix circles and squares", async () => {
    renderWithUi(
      <FloatButton.Group shape="square">
        <FloatButton aria-label="One" shape="circle" />
      </FloatButton.Group>,
    );

    expect(screen.getByRole("button", { name: "One" })).toHaveAttribute("data-shape", "square");
  });

  it("records the placement on the root, so the stylesheet can hang the list off the trigger", () => {
    const { container } = renderWithUi(
      <FloatButton.Group trigger="click" placement="left" aria-label="A">
        <FloatButton aria-label="One" />
      </FloatButton.Group>,
    );

    const root = container.querySelector('[data-slot="float-button-group"]');
    expect(root).toHaveAttribute("data-placement", "left");
    expect(root).toHaveAttribute("data-menu-mode");
  });

  it("an unknown placement falls back to antd's `top` rather than emitting it", () => {
    const { container } = renderWithUi(
      // @ts-expect-error — deliberately outside the union, the way a JS call site can be
      <FloatButton.Group trigger="click" placement="sideways" aria-label="A">
        <FloatButton aria-label="One" />
      </FloatButton.Group>,
    );

    expect(container.querySelector('[data-slot="float-button-group"]')).toHaveAttribute(
      "data-placement",
      "top",
    );
  });

  it("a click outside closes the menu", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <>
        <button type="button">elsewhere</button>
        <FloatButton.Group trigger="click" aria-label="A">
          <FloatButton aria-label="One" />
        </FloatButton.Group>
      </>,
    );

    await user.click(screen.getByRole("button", { name: "A" }));
    expect(screen.getByRole("button", { name: "One" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "elsewhere" }));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "One" })).not.toBeInTheDocument(),
    );
  });

  /**
   * THE FIRST OF THE TWO THINGS gh#558 ASKED FOR BEYOND THE PORT, and it has two halves that fail
   * in opposite directions. Each of the next two tests pins one of them.
   *
   * Half one: antd tests `root.contains(event.target)`, and inside a shadow root the target is
   * RETARGETED to the host before a document listener sees it — so that test is false for a click
   * on the group's OWN trigger and the menu closes on the same click that opened it.
   * `composedPath()` is not retargeted, so it sees the real trigger.
   */
  it("survives a shadow root: the trigger's own click does not close the menu", async () => {
    const user = userEvent.setup();
    const { shadow, host } = mountShadowHost();

    renderWithUi(
      <FloatButton.Group trigger="click" aria-label="A">
        <FloatButton aria-label="One" />
      </FloatButton.Group>,
      { container: shadow.firstElementChild as HTMLElement },
    );

    const trigger = shadow.querySelector(
      '[data-slot="float-button-group"] .ui-float-button-trigger',
    ) as HTMLElement;
    await user.click(trigger);

    expect(shadow.querySelectorAll('[data-slot="float-button"]')).toHaveLength(2);
    host.remove();
  });

  /**
   * Half two, and the reason the listener stays on the DOCUMENT. Binding it to the group's own
   * `getRootNode()` closes the retargeting hole and opens a worse one: an event OUTSIDE the shadow
   * tree never reaches a listener bound inside it, so a click anywhere else on the page would leave
   * the menu open forever. Mutation testing found this; without this test the bug shipped.
   */
  it("survives a shadow root the other way: a click out in the page still closes it", async () => {
    const user = userEvent.setup();
    const { shadow, host } = mountShadowHost();
    const outside = document.createElement("button");
    outside.type = "button";
    outside.textContent = "out in the page";
    document.body.append(outside);

    renderWithUi(
      <FloatButton.Group trigger="click" aria-label="A">
        <FloatButton aria-label="One" />
      </FloatButton.Group>,
      { container: shadow.firstElementChild as HTMLElement },
    );

    const trigger = shadow.querySelector(
      '[data-slot="float-button-group"] .ui-float-button-trigger',
    ) as HTMLElement;
    await user.click(trigger);
    expect(shadow.querySelectorAll('[data-slot="float-button"]')).toHaveLength(2);

    await user.click(outside);
    await waitFor(() =>
      expect(shadow.querySelectorAll('[data-slot="float-button"]')).toHaveLength(1),
    );

    outside.remove();
    host.remove();
  });

  /**
   * The case that actually separates `composedPath()` from `root.contains(event.target)`, and the
   * reason a single trigger click did not: on the FIRST click the document listener runs in the
   * capture phase while the menu is still closed, so closing it again is a no-op and either
   * spelling "passes". Pressing an ITEM while the menu is OPEN is where they part company — the
   * retargeted target is the shadow HOST, which is an ANCESTOR of the group and therefore not
   * `contains`ed by it, so antd's spelling treats the group's own item as an outside click and
   * shuts the menu on the way to running the action.
   */
  it("a shadow-rooted menu stays open when one of its own items is pressed", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const { shadow, host } = mountShadowHost();

    renderWithUi(
      <FloatButton.Group trigger="click" aria-label="A">
        <FloatButton aria-label="One" onClick={onAction} />
      </FloatButton.Group>,
      { container: shadow.firstElementChild as HTMLElement },
    );

    const trigger = shadow.querySelector(".ui-float-button-trigger") as HTMLElement;
    await user.click(trigger);
    const item = shadow.querySelector('[aria-label="One"]') as HTMLElement;
    await user.click(item);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(shadow.querySelectorAll('[data-slot="float-button"]')).toHaveLength(2);
    host.remove();
  });

  it("a controlled `open` of true renders the stack with no interaction at all", () => {
    renderWithUi(
      <FloatButton.Group trigger="click" open onOpenChange={() => {}} aria-label="A">
        <FloatButton aria-label="One" />
      </FloatButton.Group>,
    );

    expect(screen.getByRole("button", { name: "One" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-expanded", "true");
  });
});

describe("FloatButton.BackTop", () => {
  it("stays out of the document until the reader is `visibilityHeight` down", async () => {
    renderWithUi(<FloatButton.BackTop visibilityHeight={200} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    document.documentElement.scrollTop = 250;
    window.dispatchEvent(new Event("scroll"));

    await waitFor(() => expect(screen.getByRole("button")).toBeInTheDocument());
    document.documentElement.scrollTop = 0;
  });

  it("is visible from the first frame when `visibilityHeight` is 0, and names itself", () => {
    renderWithUi(<FloatButton.BackTop visibilityHeight={0} />);

    // renderWithUi defaults to the `vi` locale — the name comes from t(), not a literal.
    expect(screen.getByRole("button", { name: "Về đầu trang" })).toBeInTheDocument();
  });

  it("scrolls the container it was given back to the top", async () => {
    const user = userEvent.setup();
    const region = document.createElement("div");
    document.body.append(region);
    region.scrollTop = 900;

    renderWithUi(<FloatButton.BackTop visibilityHeight={0} duration={0} target={() => region} />);
    await user.click(screen.getByRole("button", { name: "Về đầu trang" }));

    expect(region.scrollTop).toBe(0);
    region.remove();
  });

  /**
   * `duration` is a real tween, not decoration: antd's own easeInOutCubic over that many
   * milliseconds. The proof it is animating rather than teleporting is that the container has NOT
   * arrived by the time the click handler returns — a jump straight to 0 would pass "it reaches the
   * top" just as well, which is why that assertion alone left this branch untested.
   */
  it("`duration` animates the scroll rather than teleporting", async () => {
    const user = userEvent.setup();
    const region = document.createElement("div");
    document.body.append(region);
    region.scrollTop = 900;

    renderWithUi(<FloatButton.BackTop visibilityHeight={0} duration={400} target={() => region} />);
    await user.click(screen.getByRole("button", { name: "Về đầu trang" }));

    expect(region.scrollTop).toBeGreaterThan(0);
    await waitFor(() => expect(region.scrollTop).toBe(0), { timeout: 2000 });
    region.remove();
  });

  it("takes the instant path under prefers-reduced-motion (WCAG 2.3.3)", async () => {
    const user = userEvent.setup();
    const real = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      ...real(query),
      matches: query.includes("prefers-reduced-motion"),
    })) as typeof window.matchMedia;

    const region = document.createElement("div");
    document.body.append(region);
    region.scrollTop = 900;

    renderWithUi(<FloatButton.BackTop visibilityHeight={0} duration={400} target={() => region} />);
    await user.click(screen.getByRole("button", { name: "Về đầu trang" }));

    // Same `duration`, and no tween at all: it is already there.
    expect(region.scrollTop).toBe(0);

    window.matchMedia = real;
    region.remove();
  });

  it("watches the container it was given, not the document", async () => {
    const region = document.createElement("div");
    document.body.append(region);

    renderWithUi(<FloatButton.BackTop visibilityHeight={100} target={() => region} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    // The DOCUMENT moving must not reveal it…
    document.documentElement.scrollTop = 500;
    window.dispatchEvent(new Event("scroll"));
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    // …only the region it was pointed at.
    region.scrollTop = 500;
    region.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(screen.getByRole("button")).toBeInTheDocument());

    document.documentElement.scrollTop = 0;
    region.remove();
  });

  it("publishes scroll progress as a custom property, never as inline geometry", async () => {
    const region = document.createElement("div");
    document.body.append(region);
    Object.defineProperty(region, "scrollHeight", { value: 1000, configurable: true });
    Object.defineProperty(region, "clientHeight", { value: 500, configurable: true });

    renderWithUi(<FloatButton.BackTop visibilityHeight={0} showProgress target={() => region} />);
    region.scrollTop = 250;
    region.dispatchEvent(new Event("scroll"));

    await waitFor(() =>
      expect(
        screen.getByRole("button").style.getPropertyValue("--float-button-progress-offset"),
      ).toBe("0.5turn"),
    );
    region.remove();
  });
});

/**
 * The stylesheet carries the two contracts gh#558 filed the issue for. They are asserted on the
 * CSS text rather than on a computed style because jsdom resolves neither `position: fixed` nor a
 * `var()`, and asserting a Tailwind class here is a gate failure by design.
 */
describe("the layout contract", () => {
  it("pins the control itself to the corner through the two named insets", () => {
    const control = rule(".ui-float-button");

    expect(control).toContain("position: fixed");
    expect(control).toContain("inset-block-end: var(--float-button-offset-block-end)");
    expect(control).toContain("inset-inline-end: var(--float-button-offset-inline-end)");
    expect(tokens()).toContain("--float-button-offset-block-end:");
    expect(tokens()).toContain("--float-button-offset-inline-end:");
  });

  it("writes no physical side anywhere, so the corner flips under dir=rtl", () => {
    expect(layout()).not.toMatch(/^\s*(?:right|left):/m);
    expect(layout()).not.toMatch(/(?:margin|padding|border|inset)-(?:left|right)\b/);
  });

  /**
   * THE SECOND OF THE TWO THINGS gh#558 ASKED FOR. A group's root spans its buttons AND the gaps
   * between them; on a touch viewport every empty pixel of it is a place a page swipe dies. The
   * root is transparent to the pointer and each control takes its own events back.
   */
  it("lets a touch scroll pass through a group's empty area", () => {
    expect(rule(".ui-float-button-group")).toContain("pointer-events: none");
    expect(rule(".ui-float-button-group .ui-float-button")).toContain("pointer-events: auto");
  });

  it("carries no hand-written length — every size is a token", () => {
    const declarations = layout().replace(/\/\*[\s\S]*?\*\//g, "");
    expect(declarations).not.toMatch(/:\s*-?\d+(?:\.\d+)?(?:px|rem|em)\b/);
  });
});
