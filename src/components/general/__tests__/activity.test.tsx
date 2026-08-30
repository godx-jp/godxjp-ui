import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { Activity } from "../activity";
import { renderWithUi } from "@/test/render";

/**
 * A consumer-supplied utility, hoisted so the literal reads as a FIXTURE rather than an assertion
 * about how the component is painted. What is under test is pass-through.
 */
const CONSUMER_CLASS = "my-2";

/** Localized, consumer-owned copy. The library invents no string for an ambient indicator. */
const TYPING_JA = "佐藤さんが入力しています…";
const TYPING_VI = "Hưng đang nhập…";

const MOTION_CSS = readFileSync(resolve(__dirname, "../../../styles/motion.css"), "utf8");

describe("Activity", () => {
  it("renders the three-dot mark plus the label, with the mark hidden from assistive tech", () => {
    const { container, getByText } = renderWithUi(<Activity label={TYPING_JA} />);

    const root = container.querySelector('[data-slot="activity"]');
    expect(root).toHaveClass("ui-activity");
    expect(root).toHaveAttribute("data-variant", "dots");
    expect(root).toHaveAttribute("data-size", "sm");
    expect(root).toHaveAttribute("data-tone", "muted");

    const mark = container.querySelector('[data-slot="activity-mark"]');
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark?.querySelectorAll(".ui-activity-dot")).toHaveLength(3);

    // The meaning is TEXT, never the animation.
    expect(getByText(TYPING_JA)).toBeInTheDocument();
  });

  it("emits NO live region by default — the absence is the contract", () => {
    const { container } = renderWithUi(<Activity label={TYPING_VI} />);

    expect(container.querySelectorAll("[aria-live]")).toHaveLength(0);
    expect(container.querySelector('[data-slot="activity-live"]')).toBeNull();
    // Ambient activity elsewhere does not make THIS region busy (the Skeleton anti-pattern).
    expect(container.querySelectorAll("[aria-busy]")).toHaveLength(0);
  });

  it('announce="polite" emits exactly one atomic region wrapping ONLY the label', () => {
    const { container, getByText } = renderWithUi(<Activity announce="polite" label={TYPING_VI} />);

    const regions = container.querySelectorAll("[aria-live]");
    expect(regions).toHaveLength(1);
    const region = regions[0];
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveAttribute("aria-atomic", "true");
    expect(region).toContainElement(getByText(TYPING_VI));
    // The looping mark must stay OUTSIDE the region — otherwise every frame is a candidate update.
    expect(region.querySelector('[data-slot="activity-mark"]')).toBeNull();
    expect(container.querySelectorAll("[aria-busy]")).toHaveLength(0);
  });

  it("keeps `label` as an sr-only description when `children` own the visible slot", () => {
    const { container, getByText } = renderWithUi(
      <Activity label={TYPING_JA}>
        <b>佐藤</b>
      </Activity>,
    );

    expect(getByText("佐藤")).toBeInTheDocument();
    const description = container.querySelector('[data-slot="activity-description"]');
    expect(description).toHaveTextContent(TYPING_JA);
  });

  it("renders the pulse and bar marks and never more than one mark box", () => {
    const pulse = renderWithUi(<Activity variant="pulse" label="録画中" />).container;
    expect(pulse.querySelectorAll(".ui-activity-pulse")).toHaveLength(1);
    expect(pulse.querySelectorAll(".ui-activity-dot")).toHaveLength(0);

    const bar = renderWithUi(<Activity variant="bar" label="同期中…" />).container;
    expect(bar.querySelectorAll(".ui-activity-bar")).toHaveLength(1);
    expect(bar.querySelectorAll(".ui-activity-bar-segment")).toHaveLength(1);
  });

  it("scales the label with `size` and colours it with `tone` through the real Text primitive", () => {
    const { container } = renderWithUi(<Activity size="lg" tone="destructive" label="録音中" />);

    const root = container.querySelector('[data-slot="activity"]');
    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).toHaveAttribute("data-tone", "destructive");

    const label = container.querySelector('[data-slot="text"]');
    expect(label).toHaveAttribute("data-size", "lg");
    expect(label).toHaveAttribute("data-tone", "destructive");
  });

  it("is a status mark, not a control — no tab stop, no role, no focusable node", () => {
    const { container } = renderWithUi(<Activity label={TYPING_VI} />);

    const root = container.querySelector('[data-slot="activity"]');
    expect(root).not.toHaveAttribute("tabindex");
    // `role="status"` implies an unconditional polite live region — the exact thing `announce`
    // exists to keep off by default.
    expect(root).not.toHaveAttribute("role");
    expect(container.querySelectorAll("a, button, input, [tabindex]")).toHaveLength(0);
  });

  it("forwards ref, className and native props", () => {
    const ref = vi.fn();
    const { container } = renderWithUi(
      <Activity ref={ref} className={CONSUMER_CLASS} id="typing" data-testid="typing" />,
    );

    const root = container.querySelector("#typing");
    expect(root).toHaveClass("ui-activity", CONSUMER_CLASS);
    expect(root).toHaveAttribute("data-testid", "typing");
    expect(ref).toHaveBeenCalled();
  });

  it("renders the mark with no label at all (decorative use) without emitting empty text", () => {
    const { container } = renderWithUi(<Activity />);
    expect(container.querySelectorAll(".ui-activity-dot")).toHaveLength(3);
    expect(container.querySelector('[data-slot="text"]')).toBeNull();
  });

  describe("prefers-reduced-motion", () => {
    it("still renders the full affordance — the meaning lives in the DOM, not the loop", () => {
      // The guard is CSS-only BY DESIGN: no JS branch can drop the label or the marks, so the
      // reduced-motion frame is the same DOM with the animation removed.
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { container, getByText } = renderWithUi(<Activity label={TYPING_JA} />);
      expect(getByText(TYPING_JA)).toBeInTheDocument();
      expect(container.querySelectorAll(".ui-activity-dot")).toHaveLength(3);
    });

    it("drops the loop in CSS and leaves a DESIGNED resting state, never a hidden one", () => {
      const guard = MOTION_CSS.slice(MOTION_CSS.indexOf(".ui-activity-dot"));
      const reduce = guard.slice(guard.indexOf("@media (prefers-reduced-motion: reduce)"));
      const block = reduce.slice(0, reduce.indexOf("@media (forced-colors"));

      // Every looping mark is covered by the guard…
      for (const mark of [".ui-activity-dot", ".ui-activity-pulse", ".ui-activity-bar-segment"]) {
        expect(block).toContain(mark);
      }
      expect(block).toContain("animation: none");
      // …and the guard removes MOTION only — nothing is hidden, collapsed or faded out.
      expect(block).not.toMatch(/display\s*:\s*none/);
      expect(block).not.toMatch(/visibility\s*:\s*hidden/);
      expect(block).not.toMatch(/opacity\s*:\s*0\b/);
    });

    it("keeps the resting frame legible: no mark rests at zero opacity", () => {
      // The dots' trough alpha is a token, and its default is deliberately non-zero so a dot never
      // disappears mid-cycle — which is also what makes `animation: none` land on a visible frame.
      const tokens = readFileSync(
        resolve(__dirname, "../../../tokens/components/activity.css"),
        "utf8",
      );
      const rest = tokens.match(/--activity-mark-rest-alpha:\s*([0-9.]+)/)?.[1];
      expect(Number(rest)).toBeGreaterThan(0);
      // The bar's static frame is a PARTIAL track — a full one would read as "complete".
      expect(MOTION_CSS).toMatch(/\.ui-activity-bar-segment\s*\{[^}]*inset-inline-start:\s*0;/);
    });
  });
});
