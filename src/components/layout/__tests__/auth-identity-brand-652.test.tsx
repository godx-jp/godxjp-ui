import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AuthIdentity } from "../auth-identity";
import { Heading, Logo } from "../../general";

/**
 * AuthIdentity `brand` — the consumer's own identity artwork on the auth screen (gh#652).
 *
 * The block hardcoded `<Logo mark="godx">` plus a typeset `<Heading level={1}>`, so the one screen
 * users see first was the only surface that could not carry the product lockup. What is under test
 * is the whole contract of the opening: the artwork swaps, the `h1` survives, and the block still
 * announces the product name EXACTLY ONCE.
 */

/**
 * What an assistive technology would announce for a subtree: its text with every `aria-hidden`
 * branch removed. Measured rather than reasoned about from the markup — the whole point of this
 * file is that the same pixels can be announced once or twice depending on one attribute.
 */
function announcedText(root: HTMLElement): string {
  const clone = root.cloneNode(true) as HTMLElement;
  for (const hidden of clone.querySelectorAll('[aria-hidden="true"]')) hidden.remove();
  return (clone.textContent ?? "").replace(/\s+/gu, " ").trim();
}

/** The canonical hosted-identity title: the h1 IS the product name (docs/layout/auth-shell.tsx). */
const PRODUCT = "GoDX ID";

describe("AuthIdentity brand", () => {
  it("keeps the package mark and the painted h1 when no brand is supplied", () => {
    const { container } = render(<AuthIdentity title={PRODUCT} />);
    const identity = container.querySelector<HTMLElement>('[data-slot="auth-identity"]')!;

    expect(container.querySelector('[data-slot="logo"]')).toHaveAttribute("data-mark", "godx");
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveAccessibleName(PRODUCT);
    expect(heading).not.toHaveClass("sr-only");
    expect(announcedText(identity)).toBe(PRODUCT);
  });

  it("paints the supplied lockup instead of the mark and of the heading text", () => {
    const { container } = render(
      <AuthIdentity title={PRODUCT} brand={<Logo mark="godx-lockup" productSuffix="ID" />} />,
    );

    // The package mark is gone; the consumer's lockup took its place as the artwork child.
    expect(container.querySelector('[data-slot="logo"][data-mark="godx"]')).toBeNull();
    const lockup = container.querySelector('[data-slot="logo-lockup"]')!;
    expect(lockup).toHaveAttribute("data-mark", "godx-lockup");
    // Borrowed, not wrapped: the lockup is the direct flex child of `.ui-auth-identity` itself.
    expect(lockup.parentElement).toHaveClass("ui-auth-identity");

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("sr-only");
    expect(heading).toHaveTextContent(PRODUCT);
  });

  it("still exposes one h1 named by title, and announces the product exactly once", () => {
    const { container } = render(
      <AuthIdentity title={PRODUCT} brand={<Logo mark="godx-lockup" productSuffix="ID" />} />,
    );
    const identity = container.querySelector<HTMLElement>('[data-slot="auth-identity"]')!;

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(PRODUCT);
    expect(container.querySelector('[data-slot="logo-lockup"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(announcedText(identity)).toBe(PRODUCT);
  });

  it("measures the shape that was rejected: an exposed lockup beside a painted heading", () => {
    /*
     * The alternative `mark?: LogoMark` (and any `brand` that left the heading painted) produces
     * THIS. It is rendered here rather than described, because the double announcement is the
     * reason `brand` also takes the painted heading and marks the artwork decorative.
     */
    const { container } = render(
      <div>
        <Logo mark="godx-lockup" productSuffix="ID" />
        <Heading level={1}>{PRODUCT}</Heading>
      </div>,
    );
    expect(announcedText(container.firstElementChild as HTMLElement)).toBe("GoDXIDGoDX ID");
  });

  it("keeps the requesting-client line under a consumer lockup", () => {
    const { container } = render(
      <AuthIdentity
        title={PRODUCT}
        brand={<Logo mark="godx-lockup" productSuffix="ID" />}
        requester="Attendance is requesting sign in"
      />,
    );
    const identity = container.querySelector<HTMLElement>('[data-slot="auth-identity"]')!;

    expect(container.querySelector('[data-slot="auth-requester"]')).toBeInTheDocument();
    // The requester is real content, so it joins the announcement (element boundaries insert no
    // separator in `textContent`); the product name is still there exactly once.
    expect(announcedText(identity)).toBe(`${PRODUCT}Attendance is requesting sign in`);
  });

  it("keeps the brand element's own props while merging aria-hidden onto it", () => {
    const { container } = render(
      <AuthIdentity
        title={PRODUCT}
        brand={<Logo mark="godx-lockup" productSuffix="ID" size="lg" className="probe" />}
      />,
    );
    const lockup = container.querySelector('[data-slot="logo-lockup"]')!;

    expect(lockup).toHaveClass("ui-logo-lockup", "probe");
    expect(lockup).toHaveAttribute("data-size", "lg");
    expect(lockup).toHaveAttribute("aria-hidden", "true");
  });
});
