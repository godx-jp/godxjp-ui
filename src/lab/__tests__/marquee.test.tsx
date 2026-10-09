import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Marquee } from "../marquee";

/**
 * jsdom has no layout, so `offsetWidth` is 0 on everything and the measurement pass would bail
 * before it ever ran. These tests give the two boxes the component measures a width keyed on
 * `data-slot`, which is the same handle the component itself uses — so the clone count under test
 * is the real arithmetic (`ceil(viewport / copy) + 1`), not a number the test invented.
 */
function stubWidths(widths: Record<string, number>) {
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get(this: HTMLElement) {
      return widths[this.dataset.slot ?? ""] ?? 0;
    },
  });
}

/** `matchMedia` is stubbed globally to answer `false`; this makes it answer `true` for `reduce`. */
function stubReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  // @ts-expect-error — removing the stubbed accessor restores jsdom's own zero-width getter.
  delete HTMLElement.prototype.offsetWidth;
  stubReducedMotion(false);
});

const LOGOS = ["フジワラ運輸", "Meridian Foods", "Công ty Đại Việt"];

function Logos() {
  return (
    <>
      {LOGOS.map((name) => (
        <span key={name}>{name}</span>
      ))}
    </>
  );
}

describe("Marquee — measured cloning", () => {
  it("clones until the copies fill the viewport plus one", () => {
    stubWidths({ "marquee-viewport": 600, "marquee-copy": 150 });
    const { container } = render(
      <Marquee>
        <Logos />
      </Marquee>,
    );

    // ceil(600 / 150) + 1 = 5 copies → one real, four clones.
    expect(container.querySelectorAll('[data-slot="marquee-copy"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-slot="marquee-clone"]')).toHaveLength(4);
  });

  it("re-measures against the viewport: a copy WIDER than the track still gets one clone", () => {
    stubWidths({ "marquee-viewport": 200, "marquee-copy": 900 });
    const { container } = render(<Marquee>one very long unbroken headline</Marquee>);

    // ceil(200 / 900) + 1 = 2 — the minimum that can loop seamlessly.
    expect(container.querySelectorAll('[data-slot="marquee-clone"]')).toHaveLength(1);
  });

  it("caps the clone count so degenerate content cannot flood the DOM", () => {
    stubWidths({ "marquee-viewport": 2560, "marquee-copy": 1 });
    const { container } = render(<Marquee>·</Marquee>);

    expect(container.querySelectorAll('[data-slot="marquee-clone"]')).toHaveLength(19);
  });

  it("publishes the copy count and the pace scale as custom properties", () => {
    stubWidths({ "marquee-viewport": 600, "marquee-copy": 150 });
    const { container } = render(<Marquee>x</Marquee>);
    const root = container.querySelector('[data-slot="marquee"]') as HTMLElement;

    expect(root.style.getPropertyValue("--marquee-copies")).toBe("5");
    // 150 / 600 — the ratio that keeps the PACE the same whether the track carries one item or forty.
    expect(root.style.getPropertyValue("--marquee-cycle-scale")).toBe("0.25");
  });
});

describe("Marquee — the clones are decorative", () => {
  it("renders the content once for real and hides every clone from AT and from Tab", () => {
    stubWidths({ "marquee-viewport": 600, "marquee-copy": 150 });
    const { container, getAllByText } = render(
      <Marquee>
        <Logos />
      </Marquee>,
    );

    // The text IS in the DOM five times over, but only the first copy is exposed.
    expect(getAllByText("フジワラ運輸")).toHaveLength(5);
    for (const clone of container.querySelectorAll('[data-slot="marquee-clone"]')) {
      expect(clone).toHaveAttribute("aria-hidden", "true");
      expect(clone).toHaveAttribute("inert");
    }
    expect(container.querySelector('[data-slot="marquee-copy"]')).not.toHaveAttribute(
      "aria-hidden",
    );
  });

  it("keeps a link in the real copy reachable, and its clones unreachable", async () => {
    stubWidths({ "marquee-viewport": 600, "marquee-copy": 300 });
    const user = userEvent.setup();
    const { container, getAllByRole } = render(
      <Marquee>
        <a href="https://example.com">Meridian</a>
      </Marquee>,
    );

    // `getAllByRole` ignores `aria-hidden` subtrees, so the accessibility tree has exactly one.
    expect(getAllByRole("link")).toHaveLength(1);
    expect(container.querySelectorAll("a")).toHaveLength(3);

    await user.tab();
    expect(getAllByRole("link")[0]).toHaveFocus();
  });
});

