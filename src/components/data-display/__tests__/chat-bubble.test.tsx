import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as React from "react";
import { act, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent } from "@/test/render";
import { ChatBubble, ChatBubbleList } from "../chat-bubble";
import type { ChatMessageProp } from "../chat-bubble";

/**
 * ChatBubble / ChatBubbleList — the BEHAVIOUR, driven the way a person drives it.
 *
 * Two jsdom facts shape this file:
 *
 *  1. There is no layout engine. `scrollHeight`, `clientHeight`, `offsetTop` and `offsetHeight`
 *     are hard 0 and moving `scrollTop` emits no `scroll` event, so stick-to-bottom is exercised
 *     against the same deliberately simple layout model `scroll-area-anchor.test.tsx` installs:
 *     every row is ROW_HEIGHT tall, the viewport is VIEWPORT_HEIGHT tall, and "the reader
 *     scrolled" means move `scrollTop` and then dispatch `scroll`, exactly as a browser does.
 *  2. No stylesheet is applied. So the RTL contract is asserted where it actually lives — the
 *     declarations in `styles/data-display-layout.css` — rather than by reading back a computed
 *     style jsdom never computed.
 *
 * The AppProvider in `renderWithUi` is pinned to `vi`, so every string asserted below is the
 * Vietnamese message from `src/i18n/messages/vi.json`. That is deliberate: a hardcoded English
 * label would still pass an assertion written in English.
 */

const ROW_HEIGHT = 40;
const VIEWPORT_HEIGHT = 100;
const VIEWPORT_SELECTOR = '[data-slot="scroll-area-viewport"]';
const STYLES = readFileSync(
  join(__dirname, "..", "..", "..", "styles", "data-display-layout.css"),
  "utf8",
);

function rowCount(viewport: Element): number {
  let container: Element = viewport;
  while (container.children.length === 1 && container.firstElementChild) {
    container = container.firstElementChild;
  }
  return container.children.length;
}

let originalDescriptors: Record<string, PropertyDescriptor | undefined>;

beforeAll(() => {
  originalDescriptors = {
    clientHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight"),
    scrollHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight"),
    offsetTop: Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetTop"),
    offsetHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight"),
  };
  const isViewport = (element: HTMLElement) => element.dataset.slot === "scroll-area-viewport";

  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get(this: HTMLElement) {
      return isViewport(this) ? VIEWPORT_HEIGHT : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    get(this: HTMLElement) {
      return isViewport(this) ? rowCount(this) * ROW_HEIGHT : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetTop", {
    configurable: true,
    get(this: HTMLElement) {
      const parent = this.parentElement;
      if (!parent) return 0;
      return Array.prototype.indexOf.call(parent.children, this) * ROW_HEIGHT;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get: () => ROW_HEIGHT,
  });
});

afterAll(() => {
  for (const [name, descriptor] of Object.entries(originalDescriptors)) {
    if (descriptor) Object.defineProperty(HTMLElement.prototype, name, descriptor);
    else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
  }
});

const realMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = realMatchMedia;
  vi.useRealTimers();
});

/** Make `prefers-reduced-motion: reduce` the user's OS setting for this test. */
function preferReducedMotion() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function viewportOf(container: HTMLElement): HTMLElement {
  const viewport = container.querySelector<HTMLElement>(VIEWPORT_SELECTOR);
  if (!viewport) throw new Error("viewport not found");
  return viewport;
}

/** What a browser does when the reader drags the bar: move the offset, then announce it. */
function readerScrollsTo(viewport: HTMLElement, top: number) {
  act(() => {
    viewport.scrollTop = top;
    viewport.dispatchEvent(new Event("scroll"));
  });
}

