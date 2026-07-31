import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "@/test/a11y";
import { AuthIdentity } from "../auth-identity";

/**
 * AuthIdentity — the canonical hosted-identity heading block (gh#214).
 *
 * It must ship the brand-green GoDX mark (independent of `--primary`), an `h1`, and an optional
 * requesting-client line — with no page CSS for the centring/rhythm. The mark is decorative: the
 * heading text is the accessible name, so the block is announced once.
 */
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

  it("merges className onto the root without dropping the canonical class", () => {
    const { container } = render(<AuthIdentity title="Sign in" className="pb-2" />);
    const root = container.querySelector('[data-slot="auth-identity"]')!;
    expect(root).toHaveClass("ui-auth-identity", "pb-2");
  });

  it("has no axe violations, with and without the requester line", async () => {
    await expectNoA11yViolations(<AuthIdentity title="Sign in" />);
    await expectNoA11yViolations(
      <AuthIdentity title="Sign in" requester="Attendance is requesting sign in" />,
    );
  });
});
