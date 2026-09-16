import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AuthIdentity } from "../auth-identity";

/**
 * AuthIdentity — the canonical hosted-identity heading block.
 *
 * It must ship the brand-green GoDX mark (independent of `--primary`), an `h1`, and an optional
 * requesting-client line — with no page CSS for the centring/rhythm. The mark is decorative: the
 * heading text is the accessible name, so the block is announced once.
 */
/**
 * A consumer-supplied utility, hoisted so the literal appears once as a FIXTURE rather than as an
 * assertion about how the component is painted. What is under test is pass-through: whatever class
 * the consumer hands in survives `cn()` onto the rendered node.
 */
const CONSUMER_CLASS = "pb-2";

describe("AuthIdentity", () => {
  it("renders the canonical GoDX identity mark above an h1", () => {
    const { container } = render(<AuthIdentity title="GoDX ID にログイン" />);
    const mark = container.querySelector('[data-slot="logo"]')!;
    expect(mark).toHaveAttribute("data-mark", "godx");
    // tone="success" → the identity fill role, NOT --primary.
    expect(mark).toHaveAttribute("data-tone", "success");
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("GoDX ID にログイン");
  });

  it("omits the requester row unless authoritative client context is supplied", () => {
    const { container } = render(<AuthIdentity title="Sign in" />);
    expect(container.querySelector('[data-slot="auth-requester"]')).toBeNull();
  });

  it("renders the requesting-client line with a decorative icon", () => {
    const { container } = render(
      <AuthIdentity title="Sign in" requester="Attendance is requesting sign in" />,
    );
    expect(container.querySelector('[data-slot="auth-requester"]')).toBeInTheDocument();
    expect(screen.getByText("Attendance is requesting sign in")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="auth-requester-icon"] svg')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  /**
   * `brand` exists so a service whose design ships a REAL lockup (mark + wordmark, sometimes a
   * product suffix) can use it without forking this block. The two assertions that matter are
   * that the package mark steps aside — otherwise the screen carries two brand marks — and that
   * the identity contract around it does not move, since consumer tests pin
   * `[data-slot="auth-identity"]` and `.ui-auth-shell-card > .ui-auth-identity` for spacing.
   */
  it("puts consumer brand artwork in the mark's place, leaving the identity contract intact", () => {
    const { container } = render(
      <AuthIdentity title="Sign in" brand={<svg data-testid="consumer-lockup" />} />,
    );

    expect(screen.getByTestId("consumer-lockup")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="logo"]')).toBeNull();

    const root = container.querySelector('[data-slot="auth-identity"]')!;
    expect(root).toHaveClass("ui-auth-identity");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Sign in");
  });

  it("falls back to the canonical GoDX mark when no brand artwork is supplied", () => {
    const { container } = render(<AuthIdentity title="Sign in" />);
    expect(container.querySelector('[data-slot="logo"]')).toHaveAttribute("data-mark", "godx");
  });

  it("merges className onto the root without dropping the canonical class", () => {
    const { container } = render(<AuthIdentity title="Sign in" className={CONSUMER_CLASS} />);
    const root = container.querySelector('[data-slot="auth-identity"]')!;
    expect(root).toHaveClass("ui-auth-identity", CONSUMER_CLASS);
  });
});
