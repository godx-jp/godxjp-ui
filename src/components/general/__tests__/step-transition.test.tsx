import { act, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Plain `render`: renderWithUi's `rerender` does not re-apply its loop-guard wrapper, which
// would REMOUNT the tree and hide the transition under test.
import { render as renderWithUi, screen } from "@/test/render";
import { StepTransition } from "../step-transition";

const layers = (c: HTMLElement) => [
  ...c.querySelectorAll<HTMLElement>('[data-slot="step-transition-layer"]'),
];

afterEach(() => vi.useRealTimers());

describe("StepTransition", () => {
  it("does not animate the first render", () => {
    const { container } = renderWithUi(
      <StepTransition value="email">
        <p>Email step</p>
      </StepTransition>,
    );
    const [only, ...rest] = layers(container);
    expect(rest).toHaveLength(0);
    expect(only).not.toHaveAttribute("data-state");
  });

  it("keeps the outgoing step as an inert, hidden snapshot while the new one enters", () => {
    const { container, rerender } = renderWithUi(
      <StepTransition value="email">
        <p>Email step</p>
      </StepTransition>,
    );
    rerender(
      <StepTransition value="password">
        <p>Password step</p>
      </StepTransition>,
    );
    const [out, current] = layers(container);
    expect(out).toHaveAttribute("data-state", "exit");
    expect(out).toHaveAttribute("aria-hidden", "true");
    expect(out).toHaveAttribute("inert");
    expect(out).toHaveTextContent("Email step");
    expect(current).toHaveAttribute("data-state", "enter");
    expect(current).toHaveTextContent("Password step");
    // Only the current step is in the accessibility tree.
    expect(screen.getByText("Password step")).toBeVisible();
  });

  // Removal on `animationend` is measured in Chromium (step-transition-browser): jsdom has no
  // AnimationEvent, so React never binds the listener here.

  it("drops it after the fallback when no animationend ever fires", () => {
    vi.useFakeTimers();
    const { container, rerender } = renderWithUi(
      <StepTransition value={0}>
        <p>A</p>
      </StepTransition>,
    );
    rerender(
      <StepTransition value={1}>
        <p>B</p>
      </StepTransition>,
    );
    expect(layers(container)).toHaveLength(2);
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(layers(container)).toHaveLength(1);
  });

  it("snapshots the LAST rendered content, and marks a backward move", () => {
    const { container, rerender } = renderWithUi(
      <StepTransition value="code">
        <p>Code LTZW</p>
      </StepTransition>,
    );
    rerender(
      <StepTransition value="code">
        <p>Code LTZWCZPS</p>
      </StepTransition>,
    );
    rerender(
      <StepTransition value="intro" direction="backward">
        <p>Intro</p>
      </StepTransition>,
    );
    const [out, current] = layers(container);
    expect(out).toHaveTextContent("Code LTZWCZPS");
    expect(out).toHaveAttribute("data-direction", "backward");
    expect(current).toHaveAttribute("data-direction", "backward");
  });

  it("remounts the incoming step, so the previous step's state does not leak", () => {
    function Field() {
      return <input aria-label="field" defaultValue="" />;
    }
    const { container, rerender } = renderWithUi(
      <StepTransition value={0}>
        <Field />
      </StepTransition>,
    );
    const first = screen.getByLabelText("field");
    fireEvent.change(first, { target: { value: "typed" } });
    rerender(
      <StepTransition value={1}>
        <Field />
      </StepTransition>,
    );
    // The current (non-hidden) field is a fresh element; the snapshot keeps the typed one.
    const current = container.querySelector('[data-state="enter"] input');
    expect(current).toHaveValue("");
    expect(current).not.toBe(first);
  });
});