const messagesFrom = (start: number, count: number): ChatMessageProp[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m-${String(start + index)}`,
    role: index % 2 === 0 ? "assistant" : "user",
    content: `Tin nhắn ${String(start + index)}`,
  }));

describe("ChatBubble", () => {
  it("streams a string body in, and hides the half-typed text from assistive tech until it is done", async () => {
    vi.useFakeTimers();
    renderWithUi(
      <ChatBubble header="Trợ lý" typing={{ step: 1, interval: 20 }}>
        Xin chào
      </ChatBubble>,
    );

    const bubble = screen.getByRole("article");
    // Nothing revealed yet: the article says it is still being produced, and the localized
    // "typing" line is the TEXT equivalent of the caret (never an animation on its own).
    expect(bubble).toHaveAttribute("aria-busy", "true");
    expect(bubble).toHaveTextContent("Đang nhập");
    expect(bubble.querySelector(".ui-chat-bubble-caret")).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(60);
    });
    const partial = bubble.querySelector('[data-slot="text"][aria-hidden="true"]');
    expect(partial?.textContent).toBe("Xin");

    act(() => {
      vi.advanceTimersByTime(200);
    });
    // Finished: the caret and the busy flag are gone, and the full message is now a plain
    // addition to the feed — which is the ONE thing a screen reader should announce.
    expect(bubble).not.toHaveAttribute("aria-busy");
    expect(bubble.querySelector(".ui-chat-bubble-caret")).toBeNull();
    expect(bubble).toHaveTextContent("Xin chào");
    expect(bubble).not.toHaveTextContent("Đang nhập");
  });

  it("renders the whole message immediately under prefers-reduced-motion, with no timer at all", () => {
    preferReducedMotion();
    vi.useFakeTimers();
    renderWithUi(
      <ChatBubble header="Trợ lý" typing>
        Xin chào
      </ChatBubble>,
    );

    const bubble = screen.getByRole("article");
    expect(bubble).toHaveTextContent("Xin chào");
    expect(bubble).not.toHaveAttribute("aria-busy");
    expect(bubble.querySelector(".ui-chat-bubble-caret")).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("renders a ReactNode body whole even when `typing` is on — there is nothing to reveal", () => {
    vi.useFakeTimers();
    renderWithUi(
      <ChatBubble header="Trợ lý" typing>
        <span data-testid="rich">Bảng kết quả</span>
      </ChatBubble>,
    );

    expect(screen.getByTestId("rich")).toBeInTheDocument();
    expect(screen.getByRole("article")).not.toHaveAttribute("aria-busy");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("marks a loading bubble busy, keeps the Skeleton bars out of the accessibility tree, and says so in words", () => {
    const { container } = renderWithUi(<ChatBubble header="Trợ lý" loading />);

    const bubble = screen.getByRole("article");
    expect(bubble).toHaveAttribute("aria-busy", "true");
    expect(bubble).toHaveTextContent("Đang tải tin nhắn");
    // Skeleton ships an aria-live of its own; inside the feed's single live region it must be
    // inert, or every placeholder becomes a second announcer.
    expect(container.querySelector(".ui-chat-bubble-skeleton")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("never carries a status by colour alone — a tone renders its localized word", () => {
    renderWithUi(
      <ChatBubble header="Bạn" tone="destructive">
        Không gửi được
      </ChatBubble>,
    );

    const bubble = screen.getByRole("article");
    expect(bubble).toHaveAttribute("data-tone", "destructive");
    expect(bubble).toHaveTextContent("Lỗi");
  });

  it("takes its accessible name from the header, and has none when there is no header", () => {
    const { rerender } = renderWithUi(<ChatBubble header="Trợ lý">Xin chào</ChatBubble>);
    expect(screen.getByRole("article", { name: "Trợ lý" })).toBeInTheDocument();

    rerender(<ChatBubble>Xin chào</ChatBubble>);
    expect(screen.getByRole("article")).not.toHaveAttribute("aria-labelledby");
  });

  it("puts placement on the LOGICAL axis, so the same markup flips under dir=rtl", () => {
    const { container } = renderWithUi(
      <div dir="rtl">
        <ChatBubble placement="end" header="Bạn">
          Xin chào
        </ChatBubble>
      </div>,
    );

    expect(screen.getByRole("article")).toHaveAttribute("data-placement", "end");
    expect(container.querySelector('[dir="rtl"] .ui-chat-bubble')).not.toBeNull();

    // jsdom applies no stylesheet, so the flip is asserted where it is written. The flip is the
    // flex main axis, which is writing-mode relative: reversing it moves the avatar to the other
    // column AND packs the row against the inline end, in both directions, with no physical edge.
    const block = STYLES.slice(STYLES.indexOf("  .ui-chat-bubble {"));
    expect(block).toContain('.ui-chat-bubble[data-placement="end"]');
    expect(block).toMatch(/\[data-placement="end"\]\s*\{[^}]*flex-direction:\s*row-reverse/);
    // Not one physical edge anywhere in the chat block — that is the whole RTL contract.
    expect(block).not.toMatch(/\b(?:margin|padding)-(?:left|right):/);
    expect(block).not.toMatch(/\b(?:left|right):\s/);
    // And the measure is clamped to the row, so a narrow feed shrinks instead of clipping.
    expect(block).toMatch(
      /\.ui-chat-bubble-column\s*\{[^}]*max-inline-size:\s*min\(\s*var\(--chat-bubble-max-inline-size\),\s*100%\s*\)/,
    );
  });

  it("forwards the ref, the id and unknown props to the article", () => {
    const ref = React.createRef<HTMLElement>();
    renderWithUi(
      <ChatBubble ref={ref} id="m-42" data-testid="own" size="lg" variant="outlined">
        Xin chào
      </ChatBubble>,
    );

    expect(ref.current?.tagName).toBe("ARTICLE");
    expect(screen.getByTestId("own")).toBe(ref.current);
    expect(ref.current).toHaveAttribute("id", "m-42");
    expect(ref.current).toHaveAttribute("data-size", "lg");
    expect(ref.current).toHaveAttribute("data-variant", "outlined");
  });
});

describe("ChatBubbleList", () => {
  it("declares exactly ONE polite log region for the whole feed, named through t()", () => {
    const { container } = renderWithUi(<ChatBubbleList items={messagesFrom(1, 3)} />);

    const log = screen.getByRole("log", { name: "Cuộc trò chuyện" });
    expect(log).toHaveAttribute("aria-live", "polite");
    expect(container.querySelectorAll('[aria-live="polite"]')).toHaveLength(1);
    expect(screen.getAllByRole("article")).toHaveLength(3);
  });

  it("merges role defaults UNDER each message's own props", () => {
    renderWithUi(
      <ChatBubbleList
        items={[
          { id: "a", role: "assistant", content: "Câu trả lời" },
          { id: "b", role: "user", content: "Câu hỏi" },
          // The message wins over its role's default.
          { id: "c", role: "user", content: "Ghi chú", variant: "borderless" },
        ]}
        roles={{
          assistant: { placement: "start", variant: "filled" },
          user: { placement: "end", variant: "outlined" },
        }}
      />,
    );

    expect(document.getElementById("a")).toHaveAttribute("data-placement", "start");
    expect(document.getElementById("b")).toHaveAttribute("data-placement", "end");
    expect(document.getElementById("b")).toHaveAttribute("data-variant", "outlined");
    expect(document.getElementById("c")).toHaveAttribute("data-placement", "end");
    expect(document.getElementById("c")).toHaveAttribute("data-variant", "borderless");
  });

  it("lands on the newest message and keeps following while the reader is at the bottom", async () => {
    const { container, rerender } = renderWithUi(<ChatBubbleList items={messagesFrom(1, 6)} />, {
      loopGuard: false,
    });
    const viewport = viewportOf(container);

    expect(viewport.scrollTop).toBe(6 * ROW_HEIGHT - VIEWPORT_HEIGHT);

    rerender(<ChatBubbleList items={messagesFrom(1, 9)} />);
    await waitFor(() => {
      expect(viewport.scrollTop).toBe(9 * ROW_HEIGHT - VIEWPORT_HEIGHT);
    });
    // Still following, so there is nothing to jump back to.
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("stops following the moment the reader scrolls up, and offers a COUNTED way back", async () => {
    const user = userEvent.setup();
    const { container, rerender } = renderWithUi(<ChatBubbleList items={messagesFrom(1, 6)} />, {
      loopGuard: false,
    });
    const viewport = viewportOf(container);

    readerScrollsTo(viewport, 0);
    // The pin is revoked; the way back is a real, focusable control, not an automatic scroll.
    const jump = await screen.findByRole("button", { name: /Đến tin mới nhất/ });
    expect(jump).toBeInTheDocument();

    rerender(<ChatBubbleList items={messagesFrom(1, 9)} />);
    await act(async () => {
      await Promise.resolve();
    });
    // The reader was NOT dragged down while reading history (WCAG 3.2.5)…
    expect(viewport.scrollTop).toBe(0);
    // …and the affordance now says how many arrived, pluralized through Intl.PluralRules.
    expect(await screen.findByRole("button", { name: /3 tin nhắn mới/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /3 tin nhắn mới/ }));
    expect(viewport.scrollTop).toBe(9 * ROW_HEIGHT - VIEWPORT_HEIGHT);
    await waitFor(() => {
      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  it("reaches the jump affordance from the keyboard, and the feed itself is a tab stop", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(<ChatBubbleList items={messagesFrom(1, 6)} />);
    const viewport = viewportOf(container);

    // WCAG 2.1.1 — an overflowing region has to be scrollable without a pointer.
    expect(viewport).toHaveAttribute("tabindex", "0");

    readerScrollsTo(viewport, 0);
    const jump = await screen.findByRole("button", { name: /Đến tin mới nhất/ });

    jump.focus();
    expect(document.activeElement).toBe(jump);
    await user.keyboard("{Enter}");
    expect(viewport.scrollTop).toBe(6 * ROW_HEIGHT - VIEWPORT_HEIGHT);
  });

  it("leaves the reader where they are when autoScroll is off (an archived transcript)", async () => {
    const { container, rerender } = renderWithUi(
      <ChatBubbleList autoScroll={false} items={messagesFrom(1, 6)} />,
      { loopGuard: false },
    );
    const viewport = viewportOf(container);

    expect(viewport.scrollTop).toBe(0);
    rerender(<ChatBubbleList autoScroll={false} items={messagesFrom(1, 9)} />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(viewport.scrollTop).toBe(0);
  });
});