describe("Marquee — the WCAG 2.2.2 pause control", () => {
  it("is a button with a localized accessible name that names the NEXT state", () => {
    stubWidths({ "marquee-viewport": 600, "marquee-copy": 150 });
    const { getByRole } = render(<Marquee>x</Marquee>);

    expect(getByRole("button", { name: "Tạm dừng cuộn" })).toBeInTheDocument();
  });

  it("points at the track it stops", () => {
    stubWidths({ "marquee-viewport": 600, "marquee-copy": 150 });
    const { container, getByRole } = render(<Marquee>x</Marquee>);
    const track = container.querySelector('[data-slot="marquee-track"]') as HTMLElement;

    expect(getByRole("button")).toHaveAttribute("aria-controls", track.id);
    expect(track.id).not.toBe("");
  });

  it("pauses and resumes FROM THE KEYBOARD — Tab, then Enter, then Space", async () => {
    stubWidths({ "marquee-viewport": 600, "marquee-copy": 150 });
    const user = userEvent.setup();
    const onPlayChange = vi.fn();
    const { container, getByRole } = render(<Marquee onPlayChange={onPlayChange}>x</Marquee>);
    const root = container.querySelector('[data-slot="marquee"]') as HTMLElement;

    expect(root).toHaveAttribute("data-playing", "true");

    await user.tab();
    expect(getByRole("button")).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onPlayChange).toHaveBeenLastCalledWith(false);
    expect(root).toHaveAttribute("data-playing", "false");
    expect(getByRole("button", { name: "Tiếp tục cuộn" })).toBeInTheDocument();

    await user.keyboard(" ");
    expect(onPlayChange).toHaveBeenLastCalledWith(true);
    expect(root).toHaveAttribute("data-playing", "true");
    expect(getByRole("button", { name: "Tạm dừng cuộn" })).toBeInTheDocument();
  });

  it("composes a caller's CONTENT name with the verb, and the verb still flips", async () => {
    stubWidths({ "marquee-viewport": 600, "marquee-copy": 150 });
    const user = userEvent.setup();
    const { getByRole } = render(<Marquee label="logo đối tác">x</Marquee>);

    // The caller names the content; the component owns the verb. A caller string used as the WHOLE
    // name would read the same in both states, i.e. say "pause" on a button that resumes.
    expect(getByRole("button", { name: "Tạm dừng cuộn: logo đối tác" })).toBeInTheDocument();
    await user.click(getByRole("button"));
    expect(getByRole("button", { name: "Tiếp tục cuộn: logo đối tác" })).toBeInTheDocument();
  });

  it("starts paused on defaultPlay={false} — WebAIM's recommendation, one prop away", () => {
    stubWidths({ "marquee-viewport": 600, "marquee-copy": 150 });
    const { container, getByRole } = render(<Marquee defaultPlay={false}>x</Marquee>);

    expect(container.querySelector('[data-slot="marquee"]')).toHaveAttribute(
      "data-playing",
      "false",
    );
    expect(getByRole("button", { name: "Tiếp tục cuộn" })).toBeInTheDocument();
  });

  it("is CONTROLLED by `play`: the press reports, and the caller decides", async () => {
    stubWidths({ "marquee-viewport": 600, "marquee-copy": 150 });
    const user = userEvent.setup();
    const onPlayChange = vi.fn();
    const { container, getByRole } = render(
      <Marquee play onPlayChange={onPlayChange}>
        x
      </Marquee>,
    );

    await user.click(getByRole("button"));
    expect(onPlayChange).toHaveBeenCalledWith(false);
    // Still playing: nothing moved without the caller writing it back.
    expect(container.querySelector('[data-slot="marquee"]')).toHaveAttribute(
      "data-playing",
      "true",
    );
  });
});

describe("Marquee — prefers-reduced-motion: reduce", () => {
  it("renders no clones, no control, and hands the row to a scrollable region", () => {
    stubReducedMotion(true);
    stubWidths({ "marquee-viewport": 600, "marquee-copy": 150 });
    const { container, queryByRole, getAllByText } = render(
      <Marquee>
        <Logos />
      </Marquee>,
    );

    expect(container.querySelector('[data-slot="marquee"]')).toHaveAttribute(
      "data-reduced-motion",
      "true",
    );
    expect(container.querySelectorAll('[data-slot="marquee-clone"]')).toHaveLength(0);
    expect(queryByRole("button")).toBeNull();
    // The content is there exactly once, and still readable.
    expect(getAllByText("フジワラ運輸")).toHaveLength(1);
  });

  it("publishes no animation custom properties at all", () => {
    stubReducedMotion(true);
    stubWidths({ "marquee-viewport": 600, "marquee-copy": 150 });
    const { container } = render(<Marquee>x</Marquee>);
    const root = container.querySelector('[data-slot="marquee"]') as HTMLElement;

    expect(root.style.getPropertyValue("--marquee-copies")).toBe("");
    expect(root.style.getPropertyValue("--marquee-cycle-scale")).toBe("");
  });
});

