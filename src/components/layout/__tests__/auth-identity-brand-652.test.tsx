import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AuthIdentity } from "../auth-identity";
import { Heading, Logo } from "../../general";

/**
 * AuthIdentity `brand` — the artwork slot is DECORATIVE, whatever fills it (gh#652).
 *
 * `auth-identity.test.tsx` already covers the swap itself: the consumer's artwork renders, the
 * package mark gives way, the `data-slot` / class / `h1` contract does not move. What is under
 * test HERE is the one thing that markup inspection cannot see — that the block still announces
 * the product name exactly ONCE once the artwork is a real lockup rather than a bare mark.
 *
 * The mark `brand` replaces was always out of the accessibility tree. A lockup is not a mark:
 * `Logo mark="godx-lockup" productSuffix="ID"` puts "GoDX ID" in the tree as real text (gh#649's
 * sr-only logotype plus the suffix), so an exposed one beside an `h1` named "GoDX ID" says the
 * product twice. The last case renders that shape rather than describing it.
 */

/**
 * What an assistive technology would announce for a subtree: its text with every `aria-hidden`
 * branch removed. Measured rather than reasoned about from the markup — the whole point of this
 * file is that the same pixels are announced once or twice depending on one attribute.
 */
function announcedText(root: HTMLElement): string {
  const clone = root.cloneNode(true) as HTMLElement;
  for (const hidden of clone.querySelectorAll('[aria-hidden="true"]')) hidden.remove();
  return (clone.textContent ?? "").replace(/\s+/gu, " ").trim();
}

/** The canonical hosted-identity title: the h1 IS the product name (docs/layout/auth-shell.tsx). */
const PRODUCT = "GoDX ID";

const identityOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-slot="auth-identity"]')!;

describe("AuthIdentity brand (gh#652)", () => {
  it("announces the product once with the package mark — the behaviour being preserved", () => {
    const { container } = render(<AuthIdentity title={PRODUCT} />);
    expect(container.querySelector('[data-slot="logo"]')).toHaveAttribute("data-mark", "godx");
    expect(announcedText(identityOf(container))).toBe(PRODUCT);
  });

  it("announces the product once with a consumer lockup, which a bare swap would not", () => {
    const { container } = render(
      <AuthIdentity title={PRODUCT} brand={<Logo mark="godx-lockup" productSuffix="ID" />} />,
    );
    expect(container.querySelector('[data-slot="logo-lockup"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(announcedText(identityOf(container))).toBe(PRODUCT);
  });

  it("borrows the consumer's element rather than wrapping it", () => {
    // A wrapper would be the flex item, and an `inline-flex` lockup inside a block box is back on
    // a line box whose strut descender lifts the mark — the defect `Logo`'s `asChild` removes.
    const { container } = render(
      <AuthIdentity title={PRODUCT} brand={<Logo mark="godx-lockup" productSuffix="ID" />} />,
    );
    expect(container.querySelector('[data-slot="logo-lockup"]')!.parentElement).toHaveClass(
      "ui-auth-identity",
    );
  });

  it("keeps the h1 PAINTED — the visible half of gh#652 is not taken here", () => {
    const { container } = render(
      <AuthIdentity title={PRODUCT} brand={<Logo mark="godx-lockup" productSuffix="ID" />} />,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).not.toHaveClass("sr-only");
    expect(heading).toHaveAccessibleName(PRODUCT);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(identityOf(container).textContent).toContain(PRODUCT);
  });

  it("marks a non-element brand decorative too, via the wrapper path", () => {
    const { container } = render(<AuthIdentity title={PRODUCT} brand="ACME" />);
    expect(announcedText(identityOf(container))).toBe(PRODUCT);
  });

  it("measures the shape this exists to prevent: an exposed lockup beside the heading", () => {
    const { container } = render(
      <div>
        <Logo mark="godx-lockup" productSuffix="ID" />
        <Heading level={1}>{PRODUCT}</Heading>
      </div>,
    );
    expect(announcedText(container.firstElementChild as HTMLElement)).toBe("GoDXIDGoDX ID");
  });

  it("keeps the requesting-client line under a consumer lockup", () => {
    render(
      <AuthIdentity
        title={PRODUCT}
        brand={<Logo mark="godx-lockup" productSuffix="ID" />}
        requester="Attendance is requesting sign in"
      />,
    );
    expect(screen.getByText("Attendance is requesting sign in")).toBeInTheDocument();
  });
});