describe("Marquee — API surface", () => {
  it("lands direction, speed, hover and fade on the root as data attributes", () => {
    stubWidths({ "marquee-viewport": 600, "marquee-copy": 150 });
    const { container } = render(
      <Marquee direction="end" speed="slow" pauseOnHover fade>
        x
      </Marquee>,
    );
    const root = container.querySelector('[data-slot="marquee"]') as HTMLElement;

    expect(root).toHaveAttribute("data-direction", "end");
    expect(root).toHaveAttribute("data-speed", "slow");
    expect(root).toHaveAttribute("data-pause-on-hover", "true");
    expect(root).toHaveAttribute("data-fade", "true");
  });

  it("resolves `gap` to the inline-axis token step, not a pixel literal", () => {
    stubWidths({ "marquee-viewport": 600, "marquee-copy": 150 });
    const { container, rerender } = render(<Marquee gap="lg">x</Marquee>);
    const root = () => container.querySelector('[data-slot="marquee"]') as HTMLElement;

    expect(root().style.getPropertyValue("--marquee-gap-inline")).toBe("var(--space-inline-lg)");
    rerender(<Marquee gap={6}>x</Marquee>);
    expect(root().style.getPropertyValue("--marquee-gap-inline")).toBe("var(--space-6)");
    rerender(<Marquee gap="none">x</Marquee>);
    expect(root().style.getPropertyValue("--marquee-gap-inline")).toBe("0px");
  });

  it("leaves the token alone when `gap` is omitted, so the theme still owns it", () => {
    stubWidths({ "marquee-viewport": 600, "marquee-copy": 150 });
    const { container } = render(<Marquee>x</Marquee>);
    const root = container.querySelector('[data-slot="marquee"]') as HTMLElement;

    expect(root.style.getPropertyValue("--marquee-gap-inline")).toBe("");
  });

  it("forwards ref and spreads the rest", () => {
    stubWidths({ "marquee-viewport": 600, "marquee-copy": 150 });
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(
      <Marquee ref={ref} className="partner-strip" id="partners" data-testid="strip">
        x
      </Marquee>,
    );

    expect(ref.current).toBe(container.querySelector('[data-slot="marquee"]'));
    expect(ref.current).toHaveClass("ui-marquee", "partner-strip");
    expect(ref.current).toHaveAttribute("id", "partners");
    expect(ref.current).toHaveAttribute("data-testid", "strip");
  });
});

/**
 * CSS-TEXT TESTS, because the defects they hold are DECLARATION SITES and jsdom resolves neither
 * the cascade nor an animation. Each one was found by measuring Chromium and is kept said here.
 */
describe("Marquee — the stylesheet contract", () => {
  const css = readFileSync(resolve(process.cwd(), "src/styles/motion.css"), "utf8");

  it("ships a SEPARATE rtl keyframe, not `animation-direction: reverse` for the writing direction", () => {
    // Measured before the fix, by stepping a lap with the Web Animations API and asking how much
    // of the window no copy covered: 0px at every phase in LTR, and up to a full copy of bare
    // track in RTL (836.66px on the logo wall). `reverse` travels the right way over the wrong
    // RANGE: an RTL track overflows leftwards, so its lap is 0 → +one copy, not −one copy → 0.
    expect(css).toContain("@keyframes ui-marquee-travel-rtl");
    expect(css).toMatch(
      /\[dir="rtl"\] \.ui-marquee-track \{\s*animation-name: ui-marquee-travel-rtl;/,
    );
    expect(css).not.toMatch(/\[dir="rtl"\][^{]*\.ui-marquee-track \{\s*animation-direction:/);
  });

  it("travels one copy per lap, as a fraction of the track and not a measured pixel distance", () => {
    expect(css).toContain("translateX(calc(-100% / var(--marquee-copies, 2)))");
    expect(css).toContain("translateX(calc(100% / var(--marquee-copies, 2)))");
  });

  it("pauses by play-state, never by resetting the lap (WCAG technique G4)", () => {
    expect(css).toMatch(
      /\[data-playing="false"\] \.ui-marquee-track \{\s*animation-play-state: paused;/,
    );
    expect(css).toMatch(
      /\.ui-marquee-viewport:focus-within \.ui-marquee-track \{\s*animation-play-state: paused;/,
    );
  });

  it("stops entirely under prefers-reduced-motion, in CSS as well as in the component", () => {
    const query = css.slice(css.lastIndexOf("@media (prefers-reduced-motion: reduce)"));
    expect(query).toContain(".ui-marquee-track");
    expect(query).toMatch(/animation: none;/);
  });

  it("reads the motion tier for every duration and mints no literal", () => {
    const block = css.slice(css.indexOf(".ui-marquee-track"), css.indexOf(".ui-marquee-copy"));
    expect(block).toContain("var(--marquee-interval)");
    expect(block).toContain("var(--marquee-interval-slow)");
    expect(block).toContain("var(--marquee-interval-fast)");
    expect(block).not.toMatch(/animation-duration:\s*[\d.]+m?s/);
  });
});
